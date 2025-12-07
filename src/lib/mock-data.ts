import type { User, PriceFeed, Contribution, Creator } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/error/600/400';

const creators: Creator[] = [
  { id: 'creator-1', name: 'Alice Johnson', avatarUrl: getImageUrl('user-avatar-1'), isVerified: true },
  { id: 'creator-2', name: 'Bob Williams', avatarUrl: getImageUrl('user-avatar-2'), isVerified: false },
  { id: 'creator-3', name: 'Charlie Brown', avatarUrl: getImageUrl('user-avatar-3'), isVerified: true },
];

const mockContributions: Contribution[] = [
    { id: 'c-1', campaignId: '3', campaignTitle: 'Aethelgard: An Open-World RPG', amount: 50, asset: 'F-XRP', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), refundStatus: 'none', votingRights: true },
    { id: 'c-2', campaignId: '1', campaignTitle: 'Project Phoenix: Next-Gen VR Headset', amount: 100, asset: 'F-BTC', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), refundStatus: 'none', votingRights: true },
    { id: 'c-3', campaignId: '5', campaignTitle: 'The Sound of Silence - An Acoustic Album', amount: 25, asset: 'F-DOGE', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), refundStatus: 'refunded', votingRights: false },
]

export const mockUser: User = {
    id: 'user-123',
    name: 'Satoshi Nakamoto',
    email: 'satoshin@gmx.com',
    avatarUrl: getImageUrl('user-avatar-1'),
    fdcStatus: 'Verified',
    smartAccountAddress: '0x1234...567890AbCdEf',
    campaigns: [],
    contributions: mockContributions
};

export const mockPriceFeeds: PriceFeed[] = [
  { asset: 'F-BTC', price: 68000.50, change24h: 2.5 },
  { asset: 'F-XRP', price: 0.52, change24h: -1.2 },
  { asset: 'F-DOGE', price: 0.16, change24h: 5.8 },
  { asset: 'F-LTC', price: 85.30, change24h: 1.1 },
  { asset: 'F-USDC', price: 1.00, change24h: 0.01 },
];

    