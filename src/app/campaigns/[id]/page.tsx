
'use client';

import { mockCampaigns, mockPriceFeeds } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { FAssetIcon } from "@/components/shared/FAssetIcon";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Target, Calendar, CheckCircle, GitCommit, FileText, Loader2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceTicker } from "@/components/shared/PriceTicker";
import { Input } from "@/components/ui/input";
import { FtsoPriceGuidance } from "@/components/campaign/FtsoPriceGuidance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useReadContracts } from "wagmi";
import CampaignABI from '@/lib/abi/Campaign.json';
import { type Abi, formatEther } from "viem";
import { type Campaign } from "@/lib/types";
import { useEffect, useState } from "react";

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);

  // --- BLOCKCHAIN DATA FETCHING ---
  const campaignContractConfig = {
    abi: CampaignABI as Abi,
    address: id as `0x${string}`
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
      { ...campaignContractConfig, functionName: 'getDetails' }, // Fetches tickers
    ],
    query: { enabled: id.startsWith('0x') } // Only run for blockchain addresses
  });

  useEffect(() => {
    let foundCampaign = mockCampaigns.find((c) => c.id === id) || null;

    if (!foundCampaign && campaignData) {
        // Transform blockchain data into app format
        const [
            title, imageUrl, category, currentFundingUSD, fundingGoalUSD,
            deadline, creator, description, details
        ] = campaignData;

        if (title.status === 'success') {
             const currentFundingWei = (currentFundingUSD?.result as bigint) || BigInt(0);
             const goalWei = (fundingGoalUSD?.result as bigint) || BigInt(0);
             const deadlineSeconds = Number(deadline?.result || 0);
             const acceptedTickers = (details?.result as any)?.[4] || [];

            foundCampaign = {
                id: id,
                title: title.result as string || "Untitled",
                description: description.result as string || "Blockchain Campaign Description",
                imageUrl: imageUrl.result as string || "https://placehold.co/600x400",
                imageHint: "blockchain project",
                category: (category.result as string || "Tech") as Campaign['category'],
                currentFunding: Number(formatEther(currentFundingWei)),
                fundingGoal: Number(formatEther(goalWei)),
                deadline: new Date(deadlineSeconds * 1000).toISOString(),
                creator: {
                    id: "creator-chain",
                    name: (creator.result as string)?.slice(0, 6) + "...",
                    avatarUrl: "https://placehold.co/100",
                    isVerified: false
                },
                status: 'active',
                acceptedAssets: acceptedTickers.map((ticker: string) => ({ symbol: ticker, name: `Flare ${ticker.split('-')[1]}` })),
                milestones: [], // Milestones would need separate contract logic
                requiresFdc: false, // This would also need to be fetched
            };
        }
    }
     setCampaign(foundCampaign);
  }, [campaignData, id]);

  if (isLoadingBlockchain || campaign === undefined) {
    return (
        <div className="w-full h-[80vh] flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
  }

  if (!campaign) {
    notFound();
  }

  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());
  const primaryAsset = campaign.acceptedAssets[0];
  const priceFeed = primaryAsset ? mockPriceFeeds.find(f => f.asset === primaryAsset.symbol) : undefined;

  const stats = [
    { label: "Backers", value: campaign.currentFunding > 0 ? ((campaign.currentFunding / 50) + 15).toFixed(0) : 0, icon: Users },
    { label: "Goal", value: `$${campaign.fundingGoal.toLocaleString()}`, icon: Target },
    { label: "Days to go", value: daysLeft > 0 ? daysLeft : 0, icon: Clock },
  ];

  const transactions = [
    { hash: "0x12..ef", from: "0xab..cd", amount: "50 F-XRP", date: "2h ago" },
    { hash: "0x34..ab", from: "0xef..12", amount: "0.01 F-BTC", date: "5h ago" },
    { hash: "0x56..56", from: "0xcd..ab", amount: "100 F-XRP", date: "1d ago" },
    { hash: "0x78..34", from: "0x12..ef", amount: "0.005 F-BTC", date: "2d ago" },
  ];

  return (
    <div className="bg-background/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                fill
                className="object-cover"
                data-ai-hint={campaign.imageHint}
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
                    {campaign.acceptedAssets.map(asset => (
                        <Badge key={asset.symbol} variant="outline" className="gap-1.5 pl-2">
                            <FAssetIcon asset={asset.symbol as any} />
                            {asset.symbol}
                        </Badge>
                    ))}
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
                    {campaign.id.startsWith('0x') ? null : (
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper.
                        </p>
                    )}
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
                    )) : <p className="text-muted-foreground text-center pt-8">No milestones defined for this campaign.</p>}
                 </div>
              </TabsContent>
              <TabsContent value="updates" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Proof-of-Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No updates posted by the creator yet.</p>
                        {/* UI for creator to upload would go here */}
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
                            <p className="text-sm text-muted-foreground text-center">~ $0.00 USD</p>
                            <Button className="w-full" size="lg">Contribute</Button>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">This campaign is not accepting any assets.</p>
                    )}
                </CardContent>
            </Card>

            {priceFeed && <PriceTicker feed={priceFeed} />}

            {priceFeed && <FtsoPriceGuidance assetName={priceFeed.asset} currentPrice={priceFeed.price} fundingGoal={campaign.fundingGoal} />}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transaction History</CardTitle>
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
                        {transactions.map(tx => (
                             <TableRow key={tx.hash}>
                                <TableCell className="font-mono font-sm"><Link href="#" className="underline">{tx.hash}</Link></TableCell>
                                <TableCell>{tx.amount}</TableCell>
                                <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                            </TableRow>
                        ))}
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
