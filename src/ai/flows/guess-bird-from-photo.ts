'use server';
/**
 * @fileOverview An AI flow for identifying a bird species from a user's photo.
 *
 * - guessBirdFromPhoto - a function that takes a photo and returns a likely bird species.
 */

import { ai } from '@/ai/genkit';
import { birds } from '@/data/birds';
import type { BirdResult, GuessBirdFromPhotoInput } from '@/types';
import { BirdResultSchema, GuessBirdFromPhotoInputSchema } from '@/types';
import {z} from 'genkit';

/**
 * An AI flow that guesses a bird species based on a photo.
 * It uses a powerful multimodal language model to match the photo against a known list of birds.
 * @param input - An object containing the photo data URI.
 * @returns A promise that resolves to an object containing the guessed bird's ID, name, and the reasoning.
 */
export async function guessBirdFromPhoto(input: GuessBirdFromPhotoInput): Promise<BirdResult> {
    const birdList = birds.map(b => ({ id: b.id, name: b.name }));

    const prompt = ai.definePrompt({
        name: 'birdPhotoGuesserPrompt',
        input: { schema: GuessBirdFromPhotoInputSchema },
        output: { schema: BirdResultSchema },
        prompt: `
            You are a world-renowned ornithologist. Based on the user's photo,
            your task is to identify the most likely bird from the provided list.

            Your response must be in the specified JSON format and include the reasoning
            for your choice. If the image is not a bird, please indicate that in the reasoning.

            Here is the list of possible birds (use the 'id' for the birdId field):
            ${JSON.stringify(birdList, null, 2)}

            User's photo:
            {{media url=photoDataUri}}
        `,
    });

    const { output } = await prompt(input);

    if (!output) {
        throw new Error("The AI failed to provide a valid response.");
    }
    
    return output;
}
