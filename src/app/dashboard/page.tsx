'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, Rocket, Zap, Users, Package, CheckCircle } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FileUpload } from "@/components/shared/FileUpload";

// --- WEB3 IMPORTS ---
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther, type Abi } from 'viem';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import CampaignABI from '@/lib/abi/Campaign.json';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

// --- CONFIGURATION ---
const FACTORY_ADDRESS = "0x136Fc40F09eB9f7a51302558D6f290176Af9bB0d"; 
const MOCK_TOKENS: Record<string, string> = {
    'F-BTC': "0x76E4b5DDD42BD84161f7f298D35723FbC576e861",
    'F-XRP': "0xBAf7dE33f98B018055EA5aCDfBDcA9be11780d06",
    'F-USDC': "0x94f41643DB84e373491aE358e24278a562307E30",
};

const unlockedFeatures = [
    {
        icon: <Zap className="h-5 w-5 text-primary" />,
        title: "Gas-Sponsored Transactions",
        description: "The platform can pay for your transaction fees in certain situations."
    },
    {
        icon: <Users className="h-5 w-5 text-primary" />,
        title: "Social Recovery",
        description: "Set trusted friends or devices to help you regain access if you lose your main wallet."
    },
    {
        icon: <Package className="h-5 w-5 text-primary" />,
        title: "Batched Transactions",
        description: "Approve a token and contribute to a campaign in a single, seamless transaction."
    }
];

export default function DashboardPage() {
    const { address: userAddress, isConnected } = useAccount();
    const { user } = useUser();
    const { toast } = useToast();
    const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
    const [myContributions, setMyContributions] = useState<any[]>([]);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);

    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'my-campaigns';

    const { data: campaignAddressesResult } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FactoryABI as Abi,
        functionName: 'getDeployedCampaigns',
    });
    
    const campaignAddresses = (campaignAddressesResult as string[]) || [];

    const campaignConfig = { abi: CampaignABI as Abi } as const;

    const contracts = campaignAddresses.map(addr => [
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'title' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'creator' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'fundingGoalUSD' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'currentFundingUSD' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-BTC']] },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-XRP']] },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-USDC']] },
    ]).flat();

    const { data: results, isLoading } = useReadContracts({
        contracts: contracts,
        query: { enabled: !!campaignAddresses && !!userAddress }
    });

    useEffect(() => {
        if (results && userAddress) {
            const created = [];
            const backed = [];

            for (let i = 0; i < campaignAddresses.length; i++) {
                const base = i * 7;
                const addr = campaignAddresses[i];
                
                const title = results[base]?.result as string;
                const creator = results[base + 1]?.result as string;
                const goal = results[base + 2]?.result ? formatEther(results[base + 2].result as bigint) : '0';
                const current = results[base + 3]?.result ? formatEther(results[base + 3].result as bigint) : '0';
                const btcContrib = results[base + 4]?.result as bigint || 0n;
                const xrpContrib = results[base + 5]?.result as bigint || 0n;
                const usdcContrib = results[base + 6]?.result as bigint || 0n;

                if (creator === userAddress) {
                    created.push({ id: addr, title, goal, current, status: 'active' });
                }

                if (btcContrib > 0n) {
                    backed.push({ id: addr, title, amount: formatEther(btcContrib), asset: 'F-BTC', date: new Date().toISOString() });
                }
                if (xrpContrib > 0n) {
                    backed.push({ id: addr, title, amount: formatEther(xrpContrib), asset: 'F-XRP', date: new Date().toISOString() });
                }
                 if (usdcContrib > 0n) {
                    backed.push({ id: addr, title, amount: formatEther(usdcContrib), asset: 'F-USDC', date: new Date().toISOString() });
                }
            }
            setMyCampaigns(created);
            setMyContributions(backed);
        }
    }, [results, userAddress, campaignAddresses]);

    const handleDeploySmartAccount = () => {
        // This is a mock deployment. In a real scenario, this would
        // call a factory contract to deploy a smart account for the user.
        setIsDeploying(true);
        toast({
            title: "Simulating Deployment",
            description: "Deploying your smart account to the Flare Testnet..."
        });
        setTimeout(() => {
            const mockAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            setSmartAccountAddress(mockAddress);
            setIsDeploying(false);
            toast({
                title: "Smart Account Deployed! ✨",
                description: `Your new smart account address is: ${mockAddress.slice(0,10)}...`,
                className: "bg-green-100 border-green-500 text-green-900"
            });
        }, 3000);
    }

    if (!isConnected || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-semibold mb-4">Please connect your wallet and sign in.</h2>
                <p className="text-muted-foreground">You need to be fully authenticated to view your dashboard.</p>
            </div>
        );
    }

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
                <TabsTrigger value="identity">Identity (FDC)</TabsTrigger>
                <TabsTrigger value="smart-account">Smart Account</TabsTrigger>
            </TabsList>

            <TabsContent value="my-campaigns" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Campaigns</CardTitle>
                        <CardDescription>Campaigns you have created on the Flare Network.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : myCampaigns.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">You haven't created any campaigns yet.</p>
                        ) : (
                            myCampaigns.map(campaign => (
                                <Card key={campaign.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                                <p className="text-xs text-muted-foreground font-mono">{campaign.id}</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/campaigns/${campaign.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <ProgressBar current={Number(campaign.current)} goal={Number(campaign.goal)} />
                                            </div>
                                            <Badge variant="secondary" className="capitalize">Active</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="my-contributions" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Contributions</CardTitle>
                        <CardDescription>Projects you have backed on-chain.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : myContributions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">You haven't contributed to any campaigns yet.</p>
                        ) : (
                            myContributions.map((contribution, idx) => (
                                <Card key={`${contribution.id}-${idx}`}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{contribution.title}</CardTitle>
                                                <CardDescription>Verified On-Chain</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">{contribution.amount}</span>
                                                <Badge variant="outline">{contribution.asset}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="identity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identity Verification (FDC)</CardTitle>
                        <CardDescription>Verify your identity via Flare Data Connector.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="flex items-center justify-between rounded-lg border p-4 bg-yellow-500/10 border-yellow-500/50">
                            <div>
                                <h3 className="font-semibold text-yellow-700">Verification Pending</h3>
                                <p className="text-sm text-yellow-600">You need to submit proof of personhood.</p>
                            </div>
                            <Badge variant="outline" className="text-yellow-700 border-yellow-500">Not Verified</Badge>
                       </div>
                        <div>
                            <Label className="mb-2 block">Upload Identity Document</Label>
                            <FileUpload onFileSelect={() => {}} />
                            <p className="text-xs text-muted-foreground mt-2">
                                * This will generate a Merkle Proof via the FDC attestation provider.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => alert("Verification Submitted to FDC (Mock)")}>Submit Attestation</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            
            <TabsContent value="smart-account" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Account Manager</CardTitle>
                        <CardDescription>Deploy and manage your personal smart account on the Flare Network.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>EOA Controller Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input value={userAddress || ''} readOnly />
                                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(userAddress || '')}><Copy className="h-4 w-4" /></Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">This is your standard wallet that controls the smart account.</p>
                        </div>
                        
                        {smartAccountAddress ? (
                             <div>
                                <div>
                                    <Label>Deployed Smart Account Address</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input value={smartAccountAddress} readOnly />
                                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(smartAccountAddress)}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Your smart account is active on the network.</p>
                                </div>
                                <Card className="mt-6 bg-green-500/5 border-green-500/20">
                                    <CardHeader>
                                        <CardTitle className="text-green-700">Features Unlocked</CardTitle>
                                        <CardDescription className="text-green-700/80">
                                            Your new smart account enables the following platform benefits.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {unlockedFeatures.map(feature => (
                                            <div key={feature.title} className="flex items-start gap-4">
                                                {feature.icon}
                                                <div>
                                                    <h4 className="font-semibold">{feature.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                             </div>
                        ) : (
                             <div className="p-4 bg-muted/50 rounded-lg text-center">
                                <h4 className="font-semibold mb-2">No Smart Account Found</h4>
                                <p className="text-sm text-muted-foreground mb-4">Deploy a new smart account to enable advanced features like gas-less transactions and social recovery.</p>
                                <Button onClick={handleDeploySmartAccount} disabled={isDeploying}>
                                    {isDeploying ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deploying...</>
                                    ) : (
                                        <><Rocket className="mr-2 h-4 w-4" /> Deploy Smart Account</>
                                    )}
                                </Button>
                            </div>
                        )}
                       
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
