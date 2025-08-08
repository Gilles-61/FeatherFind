
"use server";

import { revalidatePath } from 'next/cache';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from "zod";

const SightingSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  birdName: z.string().min(1, { message: "Bird name is required." }),
  dateSeen: z.date({ required_error: "Date is required." }),
  notes: z.string().optional(),
});

export type SightingFormState = {
  message: string;
  errors?: {
    userId?: string[];
    birdName?: string[];
    dateSeen?: string[];
    notes?: string[];
  };
  success: boolean;
};

export async function addSighting(prevState: SightingFormState, formData: FormData): Promise<SightingFormState> {
  const validatedFields = SightingSchema.safeParse({
    userId: formData.get('userId'),
    birdName: formData.get('birdName'),
    dateSeen: new Date(formData.get('dateSeen') as string),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { userId, birdName, dateSeen, notes } = validatedFields.data;

  try {
    const sightingsRef = collection(db, `users/${userId}/sightings`);
    await addDoc(sightingsRef, {
      birdName,
      dateSeen: Timestamp.fromDate(dateSeen),
      notes: notes || '',
      photoUrl: '', // Optional photo URL not implemented in form
    });
    
    revalidatePath('/');
    return { message: 'Sighting added successfully!', success: true };
  } catch (error) {
    console.error('Error adding sighting:', error);
    return { message: 'Failed to add sighting.', success: false };
  }
}
