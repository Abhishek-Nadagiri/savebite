import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_API_KEY) {
  console.warn('WARNING: The GOOGLE_API_KEY environment variable is not set. AI features will not work. Please add it as a secret in your Firebase App Hosting backend settings to enable AI functionality in production.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
