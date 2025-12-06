'use client';

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";
import { 
  Clock, Users, Target, Calendar, CheckCircle, 
  GitCommit, FileText, Loader2, AlertTriangle 
} from "lucide-react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Shared Components
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { FAssetIcon } from "@/components/shared/FAssetIcon";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { PriceTicker } from "@/components/shared/PriceTicker";
import { FtsoPriceGuidance } from "@/components/campaign/FtsoPriceGuidance";

// Data & Types
import { mockCampaigns, mockPriceFeeds } from "@/lib/mock-data";
import { type Campaign } from "@/lib/types";

// Blockchain
import { useReadContracts } from "wagmi";
import CampaignABI from '@/lib/abi/Campaign.json';
import { type Abi, formatEther } from "viem";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);

  // --- BLOCKCHAIN DATA FETCHING ---
  const isBlockchainId = id?.startsWith('0x');
  
  const campaignContractConfig = {
    abi: CampaignABI as Abi,
    address: isBlockchainId ? (id as `0x${string}`) : undefined,
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
    query: { 
        enabled: !!isBlockchainId 
    }
  });

  useEffect(() => {
    if (!id) return;

    const mockFound = mockCampaigns.find((c) => c.id === id);
    if (mockFound) {
        setCampaign(mockFound);
        return;
    }

    if (isBlockchainId && campaignData) {
        const [
            titleRes, imgRes, catRes, currRes, goalRes, 
            deadRes, creatorRes, descRes, detailsRes
        ] = campaignData;

        if (titleRes?.status === 'success') {
             const currentFundingWei = (currRes?.result as bigint) || BigInt(0);
             const goalWei = (goalRes?.result as bigint) || BigInt(0);
             const deadlineSeconds = Number(deadRes?.result || 0);
             const acceptedTickers = (detailsRes?.result as any)?.[4] || [];

            const foundCampaign: Campaign = {
                id: id,
                title: titleRes.result as string || "Untitled Campaign",
                description: (descRes?.result as string) || "No description provided.",
                imageUrl: (imgRes?.result as string) || "https://placehold.co/600x400",
                imageHint: "blockchain project",
                category: (catRes?.result as any) || "Tech",
                currentFunding: Number(formatEther(currentFundingWei)),
                fundingGoal: Number(formatEther(goalWei)),
                deadline: new Date(deadlineSeconds * 1000).toISOString(),
                creator: {
                    id: "creator-chain",
                    name: (creatorRes?.result as string)?.slice(0, 8) + "...",
                    avatarUrl: "https://placehold.co/100",
                    isVerified: false
                },
                status: 'active',
                acceptedAssets: acceptedTickers.map((ticker: string) => ({ 
                    symbol: ticker, 
                    name: `Flare ${ticker.replace('F-', '')}` 
                })),
                milestones: [], 
                requiresFdc: false,
            };
            setCampaign(foundCampaign);
        } else {
            setCampaign(null);
        }
    } else if (isBlockchainId && !isLoadingBlockchain && !campaignData) {
        setCampaign(null);
    }
  }, [campaignData, id, isBlockchainId, isLoadingBlockchain]);

  // --- LOADING STATES ---
  if (campaign === undefined) {
    return (
        <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading Campaign Details...</p>
        </div>
    );
  }

  // --- NOT FOUND STATE ---
  if (campaign === null) {
    return (
        <div className="container mx-auto py-20 text-center">
            <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">
                We couldn't find a campaign with ID: <span className="font-mono bg-muted px-2 py-1 rounded">{id}</span>
            </p>
            <Button asChild>
                <Link href="/campaigns">Back to Explore</Link>
            </Button>
        </div>
    );
  }

  // --- RENDER CAMPAIGN ---
  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());
  const primaryAsset = campaign.acceptedAssets?.[0];
  const priceFeed = primaryAsset ? mockPriceFeeds.find(f => f.asset === primaryAsset.symbol) : undefined;

  const stats = [
    { label: "Backers", value: campaign.currentFunding > 0 ? ((campaign.currentFunding / 50) + 15).toFixed(0) : "0", icon: Users },
    { label: "Goal", value: `$${campaign.fundingGoal.toLocaleString()}`, icon: Target },
    { label: "Days to go", value: daysLeft > 0 ? daysLeft : 0, icon: Clock },
  ];

  return (
    <div className="bg-background/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg border">
              <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">{campaign.category}</Badge>
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{campaign.title}</h1>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={campaign.creator.avatarUrl} />
                        <AvatarFallback>{campaign.creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{campaign.creator.name}</p>
                        <VerifiedBadge isVerified={campaign.creator.isVerified} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Accepting:</span>
                    {campaign.acceptedAssets.length > 0 ? campaign.acceptedAssets.map(asset => (
                        <Badge key={asset.symbol} variant="outline" className="gap-1.5 pl-2">
                            <FAssetIcon asset={asset.symbol as any} />
                            {asset.symbol}
                        </Badge>
                    )) : <span className="text-sm text-muted-foreground italic">No assets listed</span>}
                </div>
            </div>
            <div className="mt-6 flex-grow flex flex-col justify-end">
                 <Card>
                    <CardContent className="pt-6">
                        <ProgressBar current={campaign.currentFunding} goal={campaign.fundingGoal} />
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            {stats.map(stat => (
                                <div key={stat.label}>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="story" className="w-full">
              <TabsList>
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              <TabsContent value="story" className="mt-6">
                <Card>
                  <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                    <p>{campaign.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="milestones" className="mt-6">
                 <div className="space-y-6">
                    {campaign.milestones.length > 0 ? campaign.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex items-start gap-4">
                             <div className="flex flex-col items-center">
                                <div className={cn("rounded-full h-10 w-10 flex items-center justify-center", milestone.status === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    {milestone.status === 'completed' ? <CheckCircle className="h-6 w-6"/> : <GitCommit className="h-6 w-6"/>}
                                </div>
                                {index < campaign.milestones.length - 1 && <div className="w-px h-16 bg-border"></div>}
                            </div>
                            <Card className="flex-1">
                                <CardHeader>
                                    <CardTitle>{milestone.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-3">{milestone.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Target: {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No milestones set for this campaign.
                        </div>
                    )}
                 </div>
              </TabsContent>
              <TabsContent value="updates" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Proof-of-Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No updates posted by the creator yet.</p>
                    </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Fund This Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {primaryAsset ? (
                        <>
                            <div className="flex items-center gap-2">
                                <FAssetIcon asset={primaryAsset.symbol as any} className="h-6 w-6" />
                                <Input type="number" placeholder="0.00" className="text-lg" />
                                <span className="font-semibold">{primaryAsset.symbol}</span>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                ~ $0.00 USD (Using FTSO)
                            </p>
                            <Button className="w-full" size="lg">Contribute</Button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted-foreground">This campaign is currently not accepting funds.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {priceFeed && <PriceTicker feed={priceFeed} />}

            {priceFeed && <FtsoPriceGuidance assetName={priceFeed.asset} currentPrice={priceFeed.price} fundingGoal={campaign.fundingGoal} />}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tx</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                No transactions yet.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                 </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

    