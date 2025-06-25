import { config } from 'dotenv';
config();

import '@/ai/flows/post-leftovers.ts';
import '@/ai/flows/intelligent-barcode-scan.ts';
import '@/ai/flows/get-storage-tips.ts';
import '@/ai/flows/smart-food-donation-finder.ts';
import '@/ai/flows/dynamic-plate-counter.ts';
import '@/ai/flows/ai-voice-commands.ts';