
"use server";

import { guessBirdFromDescription } from "@/ai/flows/guess-bird-from-description";
import { getBirds } from '@/lib/data';
import type { Bird } from '@/types';
import { z } from 'zod';

const FormSchema = z.object({
  description: z.string().min(10, { message: "Please provide a more detailed description." }),
});

export type GuesserState = {
  suggestions?: Bird[];
  error?: string;
  message?: string;
};

export async function getAiBirdSuggestions(
  prevState: GuesserState,
  formData: FormData
): Promise<GuesserState> {
  const validatedFields = FormSchema.safeParse({
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid description.",
      message: validatedFields.error.flatten().fieldErrors.description?.join(", "),
    };
  }

  try {
    const suggestionsFromAi = await guessBirdFromDescription({ description: validatedFields.data.description });
    
    if (!suggestionsFromAi || suggestionsFromAi.length === 0) {
      return { error: "Could not identify any birds from your description. Please try describing it differently." };
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
