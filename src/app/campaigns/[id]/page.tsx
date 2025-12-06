'use client';

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";
import { Loader2 } from "lucide-react";

// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Shared Components
import { FAssetIcon } from "@/components/shared/FAssetIcon";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PriceTicker } from "@/components/shared/PriceTicker";

// Data & Types
import { mockPriceFeeds } from "@/lib/mock-data";
import { type Campaign } from "@/lib/types";

// Blockchain
import { useReadContracts, useWriteContract } from "wagmi";
import CampaignABI from '@/lib/abi/Campaign.json';
import { type Abi, formatEther, parseEther } from "viem";

// --- CONFIGURATION ---
// MUST MATCH YOUR CREATE PAGE CONFIG
const MOCK_TOKENS: Record<string, string> = {
    'F-BTC': "0x76E4b5DDD42BD84161f7f298D35723FbC576e861", // Replace with your REAL addresses
    'F-XRP': "0xBAf7dE33f98B018055EA5aCDfBDcA9be11780d06",
    'F-DOGE': "0x0000000000000000000000000000000000000000",
    'F-LTC': "0x0000000000000000000000000000000000000000",
    'F-USDC': "0x94f41643DB84e373491aE358e24278a562307E30",
};

// Minimal ERC20 ABI for Approval
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
] as const;

export default function CampaignDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; 
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  
  // Contribution State
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // --- BLOCKCHAIN DATA FETCHING ---
  const isBlockchainId = id?.startsWith('0x');
  
  const campaignContractConfig = {
    abi: CampaignABI as Abi,
    address: isBlockchainId ? (id as `0x${string}`) : undefined
  } as const;

  const { data: campaignData, isLoading: isLoadingBlockchain } = useReadContracts({
    contracts: [
      { ...campaignContractConfig, functionName: 'title' },
      { ...campaignContractConfig, functionName: 'imageUrl' },
      { ...campaignContractConfig, functionName: 'category' },
      { ...campaignContractConfig, functionName: 'currentFundingUSD' },
      { ...campaignContractConfig, functionName: 'fundingGoalUSD' },
      { ...campaignContractConfig, functionName: 'deadline' },
      { ...campaignContractConfig, functionName: 'creator' },
      { ...campaignContractConfig, functionName: 'description' },
      { ...campaignContractConfig, functionName: 'getDetails' }, 
    ],
    query: { enabled: !!isBlockchainId }
  });

  // --- WRITE HOOKS ---
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (!id) return;

    // Blockchain Data is the source of truth
    if (isBlockchainId && campaignData) {
        const [titleRes, imgRes, catRes, currRes, goalRes, deadRes, creatorRes, descRes, detailsRes] = campaignData;

        if (titleRes?.status === 'success') {
             const acceptedTickers = (detailsRes?.result as any)?.[4] || [];
             const acceptedAssets = acceptedTickers.map((ticker: string) => ({ 
                symbol: ticker, 
                name: `Flare ${ticker.replace('F-', '')}` 
            }));

            setCampaign({
                id: id,
                title: titleRes.result as string,
                description: (descRes?.result as string) || "No description.",
                imageUrl: (imgRes?.result as string) || "https://placehold.co/600x400",
                imageHint: "blockchain project",
                category: (catRes?.result as any) || "Tech",
                currentFunding: Number(formatEther((currRes?.result as bigint) || 0n)),
                fundingGoal: Number(formatEther((goalRes?.result as bigint) || 0n)),
                deadline: new Date(Number(deadRes?.result || 0) * 1000).toISOString(),
                creator: {
                    id: "creator-chain",
                    name: (creatorRes?.result as string)?.slice(0, 8) + "...",
                    avatarUrl: "https://placehold.co/100",
                    isVerified: false
                },
                status: 'active',
                acceptedAssets: acceptedAssets,
                milestones: [], 
                requiresFdc: false,
            });
            // Default to first asset if not set
            if (acceptedAssets.length > 0 && !selectedAssetSymbol) {
                 setSelectedAssetSymbol(acceptedAssets[0].symbol);
            }
        } else {
            // Only set to null if we are sure the call failed (avoid flickering)
            if (!isLoadingBlockchain) setCampaign(null);
        }
    }
  }, [campaignData, id, isBlockchainId, isLoadingBlockchain, selectedAssetSymbol]);

  // --- HANDLE CONTRIBUTE ---
  const handleContribute = async () => {
    if (!amount || !selectedAssetSymbol || !id) return;
    
    const assetAddress = MOCK_TOKENS[selectedAssetSymbol];
    if (!assetAddress || assetAddress.startsWith("0x000")) {
        toast({ title: "Configuration Error", description: `No contract address found for ${selectedAssetSymbol}`, variant: "destructive" });
        return;
    }

    try {
        const amountWei = parseEther(amount); 

        // Step 1: Approve
        setIsApproving(true);
        toast({ title: "Step 1/2: Approving", description: `Please sign the transaction to approve usage of ${selectedAssetSymbol}.` });
        
        await writeContractAsync({
            address: assetAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [id as `0x${string}`, amountWei]
        });
        
        toast({ title: "Approved!", description: "Now please confirm the donation." });
        setIsApproving(false);

        // Step 2: Contribute
        await writeContractAsync({
            address: id as `0x${string}`,
            abi: CampaignABI as Abi,
            functionName: 'contribute',
            args: [assetAddress, amountWei]
        });

        toast({ title: "Success!", description: "Contribution sent to the blockchain.", className: "bg-green-100 border-green-500 text-green-900" });
        setAmount('');
        
    } catch (e: any) {
        console.error(e);
        toast({ title: "Failed", description: e.shortMessage || e.message, variant: "destructive" });
        setIsApproving(false);
    }
  };


  if (!id || (isBlockchainId && isLoadingBlockchain) || campaign === undefined) {
    return <div className="w-full h-[80vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (campaign === null) return (
    <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Campaign Not Found</h1>
        <Button asChild className="mt-4"><Link href="/campaigns">Back</Link></Button>
    </div>
  );

  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());
  const priceFeed = mockPriceFeeds.find(f => f.asset === selectedAssetSymbol);
  const estUsdValue = priceFeed && amount ? (Number(amount) * priceFeed.price).toFixed(2) : "0.00";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg border">
              <Image src={campaign.imageUrl} alt={campaign.title} fill className="object-cover" />
            </div>
            <Tabs defaultValue="story" className="w-full">
              <TabsList>
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
              </TabsList>
              <TabsContent value="story">
                <Card>
                  <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                    <p>{campaign.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="milestones">
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Milestones are managed on-chain.
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div>
                <Badge variant="secondary">{campaign.category}</Badge>
                <h1 className="font-headline text-3xl font-bold mt-2">{campaign.title}</h1>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <span>Created by</span>
                  <span className="font-semibold text-foreground flex items-center gap-2">
                      <Avatar className="h-6 w-6"><AvatarFallback>CR</AvatarFallback></Avatar>
                      {campaign.creator.name}
                  </span>
                </div>
              </div>

              <Card>
                  <CardContent className="pt-6">
                      <ProgressBar current={campaign.currentFunding} goal={campaign.fundingGoal} />
                      <div className="grid grid-cols-3 gap-4 text-center mt-4">
                            <div><p className="text-2xl font-bold">${campaign.currentFunding.toLocaleString()}</p><p className="text-xs text-muted-foreground">Raised</p></div>
                            <div><p className="text-2xl font-bold">${campaign.fundingGoal.toLocaleString()}</p><p className="text-xs text-muted-foreground">Goal</p></div>
                            <div><p className="text-2xl font-bold">{daysLeft}</p><p className="text-xs text-muted-foreground">Days Left</p></div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="border-primary/20 shadow-md">
                <CardHeader><CardTitle>Contribute</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Asset</label>
                    <Select value={selectedAssetSymbol} onValueChange={setSelectedAssetSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Token" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaign.acceptedAssets.map(a => (
                          <SelectItem key={a.symbol} value={a.symbol}>
                            <div className="flex items-center gap-2">
                              <FAssetIcon asset={a.symbol as any} /> {a.symbol}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="pr-16"
                          />
                          <div className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                            {selectedAssetSymbol}
                          </div>
                        </div>
                        <p className="text-xs text-right text-muted-foreground">≈ ${estUsdValue} USD</p>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleContribute} disabled={isApproving || !amount}>
                    {isApproving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Approving...</> : "Donate Now"}
                  </Button>
                </CardContent>
              </Card>

              {priceFeed && <PriceTicker feed={priceFeed} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
