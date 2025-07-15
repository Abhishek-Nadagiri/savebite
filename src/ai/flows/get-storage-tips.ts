
'use server';

/**
 * @fileOverview Provides food storage tips and recipe ideas based on a text description or image of the food.
 *
 * - getStorageTips - A function that accepts a text description and/or image of food and returns storage tips and recipes.
 * - GetStorageTipsInput - The input type for the getStorageTips function.
 * - GetStorageTipsOutput - The return type for the getStorageTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetStorageTipsObjectSchema = z.object({
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
});

const GetStorageTipsInputSchema = GetStorageTipsObjectSchema.refine(
  (data) => data.foodDescription || data.foodImageUri,
  {
    message: 'Either a food description or a food image must be provided.',
  }
);


export type GetStorageTipsInput = z.infer<typeof GetStorageTipsInputSchema>;

const GetStorageTipsOutputSchema = z.object({
  storageTips: z
    .string()
    .describe('Detailed storage tips for the described food.'),
  recipes: z
    .string()
    .describe('A few simple recipe ideas using the identified food item, formatted as a markdown list.'),
});
export type GetStorageTipsOutput = z.infer<typeof GetStorageTipsOutputSchema>;

export async function getStorageTips(
  input: GetStorageTipsInput
): Promise<GetStorageTipsOutput> {
  return getStorageTipsFlow(input);
}

const GetStorageTipsPromptInputSchema = GetStorageTipsObjectSchema.extend({
  currentDate: z.string().describe('The current date.'),
});


const getStorageTipsPrompt = ai.definePrompt({
  name: 'getStorageTipsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GetStorageTipsPromptInputSchema },
  output: { schema: GetStorageTipsOutputSchema },
  prompt: `You are a helpful food expert. The user wants to know how to store a food item and get some recipe ideas. Today's date is {{{currentDate}}}.

The user has provided the following information:
{{#if foodImageUri}}
- An image of the food: {{media url=foodImageUri}}
{{/if}}
{{#if foodDescription}}
- A text description: "{{{foodDescription}}}"
{{/if}}

Based on the available information (prioritizing the image if both are present), your task is to identify the food and provide two things in your response:
1.  **storageTips**: Clear, concise, and actionable storage tips for it. Include recommendations for refrigeration, freezing, and pantry storage if applicable.
2.  **recipes**: A few simple and creative recipe ideas using this food. Format the recipes as a markdown list (e.g., using '-' or '*').

Be encouraging and friendly in your tone.`,
});

const getStorageTipsFlow = ai.defineFlow(
  {
    name: 'getStorageTipsFlow',
    inputSchema: GetStorageTipsInputSchema,
    outputSchema: GetStorageTipsOutputSchema,
  },
  async (input) => {
    const currentDate = new Date().toLocaleDateString();
    const { output } = await getStorageTipsPrompt({ ...input, currentDate });
    return output!;
  }
);
