// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a flow to guess bird species from a photo.
 *
 * - guessBirdFromPhoto - A function that takes an image and returns a list of possible bird species.
 * - GuessBirdFromPhotoInput - The input type for the guessBirdFromPhoto function.
 * - GuessBirdFromPhotoOutput - The return type for the guessBirdFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuessBirdFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a bird, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GuessBirdFromPhotoInput = z.infer<typeof GuessBirdFromPhotoInputSchema>;

const GuessBirdFromPhotoOutputSchema = z.array(
  z.object({
    name: z.string().describe('The common name of the bird.'),
    description: z.string().describe('A short description of the bird.'),
    imageUrl: z.string().describe('A URL to an image of the bird.'),
  })
);
export type GuessBirdFromPhotoOutput = z.infer<typeof GuessBirdFromPhotoOutputSchema>;

export async function guessBirdFromPhoto(input: GuessBirdFromPhotoInput): Promise<GuessBirdFromPhotoOutput> {
  return guessBirdFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guessBirdFromPhotoPrompt',
  input: {schema: GuessBirdFromPhotoInputSchema},
  output: {schema: GuessBirdFromPhotoOutputSchema},
  prompt: `You are an expert ornithologist. Based on the following photo of a bird, suggest a list of possible bird species from a static bird database. Return the bird's name, description, and image URL. The output should be a JSON array of bird objects. If the image does not contain a bird, return an empty array.

Photo: {{media url=photoDataUri}}`,
});

const guessBirdFromPhotoFlow = ai.defineFlow(
  {
    name: 'guessBirdFromPhotoFlow',
    inputSchema: GuessBirdFromPhotoInputSchema,
    outputSchema: GuessBirdFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
