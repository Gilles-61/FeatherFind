// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a flow to suggest bird species based on a textual description.
 *
 * - suggestBirds - A function that takes a textual description and returns a list of possible bird species.
 * - SuggestBirdsInput - The input type for the suggestBirds function.
 * - SuggestBirdsOutput - The return type for the suggestBirds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBirdsInputSchema = z.object({
  description: z.string().describe('A description of the bird sighting.'),
});
export type SuggestBirdsInput = z.infer<typeof SuggestBirdsInputSchema>;

const SuggestBirdsOutputSchema = z.array(
  z.object({
    name: z.string().describe('The common name of the bird.'),
    description: z.string().describe('A short description of the bird.'),
    imageUrl: z.string().describe('A URL to an image of the bird.'),
  })
);
export type SuggestBirdsOutput = z.infer<typeof SuggestBirdsOutputSchema>;

export async function suggestBirds(input: SuggestBirdsInput): Promise<SuggestBirdsOutput> {
  return suggestBirdsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBirdsPrompt',
  input: {schema: SuggestBirdsInputSchema},
  output: {schema: SuggestBirdsOutputSchema},
  prompt: `You are an expert ornithologist. Based on the following description of a bird sighting, suggest a list of possible bird species from a static bird database. Return the bird's name, description, and image URL. The output should be a JSON array of bird objects.

Description: {{{description}}}`,
});

const suggestBirdsFlow = ai.defineFlow(
  {
    name: 'suggestBirdsFlow',
    inputSchema: SuggestBirdsInputSchema,
    outputSchema: SuggestBirdsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
