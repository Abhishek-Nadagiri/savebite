'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { intelligentBarcodeScan, type BarcodeScanOutput } from '@/ai/flows/intelligent-barcode-scan';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ScanSearch, Lightbulb, Package, Archive } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  barcodeData: z.string().min(3, 'Please enter barcode data.'),
});

export function ScanBarcodeClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BarcodeScanOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { barcodeData: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await intelligentBarcodeScan(values);
      setResult(response);
      toast({ title: 'Product Identified!', description: 'AI has generated product details.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not identify product from barcode.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Food Barcode</CardTitle>
        <CardDescription>Enter the numbers from a food barcode to get usage and storage suggestions from our AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Camera Simulation</AlertTitle>
            <AlertDescription>
                For this demo, please manually type in the barcode data.
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="barcodeData" render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode Data</FormLabel>
                  <FormControl><Input placeholder="e.g., 012345678905" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><ScanSearch className="mr-2 h-4 w-4" /> Get Product Info</>}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-primary" />{result.productName}</h3>
            
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5"/>Usage Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{result.usageSuggestions}</p>
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Archive className="h-5 w-5"/>Storage Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{result.storageSuggestions}</p>
                </CardContent>
            </Card>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
