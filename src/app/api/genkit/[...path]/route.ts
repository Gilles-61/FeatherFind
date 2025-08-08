
// src/app/api/genkit/[...path]/route.ts
import {nextPlugin} from '@genkit-ai/next';
import {ai} from '@/ai/genkit';
export const {GET, POST} = nextPlugin(ai);
