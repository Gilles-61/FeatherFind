
"use server";

import { guessBirdFromDescription } from "@/ai/flows/guess-bird-from-description";
import { BirdResult, BirdResultSchema } from "@/types";

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
        // We can validate the output here if we want, but the flow already does it.
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
