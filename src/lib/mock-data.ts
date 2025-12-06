import type { Campaign, User, PriceFeed, Contribution, Creator } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/error/600/400';
const getImageHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || 'placeholder';

const creators: Creator[] = [
  { id: 'creator-1', name: 'Alice Johnson', avatarUrl: getImageUrl('user-avatar-1'), isVerified: true },
  { id: 'creator-2', name: 'Bob Williams', avatarUrl: getImageUrl('user-avatar-2'), isVerified: false },
  { id: 'creator-3', name: 'Charlie Brown', avatarUrl: getImageUrl('user-avatar-3'), isVerified: true },
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Project Phoenix: Next-Gen VR Headset',
    description: 'A revolutionary VR headset with 8K resolution and haptic feedback. Experience virtual worlds like never before.',
    imageUrl: getImageUrl('campaign-1'),
    imageHint: getImageHint('campaign-1'),
    creator: creators[0],
    fundingGoal: 50000,
    currentFunding: 32500,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Tech',
    status: 'active',
    acceptedAssets: [{ symbol: 'F-BTC', name: 'Flare BTC' }, { symbol: 'F-XRP', name: 'Flare XRP' }],
    milestones: [
      { id: 'm1-1', title: 'Prototype Development', description: 'Finalize the hardware prototype.', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'in-progress' },
      { id: 'm1-2', title: 'Software SDK Alpha', description: 'Release alpha SDK for developers.', targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
    ],
    requiresFdc: true,
  },
  {
    id: '2',
    title: 'GreenThumb: AI-Powered Urban Farming Kit',
    description: 'An automated indoor farming system that helps you grow fresh produce year-round, powered by AI.',
    imageUrl: getImageUrl('campaign-2'),
    imageHint: getImageHint('campaign-2'),
    creator: creators[1],
    fundingGoal: 20000,
    currentFunding: 18000,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Tech',
    status: 'active',
    acceptedAssets: [{ symbol: 'F-DOGE', name: 'Flare DOGE' }],
    milestones: [
      { id: 'm2-1', title: 'Hardware Production', description: 'Start mass production of kits.', targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
    ],
    requiresFdc: false,
  },
  {
    id: '3',
    title: 'Aethelgard: An Open-World RPG',
    description: 'A dark fantasy RPG with a rich story and community-driven content, built for gamers by gamers.',
    imageUrl: getImageUrl('campaign-3'),
    imageHint: getImageHint('campaign-3'),
    creator: creators[2],
    fundingGoal: 75000,
    currentFunding: 80000,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Gaming',
    status: 'successful',
    acceptedAssets: [{ symbol: 'F-BTC', name: 'Flare BTC' }, { symbol: 'F-XRP', name: 'Flare XRP' }, { symbol: 'F-DOGE', name: 'Flare DOGE' }],
    milestones: [
        { id: 'm3-1', title: 'Pre-production', description: 'Story and world-building complete.', targetDate: '2023-12-01T00:00:00.000Z', status: 'completed' },
        { id: 'm3-2', title: 'Vertical Slice', description: 'Develop a playable demo.', targetDate: '2024-03-01T00:00:00.000Z', status: 'completed' },
    ],
    requiresFdc: true,
  },
  {
    id: '4',
    title: 'DeFiShield: Decentralized Insurance Protocol',
    description: 'A community-owned insurance protocol to protect your assets against smart contract vulnerabilities.',
    imageUrl: getImageUrl('campaign-4'),
    imageHint: getImageHint('campaign-4'),
    creator: creators[0],
    fundingGoal: 100000,
    currentFunding: 45000,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'DeFi',
    status: 'active',
    acceptedAssets: [{ symbol: 'F-LTC', name: 'Flare LTC' }, { symbol: 'F-XRP', name: 'Flare XRP' }],
    milestones: [],
    requiresFdc: true,
  },
  {
    id: '5',
    title: 'The Sound of Silence - An Acoustic Album',
    description: 'Help produce a full-length studio album of instrumental acoustic guitar music.',
    imageUrl: getImageUrl('campaign-6'),
    imageHint: getImageHint('campaign-6'),
    creator: creators[1],
    fundingGoal: 5000,
    currentFunding: 1200,
    deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Music',
    status: 'expired',
    acceptedAssets: [{ symbol: 'F-DOGE', name: 'Flare DOGE' }],
    milestones: [],
    requiresFdc: false,
  },
    {
    id: '6',
    title: 'Chroma Canvas: Digital Art Collective',
    description: 'Funding for a new digital art collective to create and mint a series of generative art NFTs.',
    imageUrl: getImageUrl('campaign-5'),
    imageHint: getImageHint('campaign-5'),
    creator: creators[2],
    fundingGoal: 15000,
    currentFunding: 15000,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Art',
    status: 'active',
    acceptedAssets: [{ symbol: 'F-BTC', name: 'Flare BTC' }],
    milestones: [],
    requiresFdc: true,
  },
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
    campaigns: [
        { id: '1', title: 'Project Phoenix: Next-Gen VR Headset', status: 'active' },
        { id: '4', title: 'DeFiShield: Decentralized Insurance Protocol', status: 'active' },
    ],
    contributions: mockContributions
};

export const mockPriceFeeds: PriceFeed[] = [
  { asset: 'F-BTC', price: 68000.50, change24h: 2.5 },
  { asset: 'F-XRP', price: 0.52, change24h: -1.2 },
  { asset: 'F-DOGE', price: 0.16, change24h: 5.8 },
  { asset: 'F-LTC', price: 85.30, change24h: 1.1 },
  { asset: 'F-USDC', price: 1.00, change24h: 0.01 },
];
