import type { Timestamp, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { z } from 'zod';

export interface Bird {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Sighting {
  id: string;
  birdId: string;
  birdName: string;
  dateSeen: Timestamp | Date;
  notes: string;
  photoUrl?: string;
}

export interface PaginatedSightings {
    sightings: Sighting[];
    lastVisible: DocumentSnapshot<DocumentData> | null;
}

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


export const GuessBirdFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a bird, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GuessBirdFromPhotoInput = z.infer<typeof GuessBirdFromPhotoInputSchema>;
