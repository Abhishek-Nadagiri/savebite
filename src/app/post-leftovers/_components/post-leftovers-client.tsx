'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postLeftovers, type PostLeftoversOutput } from '@/ai/flows/post-leftovers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UploadCloud, CheckCircle, Calendar, Sparkles, Trash2 } from 'lucide-react';

const formSchema = z.object({
  foodImage: z.any().refine((file) => file?.[0], 'Food image is required.'),
  textDescription: z.string().optional(),
});

export function PostLeftoversClient() {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PostLeftoversOutput | null>(null);
  const [isPosted, setIsPosted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setIsPosted(false);
    try {
      const imageBase64 = await toBase64(values.foodImage[0]);
      const response = await postLeftovers({
        foodImageUri: imageBase64,
        textDescription: values.textDescription,
      });
      setResult(response);
      toast({ title: 'Analysis Complete!', description: 'AI has generated details for your post.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not analyze the food image.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmPost = () => {
    const currentCount = parseInt(localStorage.getItem('platesSavedCount') || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem('platesSavedCount', newCount.toString());
    window.dispatchEvent(new Event('storageUpdate'));
    setIsPosted(true);
    toast({ title: 'Posted!', description: 'Your leftover is now publicly listed.' });
  };

  const handleDeletePost = () => {
    const currentCount = parseInt(localStorage.getItem('platesSavedCount') || '0', 10);
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      localStorage.setItem('platesSavedCount', newCount.toString());
      window.dispatchEvent(new Event('storageUpdate'));
    }
    setIsPosted(false);
    setResult(null);
    form.reset();
    setPreview(null);
    toast({ title: 'Post Deleted', description: 'Your leftover post has been removed.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Your Leftovers</CardTitle>
        <CardDescription>Upload a picture of your leftovers and let AI do the rest. Your post will be made public for others to claim.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="foodImage" render={({ field }) => (
              <FormItem>
                <FormLabel>Food Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {preview && <Image src={preview} alt="Food preview" width={80} height={80} className="rounded-lg object-cover" data-ai-hint="food meal" />}
                    <div className="w-full">
                      <Input type="file" accept="image/*" onChange={(e) => {
                          field.onChange(e.target.files);
                          handleFileChange(e);
                        }} />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="textDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Optional Description</FormLabel>
                <FormControl><Textarea placeholder="e.g., 'Made yesterday, contains nuts'" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><UploadCloud className="mr-2 h-4 w-4" /> Analyze & Create Post</>}
            </Button>
          </form>
        </Form>

        {result && (
          <Card className="mt-8 bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> AI Generated Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold">Food Name: <span className="font-normal">{result.foodName}</span></p>
              <p className="font-semibold">Estimated Freshness: <span className="font-normal">{result.freshness}</span></p>
              <p className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Suggested Expiry: <span className="font-normal">{new Date(result.expirationDate).toLocaleDateString()}</span></p>
              
              {!isPosted ? (
                <Button className="w-full mt-4" onClick={handleConfirmPost}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirm & Post Publicly
                </Button>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="text-center p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                      <p className="font-semibold flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5"/>Successfully posted!</p>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={handleDeletePost}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
