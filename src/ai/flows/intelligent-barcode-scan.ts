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

const prompt = ai.definePrompt({
  name: 'intelligentBarcodeScanPrompt',
  input: {schema: BarcodeScanInputSchema},
  output: {schema: BarcodeScanOutputSchema},
  prompt: `You are a helpful assistant that provides information about food products based on their barcode data.

  Given the barcode data for a food product, you will:
  1.  Infer the product name.
  2.  Provide suggestions on how to best use the product.
  3.  Provide suggestions on how to store the product to maximize its freshness and shelf life.

  Barcode Data: {{{barcodeData}}}
  `,
});

const intelligentBarcodeScanFlow = ai.defineFlow(
  {
    name: 'intelligentBarcodeScanFlow',
    inputSchema: BarcodeScanInputSchema,
    outputSchema: BarcodeScanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
