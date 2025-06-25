'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { findFoodDonationSpots, type FindFoodDonationSpotsOutput } from '@/ai/flows/smart-food-donation-finder';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, MapPin, Clock, Star } from 'lucide-react';

const formSchema = z.object({
  foodType: z.string().min(2, 'Please specify the food type.'),
  quantity: z.string().min(1, 'Please specify the quantity.'),
});

type DonationSpot = FindFoodDonationSpotsOutput[0];

export function FindFoodClient() {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DonationSpot[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
          toast({ variant: 'destructive', title: 'Location Error', description: error.message });
        }
      );
    } else {
      const msg = 'Geolocation is not supported by this browser.';
      setLocationError(msg);
      toast({ variant: 'destructive', title: 'Unsupported', description: msg });
    }
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodType: '', quantity: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!location) {
      toast({ variant: 'destructive', title: 'Location Missing', description: 'Could not get your location. Please enable location services.' });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const spots = await findFoodDonationSpots({ userLocation: location, ...values });
      setResults(spots);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not find donation spots.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Donation Spots</CardTitle>
        <CardDescription>
          Enter details about the food you wish to donate. We'll find the best spots near you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {locationError && <p className="text-destructive text-center mb-4">{locationError}</p>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="foodType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Food</FormLabel>
                  <FormControl><Input placeholder="e.g., Canned goods, Fresh vegetables" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input placeholder="e.g., 1 box, 5 lbs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <Button type="submit" disabled={isLoading || !location} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find Spots
            </Button>
          </form>
        </Form>

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Recommended Spots</h3>
            {results.map((spot, index) => (
              <Card key={index} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{spot.name}</span>
                    <div className="flex items-center gap-1 text-sm font-medium bg-yellow-400/20 text-yellow-600 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4" />
                      <span>{(spot.suitabilityScore * 10).toFixed(1)}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> {spot.distance.toFixed(1)} km away - {spot.availability}</p>
                  <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {spot.openingHours}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
