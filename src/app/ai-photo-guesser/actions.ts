
"use server";

import { guessBirdFromPhoto } from "@/ai/flows/guess-bird-from-photo";
import { getBirds } from '@/lib/data';
import type { Bird } from '@/types';
import { z } from 'zod';
import { getDictionary, type Locale } from "@/lib/i18n";

const getFormSchema = (dictionary: any) => {
    const errorMessages = dictionary.aiPhotoGuesserPage.errors;
    return z.object({
      photo: z.string().min(1, { message: errorMessages.photoRequired }),
      locale: z.string(),
    });
}


export type GuesserState = {
  suggestions?: Bird[];
  error?: string;
  message?: string;
};

export async function getAiBirdSuggestionsFromPhoto(
  prevState: GuesserState,
  formData: FormData
): Promise<GuesserState> {
  const locale = (formData.get("locale") as Locale) || 'en';
  const dictionary = await getDictionary(locale);
  const FormSchema = getFormSchema(dictionary);

  const validatedFields = FormSchema.safeParse({
    photo: formData.get("photo"),
    locale: locale,
  });

  if (!validatedFields.success) {
    return {
      error: "invalid_photo", // error key
      message: validatedFields.error.flatten().fieldErrors.photo?.join(", "),
    };
  }
  
  const errorMessages = dictionary.aiPhotoGuesserPage.errors;

  try {
    const suggestionsFromAi = await guessBirdFromPhoto({ photoDataUri: validatedFields.data.photo });
    
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
