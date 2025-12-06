
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
import { PlusCircle, Loader2, CalendarIcon } from 'lucide-react';
import { FAssetIcon } from '@/components/shared/FAssetIcon';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import FactoryABI from '@/lib/abi/CrowdfundingFactory.json';
import type { Abi } from 'viem';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const FACTORY_ADDRESS = "0x136Fc40F09eB9f7a51302558D6f290176Af9bB0d"; 

const MOCK_TOKENS: Record<string, string> = {
    'F-BTC': "0x76E4b5DDD42BD84161f7f298D35723FbC576e861",
    'F-XRP': "0xBAf7dE33f98B018055EA5aCDfBDcA9be11780d06",
    'F-DOGE': "0x0000000000000000000000000000000000000000",
    'F-LTC': "0x0000000000000000000000000000000000000000",
    'F-USDC': "0x94f41643DB84e373491aE358e24278a562307E30",
};

const milestoneSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetDate: z.date({
    required_error: "A target date is required.",
  }),
});

const campaignFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  otherCategory: z.string().optional(),
  fundingGoal: z.coerce.number().min(1, 'Funding goal must be at least 1'),
  deadline: z.date({
    required_error: "A deadline date is required.",
  }),
  image: z.any().optional(),
  milestones: z.array(milestoneSchema).optional(),
  requiresFdc: z.boolean().default(false),
  acceptedAssets: z.array(z.string()).min(1, 'Select at least one asset'),
}).refine(data => {
    if (data.category === 'Other') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: 'Please specify the category name',
    path: ['otherCategory'],
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

const categories = ['Tech', 'Medical', 'DeFi', 'Gaming', 'Other'];

const availableAssets = [
    { symbol: 'F-BTC', name: 'Flare BTC' },
    { symbol: 'F-XRP', name: 'Flare XRP' },
    { symbol: 'F-DOGE', name: 'Flare DOGE' },
    { symbol: 'F-LTC', name: 'Flare LTC' },
    { symbol: 'F-USDC', name: 'Flare USDC' },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("https://placehold.co/600x400/png");
  const [isOtherCategory, setIsOtherCategory] = useState(false);

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ 
    hash 
  });

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      otherCategory: '',
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

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Campaign Created Successfully! 🚀",
        description: "Your Smart Account has been deployed to the Flare Network.",
        variant: "default",
        className: "bg-green-100 border-green-500 text-green-900"
      });
      setTimeout(() => router.push('/dashboard'), 2000);
    }
    if (writeError || receiptError) {
      toast({
        title: "Transaction Failed",
        description: (writeError?.shortMessage || receiptError?.shortMessage || "An unknown error occurred."),
        variant: "destructive",
      });
    }
  }, [isSuccess, writeError, receiptError, toast, router]);

  const handleImageUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl.length > 1024 * 1024) { // 1MB limit
             toast({
                title: "Image too large",
                description: "Please upload an image smaller than 1MB. Larger images may cause the transaction to fail due to high gas fees.",
                variant: "destructive"
             });
             // Also clear the file input if you have a way to do so
             form.setValue('image', null);
             setImageUrl("https://placehold.co/600x400/png");
        } else {
             setImageUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
      form.setValue('image', file);
    } else {
      form.setValue('image', null);
      setImageUrl("https://placehold.co/600x400/png");
    }
  }

  const onSubmit = (data: CampaignFormValues) => {
    if (!isConnected) {
        openConnectModal?.();
        return;
    }

    const deadlineDate = new Date(data.deadline);
    const today = new Date();
    const durationDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (durationDays <= 0) {
        toast({ title: "Invalid Date", description: "Deadline must be in the future", variant: "destructive" });
        return;
    }

    const firstTicker = data.acceptedAssets[0];
    const firstAddress = MOCK_TOKENS[firstTicker] || "0x0000000000000000000000000000000000000000";

    const selectedTickers = [firstTicker];
    const selectedAddresses = [firstAddress];
    
    const category = data.category === 'Other' ? data.otherCategory : data.category;

    writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FactoryABI as Abi,
        functionName: 'createCampaign',
        args: [
            data.title,
            data.description,
            imageUrl,
            category,
            BigInt(data.fundingGoal) * BigInt(10**18),
            BigInt(durationDays),
            data.requiresFdc,
            selectedAddresses,
            selectedTickers
        ],
    });
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
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                setIsOtherCategory(value === 'Other');
                            }} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {isOtherCategory && (
                        <FormField name="otherCategory" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Other Category Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Education" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
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
                     <FormField
                        name="deadline"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Campaign Deadline</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date < new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Campaign Image</CardTitle>
                    <CardDescription>A picture is worth a thousand words. Using large images may result in high gas fees.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField name="image" control={form.control} render={() => (
                        <FormItem>
                            <FormControl>
                                <FileUpload onFileSelect={handleImageUpload} />
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
                    <Button type="button" variant="outline" className="w-full" onClick={() => append({ title: '', description: '', targetDate: new Date() })}>
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
                     <FormField name="acceptedAssets" control={form.control} render={() => (
                        <FormItem>
                             <div className="mb-4">
                                <FormLabel>Accepted FAssets</FormLabel>
                                <FormDescription>Choose which assets your campaign will accept. (Note: Due to a contract issue, only the first selected asset will be enabled for now.)</FormDescription>
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
                                                        (value: string) => value !== asset.symbol
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

            <Button type="submit" size="lg" className="w-full" disabled={isPending || isConfirming}>
              {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirm in Wallet...
                </>
              ) : isConfirming ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deploying Campaign...
                </>
              ) : isConnected ? (
                'Create Campaign'
              ) : (
                'Connect Wallet to Create'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

    
