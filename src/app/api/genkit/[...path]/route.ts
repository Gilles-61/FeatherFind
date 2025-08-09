
'use server';

import { createAppHostingHandler } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';
 
export const { GET, POST } = createAppHostingHandler({
  ai,
});
