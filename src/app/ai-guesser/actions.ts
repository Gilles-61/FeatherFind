'use server';

import { guessBirdFromDescription } from '@/ai/flows/guess-bird-from-description';
import type { BirdGuess } from '@/ai/flows/guess-bird-from-description';
import { z } from 'zod';

// Define the schema for the form state
export type AIFormState = {
  description: string;
  guess?: BirdGuess;
  error?: string;
  formErrors?: { description?: string[] };
};

// Define the schema for the form input
const GuessFormSchema = z.object({
  description: z
    .string()
    .min(10, 'Please provide a more detailed description (at least 10 characters).'),
});

/**
 * Server action to handle the AI bird guesser form submission.
 *
 * @param previousState The previous state of the form.
 * @param formData The form data submitted by the user.
 * @returns The new state of the form, including the AI's guess or an error.
 */
export async function handleAIForm(
  previousState: AIFormState,
  formData: FormData
): Promise<AIFormState> {
  const validatedFields = GuessFormSchema.safeParse({
    description: formData.get('description'),
  });

  // If validation fails, return errors to the form
  if (!validatedFields.success) {
    return {
      description: formData.get('description') as string,
      formErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { description } = validatedFields.data;

  try {
    // Call the Genkit flow to get the bird guess
    const guess = await guessBirdFromDescription(description);
    return { description, guess };
  } catch (e: any) {
    console.error('Error calling AI flow:', e);
    // Return a user-friendly error message
    return {
      description,
      error: 'There was an error getting a guess from the AI. Please try again.',
    };
  }
}
