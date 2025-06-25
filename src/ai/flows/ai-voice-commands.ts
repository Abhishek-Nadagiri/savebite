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

const voiceCommandPrompt = ai.definePrompt({
  name: 'voiceCommandPrompt',
  input: { schema: ProcessVoiceCommandInputSchema },
  output: { schema: ProcessVoiceCommandOutputSchema },
  prompt: `You are the command processing unit for a food waste app. Your job is to interpret a user's voice command and map it to a specific action and its parameters.

The available actions are:
- 'getStorageTips': For when a user asks how to store something. The 'food' parameter should be extracted. If no specific food is mentioned, default to 'everything'.
- 'postLeftovers': For when a user wants to post or share their leftovers.
- 'findFoodNearMe': For when a user is looking for available food nearby.
- 'scanBarcode': For when a user wants to scan an item.
- 'navigateHome': For navigating to the home screen or for ambiguous commands.

User's voice command: "{{{voiceCommand}}}"

Analyze the command and determine the correct action and any necessary parameters. Respond in the format defined by the output schema.`,
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
