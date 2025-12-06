'use client';
import { useState } from 'react';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { mockCampaigns } from '@/lib/mock-data';
import type { Campaign } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = ['All', 'Tech', 'Art', 'Music', 'DeFi', 'Gaming'];
const statuses = ['All', 'active', 'successful', 'expired'];

export default function ExploreCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [requiresFdc, setRequiresFdc] = useState(false);
  const [sortBy, setSortBy] = useState('trending');


  const filteredCampaigns = mockCampaigns
    .filter((campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((campaign) =>
      category === 'All' ? true : campaign.category === category
    )
    .filter((campaign) =>
      status === 'All' ? true : campaign.status === status
    )
    .filter((campaign) =>
      requiresFdc ? campaign.requiresFdc === true : true
    )
    .sort((a, b) => {
        switch (sortBy) {
            case 'latest':
                return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
            case 'goal':
                return b.fundingGoal - a.fundingGoal;
            case 'trending':
            default:
                return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal);
        }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Campaigns</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and support the next wave of innovation on the Flare Network.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <ListFilter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup value={category} onValueChange={setCategory}>
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat} id={`cat-${cat}`} />
                      <Label htmlFor={`cat-${cat}`}>{cat}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fdc-verified"
                  checked={requiresFdc}
                  onCheckedChange={(checked) => setRequiresFdc(!!checked)}
                />
                <Label htmlFor="fdc-verified">Verified Creator (FDC)</Label>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="sort-by">Sort by</Label>
                     <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="sort-by" className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="trending">Trending</SelectItem>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="goal">Funding Goal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16 col-span-full">
                <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
