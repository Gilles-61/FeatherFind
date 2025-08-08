
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  type User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getAuth
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// A helper function to format Firebase error messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use a stronger password.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => null,
  signInWithEmail: async () => null,
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
           await setDoc(userRef, { 
              displayName: user.displayName || 'New User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
          }, { merge: true });
        } else {
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      // You might want to show a toast notification to the user here
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<string | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
        // The onAuthStateChanged listener will handle setting the user and creating the Firestore doc.
      }
      return null;
    } catch (error: any) {
      console.error("Email/password sign-up failed:", error);
      return getFirebaseErrorMessage(error.code);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
     try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the rest.
      return null;
    } catch (error: any) {
      console.error("Email/password sign-in failed:", error);
      return getFirebaseErrorMessage(error.code);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <FeatherIcon className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-lg font-semibold font-headline text-primary">Loading FeatherFind...</p>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function FeatherIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" x2="2" y1="8" y2="22" />
      <line x1="17.5" x2="9" y1="15" y2="15" />
    </svg>
  );
}
