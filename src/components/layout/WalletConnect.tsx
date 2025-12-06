'use client';

import { useAccount, useDisconnect, useBalance } from 'wagmi';
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
import { LogOut, Wallet, Landmark } from 'lucide-react';

export function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  if (!isConnected || !address) {
    return (
      <Button onClick={openConnectModal} variant="outline">
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </Button>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const connectorName = connector?.name || 'Wallet';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full group">
           <Wallet className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
           <span className="sr-only">Open wallet menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Connected to {connectorName}</span>
                <span className="font-mono text-sm">{shortAddress}</span>
            </div>
        </DropdownMenuItem>
        {balance && (
            <DropdownMenuItem>
                <Landmark className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                     <span className="text-xs text-muted-foreground">Balance</span>
                     <span>{balance.formatted} {balance.symbol}</span>
                </div>
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
