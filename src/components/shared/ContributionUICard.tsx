import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contribution } from "@/lib/types";
import { FAssetIcon } from "./FAssetIcon";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type ContributionUICardProps = {
  contribution: Contribution;
};

const getStatusVariant = (status: Contribution['refundStatus']) => {
    switch(status) {
        case 'none': return 'secondary';
        case 'pending': return 'default';
        case 'refunded': return 'outline';
        default: return 'secondary';
    }
}

export function ContributionUICard({ contribution }: ContributionUICardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{contribution.campaignTitle}</CardTitle>
                <CardDescription>Contribution made on {format(new Date(contribution.date), 'MMM dd, yyyy')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <FAssetIcon asset={contribution.asset as any} className="h-6 w-6"/>
                <span className="text-lg font-bold">{contribution.amount}</span>
                <span className="text-muted-foreground">{contribution.asset}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
         <div>
            <span className="text-sm font-medium">Refund Status: </span>
            <Badge variant={getStatusVariant(contribution.refundStatus)} className="capitalize">{contribution.refundStatus}</Badge>
         </div>
         <div>
            <span className="text-sm font-medium">Voting Rights: </span>
            <Badge variant={contribution.votingRights ? 'default' : 'secondary'} className={cn(contribution.votingRights ? "bg-green-500/20 text-green-700 border-green-500/50" : "")}>{contribution.votingRights ? 'Active' : 'N/A'}</Badge>
         </div>
      </CardContent>
    </Card>
  );
}
