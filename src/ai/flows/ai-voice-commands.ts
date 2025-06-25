'use server';

/**
 * @fileOverview A voice command processing AI agent.
 *
 * - processVoiceCommand - A function that handles the voice command process.
 * - ProcessVoiceCommandInput - The input type for the processVoiceCommand function.
 * - ProcessVoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessVoiceCommandInputSchema = z.object({
  voiceCommand: z.string().describe('The voice command uttered by the user.'),
});
export type ProcessVoiceCommandInput = z.infer<typeof ProcessVoiceCommandInputSchema>;

const ProcessVoiceCommandOutputSchema = z.object({
  action: z.string().describe('The action to be performed based on the voice command. Possible values: getStorageTips, postLeftovers, findFoodNearMe, scanBarcode, navigateHome.'),
  parameters: z.record(z.string(), z.any()).optional().describe('Optional parameters associated with the action, such as food item for storage tips.'),
});
export type ProcessVoiceCommandOutput = z.infer<typeof ProcessVoiceCommandOutputSchema>;

export async function processVoiceCommand(input: ProcessVoiceCommandInput): Promise<ProcessVoiceCommandOutput> {
  return processVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processVoiceCommandPrompt',
  input: {schema: ProcessVoiceCommandInputSchema},
  output: {schema: ProcessVoiceCommandOutputSchema},
  prompt: `You are a voice command processor for the SaveBite application. Your task is to interpret the user's voice command and determine the appropriate action to take.

Available actions:
- getStorageTips: Get storage tips for a specific food item. Parameters: food (string, optional).
- postLeftovers: Post leftover food. No parameters.
- findFoodNearMe: Find food donation spots nearby. No parameters.
- scanBarcode: Scan a barcode. No parameters.
- navigateHome: Navigate to the home screen. No parameters.

Voice Command: {{{voiceCommand}}}

Respond with a JSON object containing the action and any associated parameters. Ensure the action is one of the available actions listed above. If the voice command is unclear or doesn't match any known action, default to navigateHome. If the voice command asks for storage tips, attempt to extract the food item from the command.

Example 1:
Input: How should I store cooked rice?
Output: { "action": "getStorageTips", "parameters": { "food": "cooked rice" } }

Example 2:
Input: Post leftovers
Output: { "action": "postLeftovers" }

Example 3:
Input: Find food near me
Output: { "action": "findFoodNearMe" }

Example 4:
Input: Scan this
Output: { "action": "scanBarcode" }

Example 5:
Input: Go back to home
Output: { "action": "navigateHome" }

Output:
`, safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
});

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: ProcessVoiceCommandInputSchema,
    outputSchema: ProcessVoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
