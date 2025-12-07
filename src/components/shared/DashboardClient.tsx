
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FileUpload } from "@/components/shared/FileUpload";

// --- WEB3 IMPORTS ---
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, type Abi } from 'viem';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import CampaignABI from '@/lib/abi/Campaign.json';
import FdcABI from '@/lib/abi/MockFdcVerifier.json';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { FACTORY_ADDRESS, MOCK_TOKENS, FDC_VERIFIER_ADDRESS } from '@/lib/constants';
import { TransactionHistory } from '@/components/shared/TransactionHistory';
import { type Contribution } from '@/lib/types';


export function DashboardClient() {
    const { address: userAddress, isConnected } = useAccount();
    const { user } = useUser(); // Optional: Depends on your auth requirement
    const { toast } = useToast();
    const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
    const [myContributions, setMyContributions] = useState<Contribution[]>([]);
    
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'my-campaigns';

    // 1. READ: Get All Campaigns
    const { data: campaignAddressesResult } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FactoryABI as Abi,
        functionName: 'getDeployedCampaigns',
    });
    
    // 2. READ: Check FDC Verification Status
    const { data: isFdcVerified, refetch: refetchFdc } = useReadContract({
        address: FDC_VERIFIER_ADDRESS as `0x${string}`,
        abi: FdcABI as Abi,
        functionName: 'checkVerification',
        args: [userAddress],
        query: { enabled: !!userAddress }
    });

    // 3. WRITE: Submit FDC Attestation
    const { writeContract: submitAttestation, data: attestationHash, isPending: isAttesting } = useWriteContract();
    
    const { isSuccess: isAttestationConfirmed } = useWaitForTransactionReceipt({
        hash: attestationHash
    });

    // Refresh FDC status when transaction confirms
    useEffect(() => {
        if (isAttestationConfirmed) {
            refetchFdc();
            toast({
                title: "Identity Verified! ✅",
                description: "Your proof of personhood has been recorded on the Flare Network.",
                className: "bg-green-100 border-green-500 text-green-900"
            });
        }
    }, [isAttestationConfirmed, refetchFdc, toast]);


    const campaignAddresses = (campaignAddressesResult as string[]) || [];
    const campaignConfig = { abi: CampaignABI as Abi } as const;

    const contracts = campaignAddresses.map(addr => [
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'title' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'creator' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'fundingGoalUSD' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'currentFundingUSD' },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-BTC']] },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-XRP']] },
        { ...campaignConfig, address: addr as `0x${string}`, functionName: 'contributions', args: [userAddress, MOCK_TOKENS['F-LTC']] },
    ]).flat();

    const { data: results, isLoading } = useReadContracts({
        contracts: contracts,
        query: { enabled: !!campaignAddresses && !!userAddress }
    });

    useEffect(() => {
        if (results && userAddress) {
            const created: any[] = [];
            const backed: Contribution[] = [];

            // 7 calls per campaign
            for (let i = 0; i < campaignAddresses.length; i++) {
                const base = i * 7;
                const addr = campaignAddresses[i];
                
                if (results[base]?.status === 'success') {
                    const title = results[base]?.result as string;
                    const creator = results[base + 1]?.result as string;
                    const goal = results[base + 2]?.result ? formatEther(results[base + 2].result as bigint) : '0';
                    const current = results[base + 3]?.result ? formatEther(results[base + 3].result as bigint) : '0';
                    const btcContrib = results[base + 4]?.result as bigint || 0n;
                    const xrpContrib = results[base + 5]?.result as bigint || 0n;
                    const ltcContrib = results[base + 6]?.result as bigint || 0n;

                    if (creator === userAddress) {
                        created.push({ id: addr, title, goal, current, status: 'active' });
                    }

                    const addContribution = (amount: bigint, asset: string) => {
                        if (amount > 0n) {
                            backed.push({
                                id: `${addr}-${asset}`,
                                campaignId: addr,
                                campaignTitle: title,
                                amount: Number(formatEther(amount)),
                                asset,
                                date: new Date().toISOString(), // Placeholder, real date needs event logs
                                refundStatus: 'none',
                                votingRights: true
                            });
                        }
                    };

                    addContribution(btcContrib, 'F-BTC');
                    addContribution(xrpContrib, 'F-XRP');
                    addContribution(ltcContrib, 'F-LTC');
                }
            }
            setMyCampaigns(created);
            setMyContributions(backed);
        }
    }, [results, userAddress, campaignAddresses]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-semibold mb-4">Please connect your wallet</h2>
                <p className="text-muted-foreground">You need to connect to Flare Coston2 to view your dashboard.</p>
            </div>
        );
    }
    
    const totalDonated = myContributions.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-auto">
                <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="identity">Identity (FDC)</TabsTrigger>
            </TabsList>

            <TabsContent value="my-campaigns" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Campaigns</CardTitle>
                        <CardDescription>Campaigns you have created.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : myCampaigns.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">You haven't created any campaigns yet.</p>
                        ) : (
                            myCampaigns.map(campaign => (
                                <Card key={campaign.id}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground font-mono">{campaign.id}</p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild><Link href={`/campaigns/${campaign.id}`}>View</Link></Button>
                                    </CardHeader>
                                    <CardContent>
                                        <ProgressBar current={Number(campaign.current)} goal={Number(campaign.goal)} />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            A record of all your donations. You've donated a total of ${totalDonated.toFixed(2)} across {myContributions.length} campaigns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <TransactionHistory contributions={myContributions} isLoading={isLoading} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- IDENTITY TAB (FDC LOGIC) --- */}
            <TabsContent value="identity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identity Verification (FDC)</CardTitle>
                        <CardDescription>Verify your identity via Flare Data Connector.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className={`flex items-center justify-between rounded-lg border p-4 ${isFdcVerified ? "bg-green-500/10 border-green-500/50" : "bg-yellow-500/10 border-yellow-500/50"}`}>
                            <div>
                                <h3 className={`font-semibold ${isFdcVerified ? "text-green-700" : "text-yellow-700"}`}>
                                    {isFdcVerified ? "Verified Human" : "Verification Pending"}
                                </h3>
                                <p className={`text-sm ${isFdcVerified ? "text-green-600" : "text-yellow-600"}`}>
                                    {isFdcVerified ? "Your wallet is authorized to participate in regulated campaigns." : "You need to submit proof of personhood."}
                                </p>
                            </div>
                            <Badge variant="outline" className={isFdcVerified ? "text-green-700 border-green-500" : "text-yellow-700 border-yellow-500"}>
                                {isFdcVerified ? "Verified" : "Not Verified"}
                            </Badge>
                       </div>
                        
                        {!isFdcVerified && (
                            <div>
                                <Label className="mb-2 block">Upload ID Document (Aadhar/Passport)</Label>
                                <FileUpload onFileSelect={() => {}} />
                                <p className="text-xs text-muted-foreground mt-2">
                                    * Your document is hashed off-chain. The FDC attestation provider submits a Merkle Proof to the Flare Network.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {!isFdcVerified ? (
                            <Button 
                                disabled={isAttesting}
                                onClick={() => {
                                    submitAttestation({
                                        address: FDC_VERIFIER_ADDRESS as `0x${string}`,
                                        abi: FdcABI as Abi,
                                        functionName: 'verifyMe',
                                    });
                                }}
                            >
                                {isAttesting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Verifying...</> : "Submit Attestation"}
                            </Button>
                        ) : (
                            <Button disabled variant="secondary" className="text-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Verification Complete
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
