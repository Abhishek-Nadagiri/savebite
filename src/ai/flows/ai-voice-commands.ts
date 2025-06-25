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

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: ProcessVoiceCommandInputSchema,
    outputSchema: ProcessVoiceCommandOutputSchema,
  },
  async (input): Promise<ProcessVoiceCommandOutput> => {
    const command = input.voiceCommand.toLowerCase();

    if (command.includes('store') || command.includes('storage')) {
      const foodMatch = command.match(/(?:store|storage tips for) (.*)/);
      const food = foodMatch ? foodMatch[1].trim() : 'everything';
      return { action: 'getStorageTips', parameters: { food } };
    }
    if (command.includes('post') && command.includes('leftovers')) {
      return { action: 'postLeftovers', parameters: {} };
    }
    if (command.includes('find') && command.includes('food')) {
      return { action: 'findFoodNearMe', parameters: {} };
    }
    if (command.includes('scan')) {
      return { action: 'scanBarcode', parameters: {} };
    }
    if (command.includes('home')) {
      return { action: 'navigateHome', parameters: {} };
    }
    
    // Default to navigateHome
    return { action: 'navigateHome', parameters: {} };
  }
);
