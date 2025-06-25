'use server';

/**
 * @fileOverview Flow for posting leftovers: Identifies food, estimates freshness, and suggests expiration date.
 *
 * - postLeftovers - A function that handles the leftover posting process.
 * - PostLeftoversInput - The input type for the postLeftovers function.
 * - PostLeftoversOutput - The return type for the postLeftovers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PostLeftoversInputSchema = z.object({
  foodImageUri: z
    .string()
    .describe(
      "A photo of the leftover food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  textDescription: z
    .string()
    .optional()
    .describe('Optional text description of the leftover food.'),
});
export type PostLeftoversInput = z.infer<typeof PostLeftoversInputSchema>;

const PostLeftoversOutputSchema = z.object({
  foodName: z.string().describe('The identified name of the food.'),
  freshness: z.string().describe('An estimate of the food\'s freshness (e.g., fresh, slightly stale, old).'),
  expirationDate: z.string().describe('A suggested expiration date for the food (e.g., YYYY-MM-DD).'),
});
export type PostLeftoversOutput = z.infer<typeof PostLeftoversOutputSchema>;

export async function postLeftovers(input: PostLeftoversInput): Promise<PostLeftoversOutput> {
  return postLeftoversFlow(input);
}

const postLeftoversFlow = ai.defineFlow(
  {
    name: 'postLeftoversFlow',
    inputSchema: PostLeftoversInputSchema,
    outputSchema: PostLeftoversOutputSchema,
  },
  async input => {
    const foodName = input.textDescription ? `Leftover ${input.textDescription}` : "Delicious Leftovers";
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + 3); // Suggest expiry in 3 days

    return {
      foodName: foodName,
      freshness: 'Freshly prepared',
      expirationDate: expiry.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  }
);
