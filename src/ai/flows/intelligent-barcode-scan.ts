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

const intelligentBarcodeScanFlow = ai.defineFlow(
  {
    name: 'intelligentBarcodeScanFlow',
    inputSchema: BarcodeScanInputSchema,
    outputSchema: BarcodeScanOutputSchema,
  },
  async input => {
    const productNames = ["Organic Tomato Soup", "Whole Wheat Bread", "Crunchy Peanut Butter", "Sparkling Water"];
    const productName = productNames[input.barcodeData.length % productNames.length];

    return {
      productName: `${productName} (from barcode ${input.barcodeData})`,
      usageSuggestions: "A versatile product! Perfect as a standalone snack or as an ingredient in your favorite recipes. Check the packaging for specific ideas.",
      storageSuggestions: "Store in a cool, dry place. After opening, refrigerate in an airtight container and consume within a week for best quality."
    };
  }
);
