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

const prompt = ai.definePrompt({
  name: 'estimatePlatesSavedPrompt',
  input: {schema: EstimatePlatesSavedInputSchema},
  output: {schema: EstimatePlatesSavedOutputSchema},
  prompt: `You are an AI assistant that estimates the number of plates saved based on the number of leftover posts.

  Your estimate should be a heuristic based on the number of posts provided by the user:
  {{numberOfPosts}}

  Your estimate of the number of plates saved should be conservative and take into account that not all posts will result in a plate being saved.
  For each post, assume that 0.5 plates are saved on average.
  Return an explanation of the heuristic used to estimate the number of plates saved, using at most two sentences.
  `,
});

const estimatePlatesSavedFlow = ai.defineFlow(
  {
    name: 'estimatePlatesSavedFlow',
    inputSchema: EstimatePlatesSavedInputSchema,
    outputSchema: EstimatePlatesSavedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
