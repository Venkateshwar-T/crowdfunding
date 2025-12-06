import { Flame } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                    <Flame className="h-7 w-7 text-primary" />
                    <span className="font-headline text-xl font-bold tracking-tight">CrowdFund</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Explore
                    </Link>
                    <Link href="/flare" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                </div>
            </div>
          <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} CrowdFund. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
