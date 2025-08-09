
/**
 * @fileoverview This file is used to configure Genkit for local development.
 *
 * It is not used in production.
 *
 * To run the Genkit developer UI, run `genkit start` in your terminal.
 */

import { ai } from './genkit';
import { dev } from '@genkit-ai/core';

dev(ai);
