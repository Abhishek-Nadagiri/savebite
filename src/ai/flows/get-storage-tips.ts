
'use server';

/**
 * @fileOverview Provides food storage tips and recipe ideas based on a text description or image of the food.
 *
 * - getStorageTips - A function that accepts a text description and/or image of food and returns storage tips and recipes.
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

type GetStorageTipsInput = z.infer<typeof GetStorageTipsInputSchema>;

const GetStorageTipsOutputSchema = z.object({
  storageTips: z
    .string()
    .describe('Detailed storage tips for the described food.'),
  recipes: z
    .string()
    .describe(
      'A few simple recipe ideas using the identified food item, formatted as a markdown list.'
    ),
});
export type GetStorageTipsOutput = z.infer<typeof GetStorageTipsOutputSchema>;

export async function getStorageTips(
  input: GetStorageTipsInput
): Promise<GetStorageTipsOutput> {
  return getStorageTipsFlow(input);
}

const getStorageTipsPrompt = ai.definePrompt({
  name: 'getStorageTipsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GetStorageTipsInputSchema},
  output: {schema: GetStorageTipsOutputSchema},
  prompt: `You are a helpful food expert. A user wants to know how to store a food item and get recipe ideas.

Analyze the user's input. They may have provided an image, a text description, or both.

- If an image is provided, use it as the primary source to identify the food.
- If only a text description is provided, use that for identification.
- If both are provided, rely on the image.

Your task is to provide two things in your response:
1.  **storageTips**: Clear, concise, and actionable storage tips for the identified food. Include recommendations for refrigeration, freezing, and pantry storage if applicable.
2.  **recipes**: A few simple and creative recipe ideas using this food. Format the recipes as a markdown list (e.g., using '-' or '*').

{{#if foodDescription}}
Description: "{{{foodDescription}}}"
{{/if}}
{{#if foodImageUri}}
Image: {{media url=foodImageUri}}
{{/if}}

Be friendly and encouraging in your tone.
`,
});

const getStorageTipsFlow = ai.defineFlow(
  {
    name: 'getStorageTipsFlow',
    inputSchema: GetStorageTipsInputSchema,
    outputSchema: GetStorageTipsOutputSchema,
  },
  async (input) => {
    const {output} = await getStorageTipsPrompt(input);
    return output!;
  }
);
