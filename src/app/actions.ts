
"use server";

import { revalidatePath } from 'next/cache';
import { collection, addDoc, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from "zod";

const SightingFormSchema = z.object({
  birdId: z.string({ required_error: 'Please select a bird.' }).min(1, 'Please select a bird.'),
  dateSeen: z.date({ required_error: 'Please select a date.' }),
  notes: z.string().max(500, 'Notes must be 500 characters or less.').optional(),
  photoUrl: z.string().optional(),
});

export type SightingFormState = {
  message: string;
  errors?: {
    birdId?: string[];
    dateSeen?: string[];
    notes?: string[];
    photoUrl?: string[];
  };
  success: boolean;
};

export async function addSighting(prevState: SightingFormState, formData: FormData): Promise<SightingFormState> {
  const validatedFields = SightingFormSchema.safeParse({
    birdId: formData.get('birdId'),
    dateSeen: new Date(formData.get('dateSeen') as string),
    notes: formData.get('notes'),
    photoUrl: formData.get('photoUrl'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { birdId, dateSeen, notes, photoUrl } = validatedFields.data;
  const userId = formData.get('userId') as string;
  const birdName = formData.get('birdName') as string;
  
  if (!userId || !birdName) {
      return { message: 'Missing required data.', success: false };
  }


  try {
    const sightingsRef = collection(db, `users/${userId}/sightings`);
    await addDoc(sightingsRef, {
      birdId,
      birdName,
      dateSeen: Timestamp.fromDate(dateSeen),
      notes: notes || '',
      photoUrl: photoUrl || '',
    });
    
    revalidatePath('/');
    return { message: 'Sighting added successfully!', success: true };
  } catch (error) {
    console.error('Error adding sighting:', error);
    return { message: 'Failed to add sighting.', success: false };
  }
}


export async function updateSighting(sightingId: string, prevState: SightingFormState, formData: FormData): Promise<SightingFormState> {
  const validatedFields = SightingFormSchema.safeParse({
    birdId: formData.get('birdId'),
    dateSeen: new Date(formData.get('dateSeen') as string),
    notes: formData.get('notes'),
    photoUrl: formData.get('photoUrl'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { birdId, dateSeen, notes, photoUrl } = validatedFields.data;
  const userId = formData.get('userId') as string;
  const birdName = formData.get('birdName') as string;

  if (!userId || !birdName) {
      return { message: 'Missing required data.', success: false };
  }
  
  try {
    const sightingRef = doc(db, `users/${userId}/sightings`, sightingId);
    await updateDoc(sightingRef, {
      birdId,
      birdName,
      dateSeen: Timestamp.fromDate(dateSeen),
      notes: notes || '',
      photoUrl: photoUrl || '',
    });
    
    revalidatePath('/');
    return { message: 'Sighting updated successfully!', success: true };
  } catch (error) {
    console.error('Error updating sighting:', error);
    return { message: 'Failed to update sighting.', success: false };
  }
}

export async function deleteSighting(userId: string, sightingId: string) {
    if (!userId || !sightingId) {
        return { success: false, message: 'User ID and Sighting ID are required.' };
    }
    try {
        const sightingRef = doc(db, `users/${userId}/sightings`, sightingId);
        await deleteDoc(sightingRef);
        revalidatePath('/');
        return { success: true, message: 'Sighting deleted successfully.' };
    } catch (error) {
        console.error("Error deleting sighting: ", error);
        return { success: false, message: 'Failed to delete sighting.' };
    }
}
