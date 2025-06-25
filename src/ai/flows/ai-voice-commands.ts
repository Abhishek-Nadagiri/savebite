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
  action: z.enum(['getStorageTips', 'postLeftovers', 'findFoodNearMe', 'scanBarcode', 'navigateHome']).describe('The action to be performed based on the voice command.'),
  parameters: z.object({
    food: z.string().optional().describe('The food item for storage tips, if applicable. Extract from the user\'s command.'),
  }).optional().describe('Parameters associated with the action.'),
});
export type ProcessVoiceCommandOutput = z.infer<typeof ProcessVoiceCommandOutputSchema>;

export async function processVoiceCommand(input: ProcessVoiceCommandInput): Promise<ProcessVoiceCommandOutput> {
  return processVoiceCommandFlow(input);
}

const voiceCommandPrompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ProcessVoiceCommandInputSchema },
  output: { schema: ProcessVoiceCommandOutputSchema },
  prompt: `You are the command processing unit for a food waste reduction app. Your task is to interpret the user's voice command and translate it into a structured action.

Available actions are:
- 'getStorageTips': Triggered when the user asks for storage advice. If they mention a specific food (e.g., "how to store avocados"), you must extract "avocados" into the 'food' parameter.
- 'postLeftovers': Triggered when the user wants to share or post leftover food.
- 'findFoodNearMe': Triggered when the user is looking for available food nearby.
- 'scanBarcode': Triggered when the user wants to use the barcode scanning feature.
- 'navigateHome': A fallback action for ambiguous commands or when the user wants to go to the main screen.

User's voice command: "{{{voiceCommand}}}"

Based on the command, determine the single most appropriate action from the list above. If the action is 'getStorageTips' and a food item is mentioned, populate the 'parameters.food' field. For all other actions, the 'parameters' object can be omitted.

Respond strictly in the JSON format defined by the output schema.`,
});

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: ProcessVoiceCommandInputSchema,
    outputSchema: ProcessVoiceCommandOutputSchema,
  },
  async (input) => {
    const { output } = await voiceCommandPrompt(input);
    return output!;
  }
);
