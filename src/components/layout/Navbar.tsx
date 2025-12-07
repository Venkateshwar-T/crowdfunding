
'use client';

import Link from 'next/link';
import { HandCoins, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Separator } from '../ui/separator';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';
import { useUser } from '@/firebase';
import { RegisterDialog } from '../shared/RegisterDialog';

const navLinks = [
  { href: '/campaigns', label: 'Explore' },
  { href: '/create-campaign', label: 'Start a Campaign' },
  { href: '/flare', label: 'About' },
];

const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
        <HandCoins className="h-7 w-7 text-primary" />
        <span className="font-headline text-xl font-bold tracking-tight">CrowdFund</span>
    </Link>
);


export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useAccount();
  const { user } = useUser();

  const isAuthenticated = user && isConnected;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader className="p-6">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                <Logo />
            </SheetHeader>
            <div className="flex flex-col h-full">
              <nav className="flex flex-col items-start gap-4 p-6">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === href ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </Link>
                ))}
                {isAuthenticated && (
                   <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
              <div className="mt-auto flex flex-col gap-4 p-6">
                <Separator />
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  {isAuthenticated ? <WalletConnect /> : <RegisterDialog onRegister={() => setIsMobileMenuOpen(false)} />}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === href ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                 <Link
                  href="/dashboard"
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          
          <div className="items-center gap-2">
             {isAuthenticated ? <WalletConnect /> : <RegisterDialog />}
          </div>
        </div>
      </div>
    </header>
  );
}
