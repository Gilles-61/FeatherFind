
/**
 * @fileoverview This file configures the Genkit AI framework.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the Genkit AI platform with the Google AI plugin.
// This allows the application to use Google's generative AI models.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Log events to the console for debugging.
  // Set to 'warn' or 'error' in production environments.
  logLevel: 'debug',
  // Enable OpenTelemetry for tracing and monitoring.
  // This is useful for debugging and performance analysis.
  enableTracing: true,
});
