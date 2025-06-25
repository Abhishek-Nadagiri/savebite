'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStorageTips } from '@/ai/flows/get-storage-tips';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Lightbulb, Camera, Mic } from 'lucide-react';

const formSchema = z.object({
  foodDescription: z.string().min(3, 'Please describe the food (e.g., "fresh strawberries").'),
});

export function StorageTipsClient() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const foodFromVoice = searchParams.get('food');

  const [tips, setTips] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodDescription: foodFromVoice || '' },
  });
  
  useEffect(() => {
    if (foodFromVoice) {
        form.setValue('foodDescription', foodFromVoice);
        // Automatically submit form if populated from voice command
        form.handleSubmit(onSubmit)();
    }
  }, [foodFromVoice, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTips('');
    try {
      const result = await getStorageTips(values);
      setTips(result.storageTips);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get storage tips.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePlaceholderClick = (feature: string) => {
    toast({ title: 'Coming Soon!', description: `${feature} input is not yet implemented.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Storage Tips</CardTitle>
        <CardDescription>
          Ask how to store any food item to maximize its freshness and reduce waste.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="foodDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>What food do you want to store?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'half an avocado', 'cooked rice', 'fresh basil'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
            <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => handlePlaceholderClick('Image')}>
                    <Camera className="mr-2 h-4 w-4"/> Use Image
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => handlePlaceholderClick('Voice')}>
                    <Mic className="mr-2 h-4 w-4"/> Use Voice
                </Button>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Tips...</> : 'Get Storage Tips'}
            </Button>
          </form>
        </Form>

        {isLoading && !tips && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Our AI is thinking...</p>
          </div>
        )}

        {tips && (
          <Card className="mt-8 bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Storage Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{tips}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
