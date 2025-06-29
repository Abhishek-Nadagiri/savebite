import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_API_KEY) {
  throw new Error('The GOOGLE_API_KEY environment variable is not set. This is required for production builds. Please add it as a secret in your Firebase App Hosting backend settings.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
