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

const estimatePlatesSavedFlow = ai.defineFlow(
  {
    name: 'estimatePlatesSavedFlow',
    inputSchema: EstimatePlatesSavedInputSchema,
    outputSchema: EstimatePlatesSavedOutputSchema,
  },
  async (input) => {
    const estimatedPlatesSaved = Math.floor(input.numberOfPosts * 0.5);
    return {
      estimatedPlatesSaved,
      explanation: "This is an estimate based on all posts. We figure that for every two leftovers shared, at least one full meal is saved from waste!",
    };
  }
);
