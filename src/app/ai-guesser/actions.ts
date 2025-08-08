
"use server";

import { guessBirdFromDescription } from "@/ai/flows/guess-bird-from-description";
import { getBirds } from '@/lib/data';
import type { Bird } from '@/types';
import { z } from 'zod';
import { getDictionary, type Locale } from "@/lib/i18n";

const getFormSchema = (dictionary: any) => {
  const errorMessages = dictionary.aiGuesserPage.errors;
  return z.object({
    description: z.string().min(10, { message: errorMessages.descriptionTooShort }),
    locale: z.string(), // To pass locale from client to server
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
  const locale = (formData.get("locale") as Locale) || 'en';
  const dictionary = await getDictionary(locale);

  const FormSchema = getFormSchema(dictionary);
  const validatedFields = FormSchema.safeParse({
    description: formData.get("description"),
    locale: locale,
  });

  if (!validatedFields.success) {
    return {
      error: "invalid_description", // This is a key, not displayed text
      message: validatedFields.error.flatten().fieldErrors.description?.join(", "),
    };
  }

  const errorMessages = dictionary.aiGuesserPage.errors;

  try {
    const suggestionsFromAi = await guessBirdFromDescription({ description: validatedFields.data.description });
    
    if (!suggestionsFromAi || suggestionsFromAi.length === 0) {
      return { message: errorMessages.noBirdsFound };
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
    return { message: errorMessages.unavailable };
  }
}
