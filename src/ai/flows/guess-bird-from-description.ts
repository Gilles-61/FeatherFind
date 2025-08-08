// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a flow to guess bird species from a textual description using a tool for bird facts.
 *
 * - guessBirdFromDescription - A function that takes a textual description and returns a list of possible bird species, incorporating bird facts if helpful.
 * - GuessBirdFromDescriptionInput - The input type for the guessBirdFromDescription function.
 * - GuessBirdFromDescriptionOutput - The return type for the guessBirdFromDescription function.
 */

import {ai} from '@/ai/genkit';
import { getBirds } from '@/lib/data';
import {z} from 'genkit';

const GuessBirdFromDescriptionInputSchema = z.object({
  description: z.string().describe('A description of the bird sighting.'),
});
export type GuessBirdFromDescriptionInput = z.infer<typeof GuessBirdFromDescriptionInputSchema>;

const GuessBirdFromDescriptionOutputSchema = z.array(
  z.object({
    name: z.string().describe('The common name of the bird.'),
    description: z.string().describe('A short description of the bird, including any relevant facts.'),
    imageUrl: z.string().describe('A URL to an image of the bird.'),
  })
);
export type GuessBirdFromDescriptionOutput = z.infer<typeof GuessBirdFromDescriptionOutputSchema>;

export async function guessBirdFromDescription(input: GuessBirdFromDescriptionInput): Promise<GuessBirdFromDescriptionOutput> {
  return guessBirdFromDescriptionFlow(input);
}

const getBirdFacts = ai.defineTool({
  name: 'getBirdFacts',
  description: 'Retrieves facts or a detailed description about a specific bird species.',
  inputSchema: z.object({
    birdName: z.string().describe('The common name of the bird.'),
  }),
  outputSchema: z.string().describe('Interesting facts or a detailed description of the bird.'),
},
async (input) => {
    const allBirds = await getBirds();
    const bird = allBirds.find(b => b.name.toLowerCase() === input.birdName.toLowerCase());
    if (bird) {
      return bird.description;
    }
    return `No specific facts found for ${input.birdName}. It is a known bird species.`;
  }
);

const prompt = ai.definePrompt({
  name: 'guessBirdFromDescriptionPrompt',
  input: { schema: GuessBirdFromDescriptionInputSchema },
  output: { schema: GuessBirdFromDescriptionOutputSchema },
  tools: [getBirdFacts],
  prompt: `You are an expert ornithologist. Based on the following description of a bird sighting, suggest a list of possible bird species from a static bird database. For each suggested bird, if you think additional facts would be in a useful addition to the description, use the getBirdFacts tool to retrieve them and include them in the description. Return the bird's name, description (incorporating facts if used), and image URL. The output should be a JSON array of bird objects.

Description: {{{description}}}`,
});

const guessBirdFromDescriptionFlow = ai.defineFlow(
  {
    name: 'guessBirdFromDescriptionFlow',
    inputSchema: GuessBirdFromDescriptionInputSchema,
    outputSchema: GuessBirdFromDescriptionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
