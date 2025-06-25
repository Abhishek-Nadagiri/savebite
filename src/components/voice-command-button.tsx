'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Mic } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { processVoiceCommand } from '@/ai/flows/ai-voice-commands';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function VoiceCommandButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

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
  
  const handleCommand = useCallback((action: string, params?: Record<string, any>) => {
    switch (action) {
      case 'getStorageTips':
        const food = params?.food ? `?food=${encodeURIComponent(params.food)}` : '';
        router.push(`/storage-tips${food}`);
        break;
      case 'postLeftovers':
        router.push('/post-leftovers');
        break;
      case 'findFoodNearMe':
        router.push('/find-food');
        break;
      case 'scanBarcode':
        router.push('/scan-barcode');
        break;
      case 'navigateHome':
        router.push('/');
        break;
      default:
        toast({ title: "Unknown command", description: "I'm not sure how to handle that action." });
    }
  }, [router, toast]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;
      toast({ title: "Heard you say...", description: `"${command}"` });
      try {
        const result = await processVoiceCommand({ voiceCommand: command });
        handleCommand(result.action, result.parameters);
      } catch (error) {
        console.error("AI command processing failed:", error);
        toast({ variant: "destructive", title: "Oops!", description: "I had trouble understanding that." });
      } finally {
        setIsListening(false);
      }
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

  }, [recognition, toast, handleCommand]);

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

  return (
    <Button
      variant="outline"
      onClick={handleListen}
      className={cn(
        "w-full h-14 bg-white/80 backdrop-blur-sm border-primary/30 text-primary hover:bg-white hover:border-primary/50 font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5",
        isListening && "bg-red-500/20 border-red-500 text-red-600 animate-pulse"
      )}
    >
      <Mic className="mr-2 h-5 w-5" />
      {isListening ? 'Listening...' : 'Voice'}
    </Button>
  );
}
