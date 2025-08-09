
"use server";

import { guessBirdFromPhoto, GuessBirdFromPhotoInput } from "@/ai/flows/guess-bird-from-photo";
import { BirdResult, BirdResultSchema } from "@/types";

interface ActionResult {
    result: BirdResult | null;
    error: string | null;
}

export async function guessBirdFromPhotoAction(input: GuessBirdFromPhotoInput): Promise<ActionResult> {
    if (!input.photoDataUri) {
        return { result: null, error: "Photo cannot be empty." };
    }

    try {
        const result = await guessBirdFromPhoto(input);
        const validation = BirdResultSchema.safeParse(result);
        if (!validation.success) {
            console.error("AI output failed validation:", validation.error);
            return { result: null, error: "The AI returned an invalid data format." };
        }
        return { result: validation.data, error: null };
    } catch (e: any) {
        console.error(e);
        return { result: null, error: e.message || "An unexpected error occurred." };
    }
}
