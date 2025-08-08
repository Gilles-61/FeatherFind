
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// This is a helper to get the current user in a server component
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}
