
'use server';
/**
 * @fileOverview An AI flow for identifying a bird species from a user's description.
 * 
 * - guessBirdFromDescription - a function that takes a description and returns a likely bird species.
 */

import { ai } from '@/ai/genkit';
import { birds } from '@/data/birds';
import type { BirdResult } from '@/types';
import { BirdResultSchema } from '@/types';

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

