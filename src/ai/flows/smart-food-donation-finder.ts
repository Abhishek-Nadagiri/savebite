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

const prompt = ai.definePrompt({
  name: 'findFoodDonationSpotsPrompt',
  input: {schema: FindFoodDonationSpotsInputSchema},
  output: {schema: FindFoodDonationSpotsOutputSchema},
  prompt: `You are an AI assistant designed to help users find suitable food donation spots near them.

  Given the user's current location (latitude: {{{userLocation.latitude}}}, longitude: {{{userLocation.longitude}}}),
  the type of food they want to donate ({{{foodType}}}), and the quantity ({{{quantity}}}),
  find nearby donation spots and rank them based on distance, opening hours, and current availability.

  Consider the following factors when ranking donation spots:
  - Distance: Shorter distance is preferred.
  - Opening Hours: Donation spots that are currently open or will be open soon are preferred.
  - Availability: Donation spots that are currently accepting the specified food type and quantity are preferred.

  Return an array of donation spots, sorted by their suitability score in descending order.
  Each donation spot should include its name, location (latitude and longitude), opening hours, availability, distance from the user (in kilometers), and a suitability score.
  The suitability score should be a number between 0 and 1, with 1 being the most suitable.

  Example Donation Spot:
  {
    "name": "Local Food Bank",
    "location": {
      "latitude": 34.0522,
      "longitude": -118.2437
    },
    "openingHours": "9 AM - 5 PM",
    "availability": "Accepting all types of food",
    "distance": 2.5,
    "suitabilityScore": 0.9
  }
  `,
});

const findFoodDonationSpotsFlow = ai.defineFlow(
  {
    name: 'findFoodDonationSpotsFlow',
    inputSchema: FindFoodDonationSpotsInputSchema,
    outputSchema: FindFoodDonationSpotsOutputSchema,
  },
  async input => {\n    // Here, instead of returning dummy data or hardcoding, we call the LLM with the prompt to get the donation spots.
    const {output} = await prompt(input);
    return output!;
  }
);
