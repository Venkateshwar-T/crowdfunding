'use client';
import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriceGuidance, type GetPriceGuidanceInput, type GetPriceGuidanceOutput } from "@/ai/flows/ftso-price-guidance";
import { Bot, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';

type FtsoPriceGuidanceProps = {
    assetName: string;
    currentPrice: number;
    fundingGoal: number;
};

export function FtsoPriceGuidance({ assetName, currentPrice, fundingGoal }: FtsoPriceGuidanceProps) {
    const [isPending, startTransition] = useTransition();
    const [guidance, setGuidance] = useState<GetPriceGuidanceOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGetGuidance = () => {
        startTransition(async () => {
            setError(null);
            setGuidance(null);
            const input: GetPriceGuidanceInput = {
                assetName,
                currentPrice,
                fundingGoal,
                recentPriceFluctuations: "The asset has seen moderate volatility over the last 7 days, with a recent upward trend.",
            };

            try {
                const result = await getPriceGuidance(input);
                setGuidance(result);
            } catch (e) {
                console.error(e);
                setError("Failed to get AI guidance. Please try again.");
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    AI Price Guidance
                </CardTitle>
                <CardDescription>
                    Get an AI-powered recommendation on whether to use the current {assetName} price for your funding calculations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {guidance && (
                    <div className="space-y-4">
                        <Alert variant={guidance.shouldUsePrice ? "default" : "destructive"} className={guidance.shouldUsePrice ? "bg-green-500/10 border-green-500/50" : ""}>
                            {guidance.shouldUsePrice ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                            <AlertTitle className="font-bold">
                                {guidance.shouldUsePrice ? "Recommendation: Use Current Price" : "Recommendation: Consider Waiting"}
                            </AlertTitle>
                            <AlertDescription>
                                {guidance.reasoning}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGetGuidance} disabled={isPending} className="w-full">
                    {isPending ? "Analyzing..." : `Get Guidance for ${assetName}`}
                </Button>
            </CardFooter>
        </Card>
    );
}
