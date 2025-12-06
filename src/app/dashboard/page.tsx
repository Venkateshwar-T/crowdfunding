'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FileUpload } from "@/components/shared/FileUpload";

// --- WEB3 IMPORTS ---
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import CampaignABI from '@/lib/abi/Campaign.json';

// --- CONFIGURATION (PASTE YOUR ADDRESSES HERE) ---
const FACTORY_ADDRESS = "0x136Fc40F09eB9f7a51302558D6f290176Af9bB0d"; 
const MOCK_TOKENS: Record<string, string> = {
    'F-BTC': "0x76E4b5DDD42BD84161f7f298D35723FbC576e861",
    'F-XRP': "0xBAf7dE33f98B018055EA5aCDfBDcA9be11780d06",
};

export default function DashboardPage() {
    const { address: userAddress, isConnected } = useAccount();
    const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
    const [myContributions, setMyContributions] = useState<any[]>([]);

    // 1. Get list of all campaigns
    const { data: campaignAddresses } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FactoryABI,
        functionName: 'getDeployedCampaigns',
    });

    // 2. Prepare bulk reads
    const campaignConfig = { abi: CampaignABI } as const;
    const allAddresses = (campaignAddresses as string[]) || [];

    // We need to fetch Creator and Title for "My Campaigns"
    // And check Contributions for "My Contributions"
    const contracts = allAddresses.map(addr => [
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'title' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'creator' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'fundingGoalUSD' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'currentFundingUSD' },
        // Check contribution balance for F-BTC
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-BTC']] },
        // Check contribution balance for F-XRP
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-XRP']] },
    ]).flat();

    const { data: results, isLoading } = useReadContracts({
        contracts: contracts,
        query: { enabled: !!campaignAddresses && !!userAddress }
    });

    // 3. Process Data
    useEffect(() => {
        if (results && userAddress) {
            const created = [];
            const backed = [];

            // Results come in chunks of 6 per campaign
            for (let i = 0; i < allAddresses.length; i++) {
                const base = i * 6;
                const addr = allAddresses[i];
                
                // Safe extraction
                const title = results[base]?.result as string;
                const creator = results[base + 1]?.result as string;
                const goal = results[base + 2]?.result ? formatEther(results[base + 2].result as bigint) : '0';
                const current = results[base + 3]?.result ? formatEther(results[base + 3].result as bigint) : '0';
                const btcContrib = results[base + 4]?.result as bigint || 0n;
                const xrpContrib = results[base + 5]?.result as bigint || 0n;

                // "My Campaigns" Logic
                if (creator === userAddress) {
                    created.push({ id: addr, title, goal, current, status: 'active' });
                }

                // "My Contributions" Logic
                if (btcContrib > 0n) {
                    backed.push({ id: addr, title, amount: formatEther(btcContrib), asset: 'F-BTC', date: new Date().toISOString() });
                }
                if (xrpContrib > 0n) {
                    backed.push({ id: addr, title, amount: formatEther(xrpContrib), asset: 'F-XRP', date: new Date().toISOString() });
                }
            }
            setMyCampaigns(created);
            setMyContributions(backed);
        }
    }, [results, userAddress, allAddresses]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-semibold mb-4">Please connect your wallet</h2>
                <p className="text-muted-foreground">You need to connect your wallet to view your dashboard.</p>
            </div>
        );
    }

    return (
        <Tabs defaultValue="my-campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
                <TabsTrigger value="identity">Identity (FDC)</TabsTrigger>
                <TabsTrigger value="smart-account">Smart Account</TabsTrigger>
            </TabsList>

            {/* --- MY CAMPAIGNS TAB --- */}
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

            {/* --- MY CONTRIBUTIONS TAB --- */}
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

            {/* --- IDENTITY TAB (Mock for Hackathon) --- */}
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
            
            {/* --- SMART ACCOUNT TAB --- */}
            <TabsContent value="smart-account" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Account Manager</CardTitle>
                        <CardDescription>Your connected wallet is your controller.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Connected Wallet Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input value={userAddress || ''} readOnly />
                                <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                Assets on Flare
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>C2FLR (Gas):</div>
                                <div className="font-mono">Active</div>
                                <div>F-BTC (Mock):</div>
                                <div className="font-mono">{MOCK_TOKENS['F-BTC']?.slice(0,6)}...</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
    