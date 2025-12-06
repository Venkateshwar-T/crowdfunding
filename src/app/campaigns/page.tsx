'use client';

import { useState, useEffect } from 'react';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ListFilter, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- BLOCKCHAIN IMPORTS ---
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther, type Abi } from 'viem';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import CampaignABI from '@/lib/abi/Campaign.json';
import { type Campaign } from '@/lib/types';

// --- REPLACE WITH YOUR REAL FACTORY ADDRESS ---
const FACTORY_ADDRESS = "0x136Fc40F09eB9f7a51302558D6f290176Af9bB0d"; 

const categories = ['All', 'Tech', 'Medical', 'DeFi', 'Gaming'];
const statuses = ['All', 'active', 'successful', 'expired'];

export default function ExploreCampaignsPage() {
  const { data: campaignAddresses } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FactoryABI as Abi,
    functionName: 'getDeployedCampaigns',
  });

  const campaignsContractConfig = {
    abi: CampaignABI as Abi,
  } as const;

  const addresses = (campaignAddresses as string[]) || [];

  const contracts = addresses.map((addr) => [
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'title' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'imageUrl' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'category' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'currentFundingUSD' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'fundingGoalUSD' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'deadline' },
    { ...campaignsContractConfig, address: addr as `0x${string}`, functionName: 'creator' },
  ]).flat();

  const { data: campaignData, isLoading: isLoadingBlockchain } = useReadContracts({
    contracts: contracts,
    query: { enabled: addresses.length > 0 }
  });

  const [realCampaigns, setRealCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (campaignData && addresses.length > 0) {
      const campaigns: Campaign[] = [];
      
      for (let i = 0; i < addresses.length; i++) {
        const base = i * 7;
        
        if (campaignData[base]?.status === 'success') {
            const currentFundingWei = campaignData[base + 3]?.result as bigint || BigInt(0);
            const goalWei = campaignData[base + 4]?.result as bigint || BigInt(0);
            const deadlineSeconds = Number(campaignData[base + 5]?.result || 0);

            campaigns.push({
                id: addresses[i],
                title: campaignData[base].result as string || "Untitled",
                description: "Blockchain Campaign",
                imageUrl: campaignData[base + 1].result as string || "https://placehold.co/600x400",
                imageHint: "blockchain project",
                category: (campaignData[base + 2].result as string || "Tech") as Campaign['category'],
                currentFunding: Number(formatEther(currentFundingWei)),
                fundingGoal: Number(formatEther(goalWei)),
                deadline: new Date(deadlineSeconds * 1000).toISOString(),
                creator: { 
                    id: "creator-chain",
                    name: (campaignData[base + 6].result as string)?.slice(0, 6) + "...", 
                    avatarUrl: "https://placehold.co/100", 
                    isVerified: false 
                },
                status: 'active', // This would need more complex logic to determine status
                acceptedAssets: [], 
                milestones: [],
                requiresFdc: false
            });
        }
      }
      setRealCampaigns(campaigns);
    }
  }, [campaignData, addresses]);


  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [requiresFdc, setRequiresFdc] = useState(false);
  const [sortBy, setSortBy] = useState('trending');

  const filteredCampaigns = realCampaigns
    .filter((campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((campaign) =>
      category === 'All' ? true : campaign.category === category
    )
    .filter((campaign) =>
      status === 'All' ? true : campaign.status === status
    )
    .filter((campaign) =>
      requiresFdc ? campaign.requiresFdc === true : true
    )
    .sort((a, b) => {
        switch (sortBy) {
            case 'latest':
                return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
            case 'goal':
                return b.fundingGoal - a.fundingGoal;
            case 'trending':
            default:
                const aPercent = a.fundingGoal > 0 ? a.currentFunding / a.fundingGoal : 0;
                const bPercent = b.fundingGoal > 0 ? b.currentFunding / b.fundingGoal : 0;
                return bPercent - aPercent;
        }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Campaigns</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and support the next wave of innovation on the Flare Network.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <ListFilter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup value={category} onValueChange={setCategory}>
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat} id={`cat-${cat}`} />
                      <Label htmlFor={`cat-${cat}`}>{cat}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fdc-verified"
                  checked={requiresFdc}
                  onCheckedChange={(checked) => setRequiresFdc(!!checked)}
                />
                <Label htmlFor="fdc-verified">Verified Creator (FDC)</Label>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="sort-by">Sort by</Label>
                     <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="sort-by" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="goal">Funding Goal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          
          {isLoadingBlockchain && (
             <div className="w-full flex justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading Blockchain Data...
             </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {filteredCampaigns.length === 0 && !isLoadingBlockchain && (
            <div className="text-center py-16 col-span-full">
                <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
