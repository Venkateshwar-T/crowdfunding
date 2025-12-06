import type { FAsset } from '@/lib/types';
import { BtcIcon, XrpIcon, DogeIcon, LtcIcon } from '@/components/icons/FAssetIcons';
import { cn } from '@/lib/utils';
import { CircleDollarSign } from 'lucide-react';

type FAssetIconProps = {
  asset: FAsset['symbol'];
  className?: string;
};

const iconMap = {
  'F-BTC': BtcIcon,
  'F-XRP': XrpIcon,
  'F-DOGE': DogeIcon,
  'F-LTC': LtcIcon,
  'F-USDC': CircleDollarSign,
};

const colorMap = {
    'F-BTC': 'text-orange-500',
    'F-XRP': 'text-blue-500',
    'F-DOGE': 'text-yellow-500',
    'F-LTC': 'text-gray-400',
    'F-USDC': 'text-blue-600',
}

export function FAssetIcon({ asset, className }: FAssetIconProps) {
  const IconComponent = iconMap[asset];
  const colorClass = colorMap[asset];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={cn('h-5 w-5', colorClass, className)} />;
}
