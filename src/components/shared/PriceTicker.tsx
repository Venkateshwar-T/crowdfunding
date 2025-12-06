'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PriceFeed } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

type PriceTickerProps = {
  feed: PriceFeed;
};

const generateSparklineData = (price: number, change: number) => {
  const data = [];
  const trend = change >= 0 ? 1 : -1;
  for (let i = 0; i < 30; i++) {
    const randomFactor = (Math.random() - 0.45) * 0.1; // small random fluctuation
    const trendFactor = (i/30) * trend * 0.1;
    data.push({
      value: price * (1 - (trend * 0.05)) * (1 + trendFactor + randomFactor),
    });
  }
  return data;
};

export function PriceTicker({ feed }: PriceTickerProps) {
  const isPositive = feed.change24h >= 0;
  const sparklineData = generateSparklineData(feed.price, feed.change24h);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{feed.asset} Price (FTSO)</CardTitle>
        <span className="text-sm text-muted-foreground">USD</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${feed.price.toLocaleString()}</div>
        <div className={cn("flex items-center text-xs", isPositive ? "text-green-500" : "text-red-500")}>
          {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {feed.change24h.toFixed(2)}% (24h)
        </div>
        <div className="h-[80px] w-full mt-2 -ml-4">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
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
                    <Area type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#ef4444'} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
