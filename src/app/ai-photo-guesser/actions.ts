
"use server";

import { guessBirdFromPhoto } from "@/ai/flows/guess-bird-from-photo";
import { getBirds } from '@/lib/data';
import type { Bird } from '@/types';
import { z } from 'zod';

const FormSchema = z.object({
  photo: z.string().min(1, { message: "Please upload a photo." }),
});

export type GuesserState = {
  suggestions?: Bird[];
  error?: string;
  message?: string;
};

export async function getAiBirdSuggestionsFromPhoto(
  prevState: GuesserState,
  formData: FormData
): Promise<GuesserState> {
  const validatedFields = FormSchema.safeParse({
    photo: formData.get("photo"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid photo.",
      message: validatedFields.error.flatten().fieldErrors.photo?.join(", "),
    };
  }

  try {
    const suggestionsFromAi = await guessBirdFromPhoto({ photoDataUri: validatedFields.data.photo });
    
    if (!suggestionsFromAi || suggestionsFromAi.length === 0) {
      return { error: "Could not identify any birds from your photo. Please try a different image." };
    }

    const allBirds = await getBirds();

    const suggestions: Bird[] = suggestionsFromAi.map(aiBird => {
      const foundBird = allBirds.find(b => b.name.toLowerCase() === aiBird.name.toLowerCase());
      if (foundBird) {
        return {
          ...foundBird,
          description: aiBird.description, 
        };
      }
      return {
        id: aiBird.name.toLowerCase().replace(/\s+/g, '_'),
        name: aiBird.name,
        description: aiBird.description,
        imageUrl: aiBird.imageUrl || 'https://placehold.co/600x400.png',
      };
    }).filter((b): b is Bird => b !== null);

    return { suggestions };

  } catch (e) {
    console.error(e);
    return { error: "The AI guesser is currently unavailable. Please try again later." };
  }
}
