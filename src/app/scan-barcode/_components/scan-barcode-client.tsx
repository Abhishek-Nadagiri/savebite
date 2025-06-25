'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { intelligentBarcodeScan, type BarcodeScanOutput } from '@/ai/flows/intelligent-barcode-scan';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ScanSearch, Lightbulb, Package, Archive, CameraOff } from 'lucide-react';

const formSchema = z.object({
  barcodeData: z.string().min(3, 'Please enter barcode data.'),
});

export function ScanBarcodeClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BarcodeScanOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { barcodeData: '' },
  });
  
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan barcodes.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function to stop video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  

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

  const handleScanClick = () => {
    if (!hasCameraPermission) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Ready',
        description: 'Please grant camera access to use the scanner.',
      });
      return;
    }
    // Simulate a scan by generating a random barcode and submitting.
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    form.setValue('barcodeData', randomBarcode);
    onSubmit({ barcodeData: randomBarcode });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Food Barcode</CardTitle>
        <CardDescription>Point your camera at a barcode to get usage and storage suggestions from our AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11/12 h-3/5 border-4 border-dashed border-white/50 rounded-lg shadow-inner" />
          </div>
           { !hasCameraPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
              <CameraOff className="h-10 w-10 mb-2 text-muted-foreground" />
              <p className="font-bold">Camera Access Required</p>
              <p className="text-sm text-muted-foreground">Please allow camera access in your browser to use the scanner.</p>
            </div>
          )}
        </div>
        
        <Button onClick={handleScanClick} disabled={isLoading || !hasCameraPermission} className="w-full h-12 text-lg">
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : <><ScanSearch className="mr-2 h-5 w-5" /> Tap to Scan</>}
        </Button>
        
        <details className="text-center">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Or use manual entry</summary>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 text-left">
              <FormField control={form.control} name="barcodeData" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode Data</FormLabel>
                    <FormControl><Input placeholder="e.g., 012345678905" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <>Get Product Info</>}
              </Button>
            </form>
          </Form>
        </details>

        {result && (
          <div className="mt-8 space-y-4 border-t pt-6">
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
