'use server';

/**
 * @fileoverview Defines a Genkit flow for identifying a bird species from a user's description.
 *
 * This file exports:
 * - `BirdGuess`: The type definition for the structured output (the AI's guess).
 * - `guessBirdFromDescription`: The server action that takes a description and returns a `BirdGuess`.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the AI's output using Zod.
// This ensures the AI provides a structured, predictable response.
const BirdGuessSchema = z.object({
  birdName: z
    .string()
    .describe('The common name of the bird species, e.g., "Blue Jay".'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A confidence score from 0.0 to 1.0, where 1.0 is highest confidence.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation for the guess, based on the user description.'
    ),
});
export type BirdGuess = z.infer<typeof BirdGuessSchema>;

// Define the main prompt for the AI model.
// It takes a string description as input and is configured to return
// an object matching the BirdGuessSchema.
const birdGuesserPrompt = ai.definePrompt({
  name: 'birdGuesser',
  input: { schema: z.string() },
  output: { schema: BirdGuessSchema },
  prompt: `
    You are an expert ornithologist.
    Based on the following user description of a bird, identify the most likely species.
    Provide your best guess, a confidence score, and your reasoning.

    Description: {{{prompt}}}
  `,
});

// Define the Genkit flow.
// This flow takes a string description, calls the AI prompt,
// and returns the structured response.
const guessBirdFlow = ai.defineFlow(
  {
    name: 'guessBirdFromDescription',
    inputSchema: z.string(),
    outputSchema: BirdGuessSchema,
  },
  async (description) => {
    const { output } = await birdGuesserPrompt(description);
    return output!;
  }
);

/**
 * Server action to get a bird species guess from a text description.
 * This is the function the front-end will call.
 * @param description The user's description of the bird.
 * @returns A promise that resolves to the AI's guess.
 */
export async function guessBirdFromDescription(
  description: string
): Promise<BirdGuess> {
  return await guessBirdFlow(description);
}
