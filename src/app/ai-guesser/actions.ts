
"use server";

import { guessBirdFromDescription } from "@/ai/flows/guess-bird-from-description";
import { z } from 'zod';

/**
 * The Zod schema for the result of the bird guessing flow.
 * It ensures the AI's output matches the expected format.
 */
export const BirdResultSchema = z.object({
  birdId: z.string().describe('The machine-readable ID of the bird, e.g., "american_robin". This must be one of the provided valid IDs.'),
  birdName: z.string().describe('The common name of the bird, e.g., "American Robin".'),
  reasoning: z.string().describe('A brief explanation for why the AI chose this bird based on the description.'),
});
export type BirdResult = z.infer<typeof BirdResultSchema>;


interface ActionResult {
    result: BirdResult | null;
    error: string | null;
}

export async function guessBirdFromDescriptionAction(description: string): Promise<ActionResult> {
    if (!description) {
        return { result: null, error: "Description cannot be empty." };
    }

    try {
        const result = await guessBirdFromDescription(description);
        return { result, error: null };
    } catch (e: any) {
        console.error(e);
        return { result: null, error: e.message || "An unexpected error occurred." };
    }
}
