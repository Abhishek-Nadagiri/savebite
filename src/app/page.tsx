import Link from 'next/link';
import { Utensils, ScanLine, Mic, NotebookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlateCounter } from '@/components/plate-counter';
import { FloatingIcons } from '@/components/floating-icons';
import { VoiceCommandButton } from '@/components/voice-command-button';

export default function Home() {
 return (
 <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden relative">
 <FloatingIcons />

 <header className="text-center z-10 my-8">
 <div className="flex items-center justify-center gap-3 mb-2">
 <Utensils className="h-12 w-12 text-black drop-shadow-lg" />
 <h1 className="text-6xl font-bold font-headline text-black drop-shadow-lg">
 SaveBite
 </h1>
 </div>
 <p className="text-muted-foreground font-medium">Your smart assistant for reducing food waste.</p>
 </header>

 <PlateCounter />

 <main className="z-10 w-full max-w-xs mx-auto mt-10 grid grid-cols-1 gap-4">
 <Link href="/storage-tips" passHref>
 <Button className="w-full h-16 text-lg font-bold text-white bg-btn-green hover:bg-btn-green/90 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1">
 Get Storage Tips
 </Button>
 </Link>
 <Link href="/post-leftovers" passHref>
 <Button className="w-full h-16 text-lg font-bold text-white bg-btn-yellow hover:bg-btn-yellow/90 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:-translate-y-1">
 Post Leftovers
 </Button>
 </Link>
 <Link href="/find-food" passHref>
 <Button className="w-full h-16 text-lg font-bold text-white bg-btn-blue hover:bg-btn-blue/90 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
 Find Food Near Me
 </Button>
 </Link>
 <Link href="/my-posts" passHref>
 <Button variant="secondary" className="w-full h-16 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
 <NotebookText className="mr-2 h-6 w-6" />
 My Posts
 </Button>
 </Link>
 </main>

 <div className="z-10 w-full max-w-xs mx-auto mt-4 grid grid-cols-2 gap-4">
 <Link href="/scan-barcode" passHref>
 <Button variant="outline" className="w-full h-14 bg-white/80 backdrop-blur-sm border-primary/30 text-primary hover:bg-white hover:border-primary/50 font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
 <ScanLine className="mr-2 h-5 w-5" />
 Scan
          </Button>
        </Link>
 <VoiceCommandButton />
 </div>
 </div>
 );
}
