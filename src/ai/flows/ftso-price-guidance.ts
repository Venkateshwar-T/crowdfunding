'use server';

/**
 * @fileOverview Provides AI guidance on whether to use a suggested price
 * from a real-time price feed (FTSO) for FAssets on a crowdfunding campaign.
 *
 * - getPriceGuidance - A function that retrieves AI guidance for FTSO price usage.
 * - GetPriceGuidanceInput - The input type for the getPriceGuidance function.
 * - GetPriceGuidanceOutput - The return type for the getPriceGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPriceGuidanceInputSchema = z.object({
  assetName: z.string().describe('The name of the FAsset (e.g., F-BTC, F-XRP).'),
  currentPrice: z.number().describe('The current price of the FAsset.'),
  fundingGoal: z.number().describe('The funding goal of the campaign in USD.'),
  recentPriceFluctuations: z.string().describe('A description of recent price fluctuations for the FAsset.'),
});
export type GetPriceGuidanceInput = z.infer<typeof GetPriceGuidanceInputSchema>;

const GetPriceGuidanceOutputSchema = z.object({
  shouldUsePrice: z.boolean().describe('Whether the current price should be used.'),
  reasoning: z.string().describe('The AI reasoning behind the recommendation.'),
});
export type GetPriceGuidanceOutput = z.infer<typeof GetPriceGuidanceOutputSchema>;

export async function getPriceGuidance(input: GetPriceGuidanceInput): Promise<GetPriceGuidanceOutput> {
  return getPriceGuidanceFlow(input);
}

const priceGuidancePrompt = ai.definePrompt({
  name: 'priceGuidancePrompt',
  input: {schema: GetPriceGuidanceInputSchema},
  output: {schema: GetPriceGuidanceOutputSchema},
  prompt: `You are an AI assistant helping users decide whether to use the current price of an FAsset for their crowdfunding campaign.

  Here is information about the current market situation:
  Asset Name: {{{assetName}}}
  Current Price: {{{currentPrice}}}
  Funding Goal (USD): {{{fundingGoal}}}
  Recent Price Fluctuations: {{{recentPriceFluctuations}}}

  Analyze the information provided and determine whether the user should use the current price for their campaign or wait for a potentially better price.

  Provide a clear and concise recommendation (shouldUsePrice: true/false) and explain your reasoning.
`,
});

const getPriceGuidanceFlow = ai.defineFlow(
  {
    name: 'getPriceGuidanceFlow',
    inputSchema: GetPriceGuidanceInputSchema,
    outputSchema: GetPriceGuidanceOutputSchema,
  },
  async input => {
    const {output} = await priceGuidancePrompt(input);
    return output!;
  }
);
