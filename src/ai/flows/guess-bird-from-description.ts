
'use server';
/**
 * @fileOverview An AI flow for identifying a bird species from a user's description.
 * 
 * - guessBirdFromDescription - A function that takes a description and returns a likely bird species.
 * - BirdResultSchema - The Zod schema for the output of the AI flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { birds } from '@/data/birds';

/**
 * The Zod schema for the result of the bird guessing flow.
 * It ensures the AI's output matches the expected format.
 */
export const BirdResultSchema = z.object({
  birdId: z.string().describe('The machine-readable ID of the bird, e.g., "american_robin". This must be one of the provided valid IDs.'),
  birdName: z.string().describe('The common name of the bird, e.g., "American Robin".'),
  reasoning: z.string().describe('A brief explanation for why the AI chose this bird based on the description.'),
});
export type BirdResult = z.infer<typeof BirdResultSchema>;

/**
 * An AI flow that guesses a bird species based on a textual description.
 * It uses a powerful language model to match the description against a known list of birds.
 * @param description - A string containing the user's description of the bird.
 * @returns A promise that resolves to an object containing the guessed bird's ID, name, and the reasoning.
 */
export async function guessBirdFromDescription(description: string): Promise<BirdResult> {
    const birdList = birds.map(b => ({ id: b.id, name: b.name }));

    // Define a Genkit prompt with a specific instruction and data format.
    const prompt = ai.definePrompt({
        name: 'birdGuesserPrompt',
        input: { schema: z.string() },
        output: { schema: BirdResultSchema },
        prompt: `
            You are a bird identification expert. Based on the user's description,
            your task is to identify the most likely bird from the provided list.

            Your response must be in the specified JSON format and include the reasoning
            for your choice.

            Here is the list of possible birds (use the 'id' for the birdId field):
            ${JSON.stringify(birdList, null, 2)}

            User's description:
            "{{input}}"
        `,
    });

    // Execute the prompt with the user's description.
    const { output } = await prompt(description);

    if (!output) {
        throw new Error("The AI failed to provide a valid response.");
    }
    
    return output;
}
