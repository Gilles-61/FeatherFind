
"use server";

import { guessBirdFromDescription, BirdResult as BirdResultType } from "@/ai/flows/guess-bird-from-description";

export type BirdResult = BirdResultType;

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
