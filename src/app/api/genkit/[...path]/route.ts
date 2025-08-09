/**
 * @fileoverview This file creates a Next.js API route handler for Genkit.
 *
 * It uses the `nextPlugin` from `@genkit-ai/next` to expose Genkit
 * flows and other functionality as API endpoints. This allows the
 * frontend of the application to interact with the Genkit backend.
 */

import { nextPlugin } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';

export const { GET, POST } = nextPlugin({ ai });
