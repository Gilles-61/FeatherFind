
import type { Timestamp, DocumentSnapshot, DocumentData } from 'firebase/firestore';

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
