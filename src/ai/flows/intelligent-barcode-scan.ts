'use server';

/**
 * @fileOverview This file implements the Genkit flow for the intelligentBarcodeScan story.
 *
 * It allows users to scan a food barcode and get usage and storage suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BarcodeScanInputSchema = z.object({
  barcodeData: z.string().describe('The data extracted from the scanned barcode.'),
});
export type BarcodeScanInput = z.infer<typeof BarcodeScanInputSchema>;

const BarcodeScanOutputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  usageSuggestions: z.string().describe('Suggestions on how to use the product.'),
  storageSuggestions: z.string().describe('Suggestions on how to store the product to maximize freshness.'),
});
export type BarcodeScanOutput = z.infer<typeof BarcodeScanOutputSchema>;

export async function intelligentBarcodeScan(input: BarcodeScanInput): Promise<BarcodeScanOutput> {
  return intelligentBarcodeScanFlow(input);
}

const barcodePrompt = ai.definePrompt({
  name: 'barcodePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: BarcodeScanInputSchema },
  output: { schema: BarcodeScanOutputSchema },
  prompt: `You are a creative food product inventor. You do not have access to a real product database.
A user has scanned a barcode with the following data: {{{barcodeData}}}.

Invent a plausible and interesting food product that could correspond to this barcode. Provide the following details for this fictional product:
1.  **productName**: A creative and appealing name.
2.  **usageSuggestions**: Fun and practical ideas on how to use the product.
3.  **storageSuggestions**: Clear instructions on how to store it before and after opening to maximize freshness.

Format your response exactly according to the output schema. Do not state that the product is fictional.`,
});

const intelligentBarcodeScanFlow = ai.defineFlow(
  {
    name: 'intelligentBarcodeScanFlow',
    inputSchema: BarcodeScanInputSchema,
    outputSchema: BarcodeScanOutputSchema,
  },
  async (input) => {
    const { output } = await barcodePrompt(input);
    return output!;
  }
);
