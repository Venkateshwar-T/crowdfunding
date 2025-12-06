import { mockUser } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/shared/FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw } from "lucide-react";
import { ContributionUICard } from "@/components/shared/ContributionUICard";
import { ProgressBar } from "@/components/shared/ProgressBar";


export default function DashboardPage() {
    return (
        <Tabs defaultValue="my-campaigns" className="w-full">
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
                        <CardDescription>Campaigns you have created.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockUser.campaigns.map(campaign => (
                            <Card key={campaign.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <ProgressBar current={75} goal={100} />
                                        </div>
                                        <Badge variant="secondary" className="capitalize">{campaign.status}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="my-contributions" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Contributions</CardTitle>
                        <CardDescription>Projects you have backed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockUser.contributions.map(contribution => (
                           <ContributionUICard key={contribution.id} contribution={contribution} />
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="identity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identity Verification (FDC)</CardTitle>
                        <CardDescription>Verify your identity to build trust with backers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-semibold">Verification Status</h3>
                                <p className="text-sm text-muted-foreground">Your current FDC status.</p>
                            </div>
                            <Badge variant={mockUser.fdcStatus === 'Verified' ? 'default' : 'secondary'} className={mockUser.fdcStatus === 'Verified' ? "bg-green-500/20 text-green-700 border-green-500/50" : ""}>
                                {mockUser.fdcStatus}
                            </Badge>
                       </div>
                       {mockUser.fdcStatus !== 'Verified' && (
                        <div>
                            <Label className="mb-2 block">Upload Identity Document</Label>
                            <FileUpload onFileSelect={() => {}} />
                            <p className="text-xs text-muted-foreground mt-2">Upload a government-issued ID (e.g., Passport, Driver's License). This is a mock UI for demonstration.</p>
                        </div>
                       )}
                    </CardContent>
                    <CardFooter>
                         {mockUser.fdcStatus !== 'Verified' && (
                            <Button>Submit for Verification</Button>
                         )}
                    </CardFooter>
                </Card>
            </TabsContent>
            
            <TabsContent value="smart-account" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Account Manager</CardTitle>
                        <CardDescription>Your personal account for interacting with Flarestarter.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="smart-account-address">Your Smart Account Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input id="smart-account-address" value={mockUser.smartAccountAddress} readOnly />
                                <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col sm:flex-row gap-2">
                             <Button variant="secondary" className="w-full sm:w-auto">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate (Mock)
                            </Button>
                             <Button variant="outline" className="w-full sm:w-auto">
                                View Details (Mock)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
