
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Contribution } from "@/lib/types";
import { format } from "date-fns";
import { FAssetIcon } from "./FAssetIcon";
import Link from "next/link";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type TransactionHistoryProps = {
  contributions: Contribution[];
  isLoading: boolean;
};

export function TransactionHistory({ contributions, isLoading }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>You haven't made any donations yet.</p>
        <Button variant="link" asChild>
            <Link href="/campaigns">Explore campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                    <Link href={`/campaigns/${tx.campaignId}`} className="font-medium hover:underline">
                        {tx.campaignTitle}
                    </Link>
                </TableCell>
                <TableCell>{format(new Date(tx.date), "PPP p")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <FAssetIcon asset={tx.asset as any} className="h-4 w-4"/>
                    <span>{tx.amount.toFixed(4)}</span>
                    <span className="text-muted-foreground">{tx.asset}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
