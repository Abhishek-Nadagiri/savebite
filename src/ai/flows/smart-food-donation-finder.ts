'use server';
/**
 * @fileOverview This file implements the Genkit flow for the smart food donation finder feature.
 *
 * It allows users to find nearby food donation spots ranked by distance, opening hours, and availability.
 * - findFoodDonationSpots - A function that handles the food donation spot finding process.
 * - FindFoodDonationSpotsInput - The input type for the findFoodDonationSpots function.
 * - FindFoodDonationSpotsOutput - The return type for the findFoodDonationSpots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindFoodDonationSpotsInputSchema = z.object({
  userLocation: z
    .object({
      latitude: z.number().describe('The latitude of the user.'),
      longitude: z.number().describe('The longitude of the user.'),
    })
    .describe('The current location of the user.'),
  foodType: z.string().describe('The type of food the user wants to donate.'),
  quantity: z.string().describe('The quantity of food the user wants to donate.'),
});
export type FindFoodDonationSpotsInput = z.infer<typeof FindFoodDonationSpotsInputSchema>;

const DonationSpotSchema = z.object({
  name: z.string().describe('The name of the donation spot.'),
  location: z.object({
    latitude: z.number().describe('The latitude of the donation spot.'),
    longitude: z.number().describe('The longitude of the donation spot.'),
  }),
  openingHours: z.string().describe('The opening hours of the donation spot.'),
  availability: z.string().describe('The current availability of the donation spot.'),
  distance: z.number().describe('The distance from the user in kilometers.'),
  suitabilityScore: z
    .number() 
    .describe('A score indicating the suitability of the donation spot for the given food type and quantity, considering availability and opening hours.'),
});

const FindFoodDonationSpotsOutputSchema = z.array(DonationSpotSchema);
export type FindFoodDonationSpotsOutput = z.infer<typeof FindFoodDonationSpotsOutputSchema>;

export async function findFoodDonationSpots(input: FindFoodDonationSpotsInput): Promise<FindFoodDonationSpotsOutput> {
  return findFoodDonationSpotsFlow(input);
}

const donationFinderPrompt = ai.definePrompt({
    name: 'donationFinderPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: FindFoodDonationSpotsInputSchema },
    output: { schema: FindFoodDonationSpotsOutputSchema },
    prompt: `You are a helpful local guide. A user wants to donate food and is looking for suitable locations. Their current location is latitude: {{{userLocation.latitude}}}, longitude: {{{userLocation.longitude}}}. They want to donate "{{quantity}}" of "{{foodType}}".

Generate a list of three *fictional but plausible-sounding* food donation spots near the user's location. For each spot, you must provide:
- A name (e.g., "The Cornerstone Pantry", "Westside Community Fridge").
- A location with latitude and longitude that are realistically close (within a 0.05 degree radius) to the user's coordinates.
- Plausible opening hours.
- Availability status related to the user's donation (e.g., "Accepting all donations", "Especially needs {{foodType}}", "Call ahead for large donations").
- A distance in kilometers from the user's location (you can estimate this, it doesn't have to be exact).
- A suitability score between 0.7 and 1.0, where a higher score indicates a better match for the user's donation type, quantity, and proximity.

Return the response as a JSON array that strictly follows the output schema. Do not add any extra commentary.`,
});

const findFoodDonationSpotsFlow = ai.defineFlow(
  {
    name: 'findFoodDonationSpotsFlow',
    inputSchema: FindFoodDonationSpotsInputSchema,
    outputSchema: FindFoodDonationSpotsOutputSchema,
  },
  async (input) => {
    const { output } = await donationFinderPrompt(input);
    // The prompt should generate a sorted list, but we can sort here just in case.
    return output!.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
);
