'use client';

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";
import { Loader2 } from "lucide-react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { type Campaign, type Creator } from "@/lib/types";
import { useUser } from '@/firebase';

// Blockchain
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import CampaignABI from '@/lib/abi/Campaign.json';
import { type Abi, formatEther, parseEther } from "viem";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FACTORY_ADDRESS, MOCK_TOKENS } from '@/lib/constants';

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

// A simple in-memory cache to store address-to-user mappings
const userCache = new Map<string, FirebaseUser>();

async function getFirebaseUserByAddress(address: string): Promise<FirebaseUser | null> {
    if (userCache.has(address)) {
        return userCache.get(address) || null;
    }
    // In a real app, you would have a backend service to resolve address to a user ID.
    // For this demo, we'll simulate this by finding the first user.
    // This is NOT a secure or scalable approach.
    const { auth } = initializeFirebase();
    if (!auth) return null;

    // This is a placeholder. A real implementation would query a database
    // that maps wallet addresses to Firebase UIDs.
    // Since we can't do that securely on the client, we'll use the currently logged-in user
    // if their address matches. For others, we can't resolve the name.
    
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            // This is a big simplification. A real app needs a backend to map addresses to UIDs.
            // We're just checking if the *current* user is the creator.
            // We can't look up arbitrary users by address from the client.
            if (user) {
                 // In a real app, you would have stored the user's wallet address in their profile
                 // for this lookup. We are assuming the current user is the creator for demo purposes.
                 userCache.set(address, user);
                 resolve(user);
            } else {
                 resolve(null);
            }
        });
    });
}


export default function CampaignDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; 
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [creatorInfo, setCreatorInfo] = useState<Creator | null>(null);
  
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

  // Effect to process blockchain data
  useEffect(() => {
    if (!id || !isBlockchainId || !campaignData) return;

    const [titleRes, imgRes, catRes, currRes, goalRes, deadRes, creatorRes, descRes, detailsRes] = campaignData;

    if (titleRes?.status === 'success' && creatorRes?.status === 'success') {
        const acceptedTickers = (detailsRes?.result as any)?.[4] || [];
        const acceptedAssets = acceptedTickers.map((ticker: string) => ({ 
            symbol: ticker, 
            name: `Flare ${ticker.replace('F-', '')}` 
        }));

        const creatorAddress = creatorRes.result as string;

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
            creator: { // This will be replaced by creatorInfo state
                id: creatorAddress,
                name: creatorAddress.slice(0, 8) + "...",
                avatarUrl: "https://placehold.co/100",
                isVerified: false
            },
            status: 'active',
            acceptedAssets: acceptedAssets,
            milestones: [], 
            requiresFdc: false,
        });
        
        if (acceptedAssets.length > 0 && !selectedAssetSymbol) {
             setSelectedAssetSymbol(acceptedAssets[0].symbol);
        }
    } else if (!isLoadingBlockchain) {
        setCampaign(null);
    }
  }, [campaignData, id, isBlockchainId, isLoadingBlockchain, selectedAssetSymbol]);

  // Effect to fetch Firebase user info for the creator
  useEffect(() => {
    if (campaign?.creator.id) {
        const creatorAddress = campaign.creator.id;
        
        // This is a simplified lookup. In a real app, you'd query a backend.
        // We check if the currently logged-in user is the creator.
        if (currentUser && currentUser.providerData?.[0]?.uid) {
             // This is a mock association. A real app needs to store the wallet address
             // with the user profile upon registration to perform this lookup.
             // For now, we assume the creator is the currently logged in user for display purposes.
             setCreatorInfo({
                 id: creatorAddress,
                 name: currentUser.displayName || "Anonymous Creator",
                 avatarUrl: currentUser.photoURL || "https://placehold.co/100",
                 isVerified: currentUser.emailVerified // Example verification
             });
        } else {
            // Fallback if we can't find a Firebase user
            setCreatorInfo({
                id: creatorAddress,
                name: creatorAddress.slice(0, 8) + "...",
                avatarUrl: "https://placehold.co/100",
                isVerified: false,
            });
        }
    }
  }, [campaign?.creator.id, currentUser]);


  // --- HANDLE CONTRIBUTE ---
  const handleContribute = async () => {
    if (!isConnected) {
        openConnectModal?.();
        return;
    }
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

  const finalCreator = creatorInfo || campaign.creator;
  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());
  const priceFeed = mockPriceFeeds.find(f => f.asset === selectedAssetSymbol);
  const estUsdValue = priceFeed && amount ? (Number(amount) * priceFeed.price).toFixed(2) : "0.00";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary">{campaign.category}</Badge>
              <h1 className="font-headline text-4xl font-bold">{campaign.title}</h1>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Created by</span>
                    <span className="font-semibold text-foreground flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={finalCreator.avatarUrl} alt={finalCreator.name} />
                            <AvatarFallback>{finalCreator.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {finalCreator.name}
                    </span>
                </div>
            </div>

            <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg border">
              <Image src={campaign.imageUrl} alt={campaign.title} fill className="object-cover" />
            </div>

            <Tabs defaultValue="story" className="w-full">
              <TabsList>
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
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
              <TabsContent value="updates">
                  <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                      No updates yet.
                      </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="relative">
             <div className="lg:sticky lg:top-24 space-y-6">
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
                      {isApproving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Approving...</> : (isConnected ? 'Donate Now' : 'Connect Wallet to Donate')}
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
