'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center h-16 max-w-2xl">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="mr-2 rounded-full">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
        <h1 className="text-xl font-bold font-headline text-foreground">
          {title}
        </h1>
      </div>
    </header>
  );
}
