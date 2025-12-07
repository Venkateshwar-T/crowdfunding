
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PriceFeed } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from '@/components/ui/button';

type PriceTickerProps = {
  feed: PriceFeed;
};

const timeRanges = ['1D', '5D', '1M', '1Y', 'All'];

const generateSparklineData = (price: number, change: number, timeRange: string) => {
  const data = [];
  let numPoints = 30;
  let volatility = 0.1;

  switch(timeRange) {
    case '5D': numPoints = 60; volatility = 0.2; break;
    case '1M': numPoints = 90; volatility = 0.5; break;
    case '1Y': numPoints = 120; volatility = 1.5; break;
    case 'All': numPoints = 200; volatility = 2.0; break;
  }

  const trend = change >= 0 ? 1 : -1;
  let currentPrice = price * (1 - (trend * volatility * 0.1));

  for (let i = 0; i < numPoints; i++) {
    const randomFactor = (Math.random() - 0.48) * volatility;
    const trendFactor = (i/numPoints) * trend * 0.1 * volatility;
    currentPrice *= (1 + trendFactor + randomFactor);
    data.push({
      value: currentPrice,
    });
  }
  // Ensure last point is the current price
  data[data.length - 1] = { value: price };

  return data;
};

export function PriceTicker({ feed }: PriceTickerProps) {
  const [timeRange, setTimeRange] = useState('1D');
  const isPositive = feed.change24h >= 0;
  const sparklineData = generateSparklineData(feed.price, feed.change24h, timeRange);

  return (
    <Card>
      <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                 <CardTitle className="text-sm font-medium">{feed.asset} Price (FTSO)</CardTitle>
                 <div className="text-2xl font-bold mt-1">${feed.price.toLocaleString()}</div>
                 <div className={cn("flex items-center text-xs", isPositive ? "text-green-500" : "text-red-500")}>
                    {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {feed.change24h.toFixed(2)}% (24h)
                </div>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                {timeRanges.map(range => (
                    <Button 
                        key={range} 
                        variant={timeRange === range ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                        className="text-xs"
                    >
                        {range}
                    </Button>
                ))}
            </div>
          </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mt-2 -ml-4">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                        }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, null]}
                    />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

