
export type Creator = {
  id: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
};

export type FAsset = {
  symbol: 'F-BTC' | 'F-XRP' | 'F-DOGE' | 'F-LTC' | 'F-USDC';
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'completed' | 'in-progress';
};

export type CampaignStatus = 'active' | 'successful' | 'expired' | 'cancelled';

export type Campaign = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  creator: Creator;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  category: string;
  status: CampaignStatus;
  acceptedAssets: FAsset[];
  milestones: Milestone[];
  requiresFdc: boolean;
};

export type Contribution = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  asset: string;
  date: string;
  refundStatus: 'none' | 'pending' | 'refunded';
  votingRights: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  fdcStatus: 'Not Verified' | 'Pending' | 'Verified';
  smartAccountAddress: string;
  campaigns: Pick<Campaign, 'id' | 'title' | 'status'>[];
  contributions: Contribution[];
};

export type PriceFeed = {
  asset: string;
  price: number;
  change24h: number;
};

    

    