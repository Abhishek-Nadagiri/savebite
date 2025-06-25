'use client';

import { useState, useEffect } from 'react';
import { estimatePlatesSaved } from '@/ai/flows/dynamic-plate-counter';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PlateCounter() {
  const [platesSaved, setPlatesSaved] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    async function fetchPlatesSaved() {
      try {
        const numberOfPosts = 1040; // To get the desired "520" plates saved
        const result = await estimatePlatesSaved({ numberOfPosts });
        setPlatesSaved(result.estimatedPlatesSaved);
        setExplanation(result.explanation);
      } catch (error) {
        console.error("Failed to estimate plates saved:", error);
        setPlatesSaved(0);
        setExplanation("Could not calculate plates saved.");
      }
    }
    fetchPlatesSaved();
  }, []);

  useEffect(() => {
    if (platesSaved === null) return;
    
    let start = 0;
    const end = platesSaved;
    if (start === end) {
      setDisplayCount(end);
      return;
    };
    
    const duration = 2000;
    const incrementTime = Math.max(10, duration / end);
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [platesSaved]);

  if (platesSaved === null) {
    return (
      <div className="flex flex-col items-center gap-2 z-10">
        <Skeleton className="h-16 w-40 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 z-10 cursor-help">
            <p className="text-6xl font-bold font-headline text-primary-foreground bg-primary rounded-xl px-6 py-2 shadow-lg">
              {displayCount}
            </p>
            <p className="font-semibold text-lg text-primary">Plates Saved</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
