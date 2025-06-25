// src/ai/flows/get-storage-tips.ts
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

const prompt = ai.definePrompt({
  name: 'getStorageTipsPrompt',
  input: {schema: GetStorageTipsInputSchema},
  output: {schema: GetStorageTipsOutputSchema},
  prompt: `You are an expert in food storage.

  Based on the description of the food provided, give detailed and practical storage tips to maximize freshness and minimize waste.

  Food Description: {{{foodDescription}}}`,
});

const getStorageTipsFlow = ai.defineFlow(
  {
    name: 'getStorageTipsFlow',
    inputSchema: GetStorageTipsInputSchema,
    outputSchema: GetStorageTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
