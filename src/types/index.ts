
import type { Timestamp } from 'firebase/firestore';

export interface Bird {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Sighting {
  id: string;
  birdName: string;
  dateSeen: Timestamp | Date;
  notes: string;
  photoUrl?: string;
}
