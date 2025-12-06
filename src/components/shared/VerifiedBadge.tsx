import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VerifiedBadgeProps = {
  isVerified: boolean;
  className?: string;
};

export function VerifiedBadge({ isVerified, className }: VerifiedBadgeProps) {
  if (!isVerified) {
    return null;
  }

  return (
    <Badge variant="secondary" className={cn("border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 gap-1.5 pl-2", className)}>
      <CheckCircle className="h-3.5 w-3.5" />
      <span>Verified</span>
    </Badge>
  );
}
