'use client';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/shared/FileUpload';
import { MilestoneCard } from '@/components/shared/MilestoneCard';
import { PlusCircle } from 'lucide-react';
import { FAssetIcon } from '@/components/shared/FAssetIcon';
import { mockCampaigns } from '@/lib/mock-data';

const milestoneSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

const campaignFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  fundingGoal: z.coerce.number().min(1, 'Funding goal must be at least 1'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  image: z.any().optional(),
  milestones: z.array(milestoneSchema).optional(),
  requiresFdc: z.boolean().default(false),
  acceptedAssets: z.array(z.string()).min(1, 'Select at least one asset'),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

const categories = mockCampaigns.reduce((acc, c) => {
    if (!acc.includes(c.category)) acc.push(c.category);
    return acc;
}, [] as string[]);

const availableAssets = [
    { symbol: 'F-BTC', name: 'Flare BTC' },
    { symbol: 'F-XRP', name: 'Flare XRP' },
    { symbol: 'F-DOGE', name: 'Flare DOGE' },
    { symbol: 'F-LTC', name: 'Flare LTC' },
];

export default function CreateCampaignPage() {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      description: '',
      fundingGoal: 1000,
      requiresFdc: false,
      acceptedAssets: [],
      milestones: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'milestones',
  });

  const onSubmit = (data: CampaignFormValues) => {
    console.log(data);
    // Here you would typically send data to a backend or smart contract
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Launch Your Idea</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Fill out the details below to bring your project to the Flare community.
            </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Core Details</CardTitle>
                    <CardDescription>Tell us about your project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField name="title" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Title</FormLabel>
                            <FormControl><Input placeholder="My Awesome Project" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Describe your project in detail..." rows={5} {...field} /></FormControl>
                             <FormDescription>The main story of your campaign.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="category" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Funding</CardTitle>
                     <CardDescription>Set your financial goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField name="fundingGoal" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Funding Goal (USD)</FormLabel>
                            <FormControl><Input type="number" placeholder="10000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="deadline" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Deadline</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Image</CardTitle>
                    <CardDescription>A picture is worth a thousand words.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField name="image" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FileUpload onFileSelect={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                    <CardDescription>Break down your project into manageable goals. This builds trust with your backers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <MilestoneCard key={field.id} index={index} remove={remove} />
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => append({ title: '', description: '', targetDate: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Milestone
                    </Button>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField name="requiresFdc" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Require Identity Verification (FDC)</FormLabel>
                                <FormDescription>
                                Backers must have a verified Flare Decentralized Identity to contribute.
                                </FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                     <FormField name="acceptedAssets" control={form.control} render={({ field }) => (
                        <FormItem>
                             <div className="mb-4">
                                <FormLabel>Accepted FAssets</FormLabel>
                                <FormDescription>Choose which assets your campaign will accept.</FormDescription>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                {availableAssets.map((asset) => (
                                <FormField
                                    key={asset.symbol}
                                    name="acceptedAssets"
                                    render={({ field }) => {
                                        return (
                                        <FormItem key={asset.symbol} className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4">
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(asset.symbol)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), asset.symbol])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== asset.symbol
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal flex items-center gap-2">
                                                <FAssetIcon asset={asset.symbol as any} />
                                                {asset.name}
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                            </div>
                             <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Create Campaign
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
