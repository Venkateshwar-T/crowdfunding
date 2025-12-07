'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, Circle, Wallet, ShieldCheck, LogIn } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();

type RegisterDialogProps = {
  onRegister?: () => void;
  children?: React.ReactNode;
};

export function RegisterDialog({ onRegister, children }: RegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const { user, loading } = useUser();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    if (auth) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error during Google sign-in:", error);
      }
    }
  };

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && user && isConnected) {
      onRegister?.();
    }
  }

  const isStep1Complete = !!user;
  const isStep2Complete = isConnected;
  
  const triggerButton = children ?? (
     <Button variant="outline" className="w-full">
        <LogIn className="mr-2 h-4 w-4" />
        Register / Sign In
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
          <DialogDescription>
            To create or donate to a campaign, you need to complete two simple steps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            {/* Step 1: Sign in with Google */}
            <div className="flex items-center gap-4">
                {isStep1Complete ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                    <Circle className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="flex-1">
                    <h3 className="font-semibold">Step 1: Verify Identity</h3>
                    <p className="text-sm text-muted-foreground">Sign in with your Google account.</p>
                </div>
                <Button 
                    onClick={handleGoogleSignIn} 
                    disabled={isStep1Complete || loading}
                    variant={isStep1Complete ? "secondary" : "default"}
                    className='w-[120px]'
                >
                    {loading ? "..." : isStep1Complete ? 'Signed In' : 'Sign In'}
                    {!isStep1Complete && <ShieldCheck className="ml-2 h-4 w-4" />}
                </Button>
            </div>

            {/* Step 2: Connect Wallet */}
            <div className="flex items-center gap-4">
                 {isStep2Complete ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                    <Circle className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="flex-1">
                    <h3 className="font-semibold">Step 2: Connect Wallet</h3>
                    <p className="text-sm text-muted-foreground">Connect your wallet to interact with campaigns.</p>
                </div>
                 <Button 
                    onClick={handleConnectWallet} 
                    disabled={!isStep1Complete || isStep2Complete}
                    variant={isStep2Complete ? "secondary" : "default"}
                    className='w-[120px]'
                >
                    {isStep2Complete ? 'Connected' : 'Connect'}
                     {!isStep2Complete && <Wallet className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
