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

const findFoodDonationSpotsFlow = ai.defineFlow(
  {
    name: 'findFoodDonationSpotsFlow',
    inputSchema: FindFoodDonationSpotsInputSchema,
    outputSchema: FindFoodDonationSpotsOutputSchema,
  },
  async (input) => {
    // LLMs are not well-suited for providing real-time, location-based data and will hallucinate.
    // In a real application, this would call a database or an external API.
    // For this demo, we are returning mock data.
    const mockSpots: FindFoodDonationSpotsOutput = [
      {
        name: "Community Food Pantry",
        location: { latitude: input.userLocation.latitude + 0.01, longitude: input.userLocation.longitude - 0.015 },
        openingHours: "Mon-Fri 9 AM - 4 PM",
        availability: "Accepting non-perishables",
        distance: 1.8,
        suitabilityScore: 0.9
      },
      {
        name: "Downtown Soup Kitchen",
        location: { latitude: input.userLocation.latitude - 0.02, longitude: input.userLocation.longitude + 0.005 },
        openingHours: "Daily 11 AM - 2 PM",
        availability: `Accepting ${input.foodType}`,
        distance: 2.5,
        suitabilityScore: 0.82
      },
      {
        name: "Westside Shelter",
        location: { latitude: input.userLocation.latitude + 0.005, longitude: input.userLocation.longitude + 0.025 },
        openingHours: "24/7",
        availability: "Accepting all donations",
        distance: 3.1,
        suitabilityScore: 0.75
      }
    ];

    // Sort by suitability score as the original prompt intended.
    return mockSpots.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
);
