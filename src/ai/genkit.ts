/**
 * @fileoverview This file configures and exports the Genkit AI instance.
 *
 * It initializes the Genkit AI library with the Google AI plugin, enabling
 * access to Google's generative AI models. The configured `ai` instance
 * is then exported for use in other parts of the application, such as
 * in flows and API routes.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
