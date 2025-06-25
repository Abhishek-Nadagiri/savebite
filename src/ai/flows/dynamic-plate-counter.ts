'use server';

/**
 * @fileOverview Estimates the number of plates saved based on the number of leftover posts.
 *
 * - estimatePlatesSaved - A function that estimates the number of plates saved.
 * - EstimatePlatesSavedInput - The input type for the estimatePlatesSaved function.
 * - EstimatePlatesSavedOutput - The return type for the estimatePlatesSaved function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatePlatesSavedInputSchema = z.object({
  numberOfPosts: z
    .number()
    .describe('The number of leftover posts made by users.'),
});
export type EstimatePlatesSavedInput = z.infer<typeof EstimatePlatesSavedInputSchema>;

const EstimatePlatesSavedOutputSchema = z.object({
  estimatedPlatesSaved: z
    .number()
    .describe(
      'The estimated number of plates saved based on the number of leftover posts.'
    ),
  explanation: z
    .string()
    .describe(
      'Explanation of the heuristic used to estimate the number of plates saved.'
    ),
});
export type EstimatePlatesSavedOutput = z.infer<typeof EstimatePlatesSavedOutputSchema>;

export async function estimatePlatesSaved(
  input: EstimatePlatesSavedInput
): Promise<EstimatePlatesSavedOutput> {
  return estimatePlatesSavedFlow(input);
}

const plateCounterPrompt = ai.definePrompt({
    name: 'plateCounterPrompt',
    input: { schema: EstimatePlatesSavedInputSchema },
    output: { schema: EstimatePlatesSavedOutputSchema },
    prompt: `You are an AI analyst for a food waste reduction app. The community has made {{{numberOfPosts}}} posts about leftover food.

Your task is to:
1. Calculate an estimated number of plates saved. Use a heuristic where approximately 1 plate is saved for every 2 posts (i.e., multiply the number of posts by 0.5 and round down to the nearest whole number).
2. Write a short, encouraging explanation about this achievement. Mention the collective impact and the simple assumption used for the estimate.

Format your response to fit the output schema.
`,
});

const estimatePlatesSavedFlow = ai.defineFlow(
  {
    name: 'estimatePlatesSavedFlow',
    inputSchema: EstimatePlatesSavedInputSchema,
    outputSchema: EstimatePlatesSavedOutputSchema,
  },
  async (input) => {
    const { output } = await plateCounterPrompt(input);
    return output!;
  }
);
