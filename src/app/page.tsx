'use client';

import Link from 'next/link';
import { ArrowRight, Cpu, Droplets, Fingerprint, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { GlassContainer } from '@/components/shared/GlassContainer';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther, type Abi } from 'viem';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import CampaignABI from '@/lib/abi/Campaign.json';
import { useEffect, useMemo, useState } from 'react';
import { type Campaign } from '@/lib/types';


const FACTORY_ADDRESS = "0x136Fc40F09eB9f7a51302558D6f290176Af9bB0d"; 

const featureCards = [
  {
    icon: <Droplets className="h-8 w-8 text-primary" />,
    title: 'FAssets',
    description: 'Use non-smart contract assets like BTC, XRP, and DOGE in your campaigns, powered by Flare.',
  },
  {
    icon: <Fingerprint className="h-8 w-8 text-primary" />,
    title: 'Flare DID (FDC)',
    description: 'Build trust with verifiable on-chain identity, ensuring transparency and security for backers.',
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: 'FTSO',
    description: 'Access reliable, real-time price data for all assets, ensuring fair and accurate funding calculations.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Smart Accounts',
    description: 'Each campaign gets a smart account for decentralized, rule-based fund management.',
  },
];

function FeaturedCampaigns() {
  const { data: campaignAddresses } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FactoryABI as Abi,
    functionName: 'getDeployedCampaigns',
  });

  const campaignsContractConfig = {
    abi: CampaignABI as Abi,
  } as const;
  
  const addresses = useMemo(() => {
    return ((campaignAddresses as string[]) || []).slice(-5).reverse();
  }, [campaignAddresses]);

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
                status: 'active',
                acceptedAssets: [], 
                milestones: [],
                requiresFdc: false
            });
        }
      }
      setRealCampaigns(campaigns);
    }
  }, [campaignData, addresses]);

  if (isLoadingBlockchain) {
    return (
      <div className="w-full flex justify-center py-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading Latest Campaigns...
      </div>
    );
  }

  if (realCampaigns.length === 0) {
    return (
       <div className="text-center py-16 col-span-full">
          <p className="text-muted-foreground">No featured campaigns available yet. Be the first to create one!</p>
      </div>
    )
  }

  return (
     <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {realCampaigns.map((campaign) => (
            <CarouselItem key={campaign.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <CampaignCard campaign={campaign} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-14" />
        <CarouselNext className="mr-14" />
      </Carousel>
  )

}


export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');
  
  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[80vh] text-white">
        {heroImage && (
           <Image
             src={heroImage.imageUrl}
             alt={heroImage.description}
             fill
             className="object-cover"
             priority
             data-ai-hint={heroImage.imageHint}
           />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
            Decentralized Crowdfunding, <br /> Powered by Flare.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80">
            Launch your innovative projects using FAssets like BTC & XRP, secured by the Flare Time Series Oracle.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="font-semibold text-lg py-7 px-8">
              <Link href="/create-campaign">
                Create a Campaign <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-semibold text-lg py-7 px-8">
              <Link href="/campaigns">Explore Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">How CrowdFund Works</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              We leverage the full power of the Flare Network to provide a secure, transparent, and versatile crowdfunding experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feature) => (
              <GlassContainer key={feature.title}>
                <div className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </GlassContainer>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-campaigns" className="py-16 md:py-24 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Campaigns</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Discover and back the most innovative projects on the Flare Network.
            </p>
          </div>
          <FeaturedCampaigns />
        </div>
      </section>
    </div>
  );
}
