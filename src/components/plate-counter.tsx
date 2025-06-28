'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function PlateCounter() {
  const [platesSaved, setPlatesSaved] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // Function to read from localStorage and update state
    const updateCount = () => {
      const savedCount = localStorage.getItem('platesSavedCount');
      const newCount = savedCount ? parseInt(savedCount, 10) : 0;
      setPlatesSaved(newCount);
    };

    // Set initial count and avoid animation on first load
    const savedCount = localStorage.getItem('platesSavedCount');
    const initialCount = savedCount ? parseInt(savedCount, 10) : 0;
    setPlatesSaved(initialCount);
    setDisplayCount(initialCount);

    // Listen for custom event to update count from other components in the same tab
    window.addEventListener('storageUpdate', updateCount);

    return () => {
      window.removeEventListener('storageUpdate', updateCount);
    };
  }, []);

  useEffect(() => {
    if (platesSaved === null || displayCount === platesSaved) return;

    let current = displayCount;
    const target = platesSaved;

    const duration = 1000; // Animate over 1 second
    const range = target - current;
    
    // Ensure we don't divide by zero
    if (range === 0) return;

    const stepDuration = duration / Math.abs(range);

    const timer = setInterval(() => {
      current += Math.sign(range);
      setDisplayCount(current);
      if (current === target) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [platesSaved, displayCount]);

  if (platesSaved === null) {
    return (
      <div className="flex flex-col items-center gap-2 z-10">
        <Skeleton className="h-16 w-40 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 z-10">
      <p className="text-6xl font-bold font-headline text-primary-foreground bg-primary rounded-xl px-6 py-2 shadow-lg">
        {displayCount}
      </p>
      <p className="font-semibold text-lg text-primary">Plates Saved</p>
    </div>
  );
}
