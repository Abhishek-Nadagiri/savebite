'use server';

/**
 * @fileOverview Provides food storage tips based on a text description or image of the food.
 *
 * - getStorageTips - A function that accepts a text description and/or image of food and returns storage tips.
 * - GetStorageTipsInput - The input type for the getStorageTips function.
 * - GetStorageTipsOutput - The return type for the getStorageTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetStorageTipsInputSchema = z
  .object({
    foodDescription: z
      .string()
      .optional()
      .describe('A description of the food for which storage tips are needed.'),
    foodImageUri: z
      .string()
      .optional()
      .describe(
        "A photo of the food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  })
  .refine((data) => data.foodDescription || data.foodImageUri, {
    message: 'Either a food description or a food image must be provided.',
  });

export type GetStorageTipsInput = z.infer<typeof GetStorageTipsInputSchema>;

const GetStorageTipsOutputSchema = z.object({
  storageTips: z
    .string()
    .describe('Detailed storage tips for the described food.'),
});
export type GetStorageTipsOutput = z.infer<typeof GetStorageTipsOutputSchema>;

export async function getStorageTips(
  input: GetStorageTipsInput
): Promise<GetStorageTipsOutput> {
  return getStorageTipsFlow(input);
}

const getStorageTipsPrompt = ai.definePrompt({
  name: 'getStorageTipsPrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: { schema: GetStorageTipsInputSchema },
  output: { schema: GetStorageTipsOutputSchema },
  prompt: `You are a world-class expert at identifying food from images, similar to Google Lens. Your most critical task is to accurately identify the food item in the user's submission. After you have confidently identified the food, you will then act as a food safety expert to provide storage tips.

The user has provided the following information:
{{#if foodImageUri}}
Primary source (Image): {{media url=foodImageUri}}
{{/if}}
{{#if foodDescription}}
Additional context (Description): {{{foodDescription}}}
{{/if}}

First, meticulously analyze the provided information, prioritizing the image, to identify the food item with the highest possible accuracy.
Then, provide clear, concise, and actionable storage tips for that specific item. Include recommendations for refrigeration, freezing, and pantry storage if applicable. Be encouraging and friendly.

Structure your response as a single string to fit the output schema.`,
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
