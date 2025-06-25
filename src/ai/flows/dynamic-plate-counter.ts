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
  name: 'estimatePlatesSavedExplanationPrompt',
  output: {
    schema: z.object({
      explanation: z
        .string()
        .describe('An explanation of the heuristic used to estimate the number of plates saved.'),
    }),
  },
  prompt: `You are an AI assistant for a food-saving app. Your goal is to provide a brief, encouraging explanation for how "plates saved" are estimated.
  The estimation is a simple heuristic: we assume that for every two leftover food posts, one plate of food is saved on average.
  Please provide a one-to-two sentence explanation of this. For example: "This is an estimate based on all posts. We figure that for every two leftovers shared, at least one full meal is saved from waste!"`,
});

const estimatePlatesSavedFlow = ai.defineFlow(
  {
    name: 'estimatePlatesSavedFlow',
    inputSchema: EstimatePlatesSavedInputSchema,
    outputSchema: EstimatePlatesSavedOutputSchema,
  },
  async (input) => {
    const estimatedPlatesSaved = Math.floor(input.numberOfPosts * 0.5);
    const {output} = await prompt({});
    if (!output) {
      throw new Error('Failed to get explanation from AI.');
    }
    return {
      estimatedPlatesSaved,
      explanation: output.explanation,
    };
  }
);
