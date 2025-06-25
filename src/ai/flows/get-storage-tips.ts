'use server';

/**
 * @fileOverview Provides food storage tips based on a text description of the food.
 *
 * - getStorageTips - A function that accepts a text description of food and returns storage tips.
 * - GetStorageTipsInput - The input type for the getStorageTips function.
 * - GetStorageTipsOutput - The return type for the getStorageTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetStorageTipsInputSchema = z.object({
  foodDescription: z
    .string()
    .describe('A description of the food for which storage tips are needed.'),
});
export type GetStorageTipsInput = z.infer<typeof GetStorageTipsInputSchema>;

const GetStorageTipsOutputSchema = z.object({
  storageTips: z
    .string()
    .describe('Detailed storage tips for the described food.'),
});
export type GetStorageTipsOutput = z.infer<typeof GetStorageTipsOutputSchema>;

export async function getStorageTips(input: GetStorageTipsInput): Promise<GetStorageTipsOutput> {
  return getStorageTipsFlow(input);
}

const getStorageTipsPrompt = ai.definePrompt({
  name: 'getStorageTipsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GetStorageTipsInputSchema },
  output: { schema: GetStorageTipsOutputSchema },
  prompt: `You are a food safety expert. A user wants to know how to store a food item to maximize its freshness.

Food Item: {{{foodDescription}}}

Provide clear, concise, and actionable storage tips as a single string. Include recommendations for refrigeration, freezing, and pantry storage if applicable. Be encouraging and friendly. Structure your response to fit the output schema.`,
});

const getStorageTipsFlow = ai.defineFlow(
  {
    name: 'getStorageTipsFlow',
    inputSchema: GetStorageTipsInputSchema,
    outputSchema: GetStorageTipsOutputSchema,
  },
  async (input) => {
    const { output } = await getStorageTipsPrompt(input);
    return output!;
  }
);
