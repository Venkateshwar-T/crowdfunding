import type { Campaign } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { ProgressBar } from './ProgressBar';
import { Badge } from '../ui/badge';
import { Clock, Tag } from 'lucide-react';
import { differenceInDays } from 'date-fns';

type CampaignCardProps = {
  campaign: Campaign;
};

const getStatusVariant = (status: Campaign['status']) => {
    switch(status) {
        case 'active': return 'default';
        case 'successful': return 'secondary';
        case 'expired': return 'destructive';
        case 'cancelled': return 'outline';
        default: return 'default';
    }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <Link href={`/campaigns/${campaign.id}`} className='block'>
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                <Image
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    data-ai-hint={campaign.imageHint}
                />
                 <Badge variant={getStatusVariant(campaign.status)} className="absolute top-3 right-3 capitalize">{campaign.status}</Badge>
                </div>
            </CardHeader>
        </Link>
        <CardContent className="p-4 flex-grow">
            <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{campaign.category}</span>
            </div>
            <Link href={`/campaigns/${campaign.id}`} className='block'>
                <h3 className="font-headline font-semibold text-lg leading-snug truncate" title={campaign.title}>
                    {campaign.title}
                </h3>
            </Link>
            <div className="mt-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={campaign.creator.avatarUrl} alt={campaign.creator.name} />
                    <AvatarFallback>{campaign.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none">{campaign.creator.name}</p>
                    <VerifiedBadge isVerified={campaign.creator.isVerified} className="mt-1" />
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 flex-col items-start gap-4">
            <ProgressBar current={campaign.currentFunding} goal={campaign.fundingGoal} />
            <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Clock className="h-4 w-4" />
                <span>
                    {daysLeft > 0 ? `${daysLeft} days left` : campaign.status === 'successful' ? 'Ended' : 'Expired'}
                </span>
            </div>
        </CardFooter>
    </Card>
  );
}
