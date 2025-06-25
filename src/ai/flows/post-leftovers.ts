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

const PostLeftoversPromptInputSchema = PostLeftoversInputSchema.extend({
  currentDate: z.string().describe('The current date.'),
});

const postLeftoversPrompt = ai.definePrompt({
  name: 'postLeftoversPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: PostLeftoversPromptInputSchema },
  output: { schema: PostLeftoversOutputSchema },
  prompt: `You are an expert food inspector. Analyze the provided image and optional text description to identify the food, estimate its freshness, and suggest a reasonable expiration date.

The current date is {{{currentDate}}}.

IMAGE: {{media url=foodImageUri}}
DESCRIPTION: {{{textDescription}}}

Based on the image and text, please provide the following:
- A descriptive name for the food.
- An estimation of its freshness (e.g., "Just made", "Looks fresh", "Best eaten soon").
- A suggested expiration date in YYYY-MM-DD format. Assume refrigerated leftovers are good for 3-4 days unless the item is clearly more or less perishable.

Format your response according to the output schema.`,
});


const postLeftoversFlow = ai.defineFlow(
  {
    name: 'postLeftoversFlow',
    inputSchema: PostLeftoversInputSchema,
    outputSchema: PostLeftoversOutputSchema,
  },
  async (input) => {
    const currentDate = new Date().toLocaleDateString();
    const { output } = await postLeftoversPrompt({ ...input, currentDate });
    return output!;
  }
);
