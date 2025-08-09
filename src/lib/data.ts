
import { birds as localBirds } from '@/data/birds';
import type { Bird, Sighting, PaginatedSightings } from '@/types';
import { collection, getDocs, doc, getDoc, query, orderBy, limit, startAfter, type DocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { getFirebaseServices } from '@/lib/firebase';


// --- Bird Data ---
// Uses local data for immediate use without DB setup.
// Includes commented-out Firestore implementation.

export async function getBirds(): Promise<Bird[]> {
  // Simulating network delay
  // await new Promise(resolve => setTimeout(resolve, 500));
  return localBirds;

  /*
  // Real Firestore implementation:
  try {
    const { db } = getFirebaseServices();
    const birdsCol = collection(db, 'birds');
    const birdSnapshot = await getDocs(birdsCol);
    const birdList = birdSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bird));
    return birdList;
  } catch (error) {
    console.error("Error fetching birds:", error);
    return [];
  }
  */
}

export async function getBirdById(id: string): Promise<Bird | undefined> {
  // Simulating network delay
  // await new Promise(resolve => setTimeout(resolve, 200));
  const bird = localBirds.find(bird => bird.id === id);
  if (bird) return bird;

  // Fallback to check local data for names matching the ID format, for AI guesser results
  const formattedName = id.replace(/_/g, ' ');
  return localBirds.find(b => b.name.toLowerCase() === formattedName.toLowerCase());
  
  /*
  // Real Firestore implementation:
  try {
    const { db } = getFirebaseServices();
    const birdRef = doc(db, 'birds', id);
    const birdSnap = await getDoc(birdRef);
    if (birdSnap.exists()) {
      return { id: birdSnap.id, ...birdSnap.data() } as Bird;
    } else {
      console.log('No such document!');
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching bird by ID:", error);
    return undefined;
  }
  */
}


// --- Sighting Data ---
// This function uses Firestore directly as it's user-specific and dynamic.

export async function getUserSightings(
    userId: string
): Promise<Sighting[]>;
export async function getUserSightings(
    userId: string,
    count: number,
    lastVisible?: DocumentSnapshot<DocumentData> | null
): Promise<PaginatedSightings>;
export async function getUserSightings(
    userId: string,
    count?: number,
    lastVisible: DocumentSnapshot<DocumentData> | null = null
): Promise<Sighting[] | PaginatedSightings> {
    if (!userId) {
        return count !== undefined ? { sightings: [], lastVisible: null } : [];
    }

    try {
        const { db } = getFirebaseServices();
        const sightingsRef = collection(db, `users/${userId}/sightings`);
        
        const queryConstraints = [orderBy('dateSeen', 'desc')];
        
        if (count !== undefined) {
            queryConstraints.push(limit(count));
        }

        if (lastVisible) {
            queryConstraints.push(startAfter(lastVisible));
        }

        const q = query(sightingsRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        
        const sightings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Sighting));

        if (count !== undefined) {
            const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            return { sightings, lastVisible: newLastVisible };
        }

        return sightings;

    } catch (error) {
        console.error('Error fetching sightings:', error);
        return count !== undefined ? { sightings: [], lastVisible: null } : [];
    }
}