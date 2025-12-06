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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { FAssetIcon } from '../shared/FAssetIcon';

// F-Asset addresses from create-campaign page
const MOCK_TOKENS: Record<string, `0x${string}`> = {
    'F-BTC': "0x76E4b5DDD42BD84161f7f298D35723FbC576e861",
    'F-XRP': "0xBAf7dE33f98B018055EA5aCDfBDcA9be11780d06",
    'F-USDC': "0x94f41643DB84e373491aE358e24278a562307E30",
};
const TOKEN_SYMBOLS = ['F-BTC', 'F-XRP', 'F-USDC'];


export function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { user } = useUser();
  const auth = useAuth();

  // Fetch native balance
  const { data: nativeBalance } = useBalance({ address });

  // Fetch F-Asset balances
  const fAssetBalances = TOKEN_SYMBOLS.map(symbol => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBalance({
        address,
        token: MOCK_TOKENS[symbol],
        query: {
            enabled: !!address,
        }
    });
    return data;
  }).filter(Boolean);


  const handleDisconnect = () => {
    if (auth) {
      signOut(auth);
    }
    disconnect();
  }

  if (!isConnected || !address || !user) {
    return null;
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
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
         <DropdownMenuItem disabled>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Google Account</span>
                <span className="font-mono text-sm truncate">{user.email}</span>
            </div>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Connected to {connectorName}</span>
                <span className="font-mono text-sm">{shortAddress}</span>
            </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Balances</DropdownMenuLabel>
        
        {nativeBalance && (
            <DropdownMenuItem>
                <Landmark className="mr-2 h-4 w-4" />
                <div className="flex flex-1 justify-between">
                     <span>{nativeBalance.symbol}</span>
                     <span className="font-mono">{parseFloat(nativeBalance.formatted).toFixed(4)}</span>
                </div>
            </DropdownMenuItem>
        )}
        {fAssetBalances.map((balance) => (
            balance &&
            <DropdownMenuItem key={balance.symbol}>
                <FAssetIcon asset={balance.symbol as any} className="mr-2 h-4 w-4" />
                 <div className="flex flex-1 justify-between">
                     <span>{balance.symbol}</span>
                     <span className="font-mono">{parseFloat(balance.formatted).toFixed(4)}</span>
                </div>
            </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
