'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStorageTips, type GetStorageTipsOutput } from '@/ai/flows/get-storage-tips';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Lightbulb, Mic, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  foodDescription: z.string().optional(),
  foodImage: z.any().optional(),
}).refine(
  (data) => (data.foodDescription && data.foodDescription.length > 2) || data.foodImage?.[0], {
    message: 'Please describe the food (at least 3 characters) or upload an image.',
    path: ['foodDescription'], // Show error on the description field
  }
);

export function StorageTipsClient() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const foodFromVoice = searchParams.get('food');

  const [result, setResult] = useState<GetStorageTipsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { foodDescription: foodFromVoice || '' },
  });
  
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const imageBase64 = values.foodImage?.[0] ? await toBase64(values.foodImage[0]) : undefined;
      const response = await getStorageTips({
        foodDescription: values.foodDescription,
        foodImageUri: imageBase64,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get storage tips.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (foodFromVoice && !autoSubmitted) {
        form.setValue('foodDescription', foodFromVoice);
        // Automatically submit form if populated from voice command
        form.handleSubmit(onSubmit)();
        setAutoSubmitted(true);
    }
  }, [foodFromVoice, form, onSubmit, autoSubmitted]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.interimResults = false;
        recognitionInstance.maxAlternatives = 1;
        setRecognition(recognitionInstance);
      } else {
        console.warn("Speech Recognition not supported by this browser.");
      }
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      toast({ title: "Heard you say...", description: `"${transcript}"` });
      form.setValue('foodDescription', transcript);
      form.handleSubmit(onSubmit)();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
       if (event.error !== 'no-speech') {
        toast({ variant: "destructive", title: "Mic Error", description: "Couldn't access the microphone." });
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

  }, [recognition, form, onSubmit, toast]);

  const handleListen = () => {
    if (!recognition) {
        toast({ variant: "destructive", title: "Not Supported", description: "Voice commands are not supported in your browser." });
        return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Food Assistant</CardTitle>
        <CardDescription>
          Ask how to store any food item to get storage tips and simple recipe ideas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="foodDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the food</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'half an avocado', 'cooked rice', 'fresh basil'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-muted"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <FormField control={form.control} name="foodImage" render={({ field }) => (
              <FormItem>
                <FormLabel>Upload an Image</FormLabel>
                <FormControl>
                   <div className="flex items-center gap-4">
                    {preview && <Image src={preview} alt="Food preview" width={64} height={64} className="rounded-lg object-cover" data-ai-hint="food meal"/>}
                    <Input type="file" accept="image/*" className="w-full" onChange={(e) => {
                        field.onChange(e.target.files);
                        handleFileChange(e);
                      }} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Info...</> : 'Get Tips & Recipes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className={cn(
                  "w-full",
                  isListening && "bg-red-500/20 border-red-500 text-red-600 animate-pulse"
                )}
                onClick={handleListen}
                disabled={isLoading}
              >
                  <Mic className="mr-2 h-4 w-4"/>
                  {isListening ? 'Listening...' : 'Use Voice'}
              </Button>
            </div>
          </form>
        </Form>

        {isLoading && !result && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Working on it, please wait...</p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Storage Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.storageTips}</p>
              </CardContent>
            </Card>

            {result.recipes && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UtensilsCrossed className="h-5 w-5 text-green-500" />
                    Recipe Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{result.recipes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
