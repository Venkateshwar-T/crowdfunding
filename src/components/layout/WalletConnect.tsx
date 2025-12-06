'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Wallet } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) {
    return (
      <Button onClick={openConnectModal} variant="outline">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const connectorName = connector?.name || 'Wallet';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
           <Avatar className="h-6 w-6">
              <AvatarFallback>{address.slice(2, 4).toUpperCase()}</AvatarFallback>
           </Avatar>
           <span className="font-mono">{shortAddress}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Connected to {connectorName}</span>
                <span className="font-mono text-sm">{shortAddress}</span>
            </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
