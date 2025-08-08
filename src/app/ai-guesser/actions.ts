
"use server";

import { guessBirdFromDescription } from "@/ai/flows/guess-bird-from-description";
import { getBirds } from '@/lib/data';
import type { Bird } from '@/types';
import { z } from 'zod';
import { getDictionary } from "@/lib/i18n";

// Defaulting to 'en' for now
const lang = 'en';

const getFormSchema = async () => {
  const dictionary = await getDictionary(lang);
  const errorMessages = dictionary.aiGuesserPage.errors;
  return z.object({
    description: z.string().min(10, { message: errorMessages.descriptionTooShort }),
  });
}

export type GuesserState = {
  suggestions?: Bird[];
  error?: string;
  message?: string;
};

export async function getAiBirdSuggestions(
  prevState: GuesserState,
  formData: FormData
): Promise<GuesserState> {
  const FormSchema = await getFormSchema();
  const validatedFields = FormSchema.safeParse({
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid description.", // This is a key, not displayed text
      message: validatedFields.error.flatten().fieldErrors.description?.join(", "),
    };
  }

  const dictionary = await getDictionary(lang);
  const errorMessages = dictionary.aiGuesserPage.errors;

  try {
    const suggestionsFromAi = await guessBirdFromDescription({ description: validatedFields.data.description });
    
    if (!suggestionsFromAi || suggestionsFromAi.length === 0) {
      return { error: errorMessages.noBirdsFound };
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
    return { error: errorMessages.unavailable };
  }
}
