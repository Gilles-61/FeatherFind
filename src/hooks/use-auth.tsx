
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUser = async (user: User | null) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
         await setDoc(userRef, { 
            displayName: user.displayName || 'Anonymous User',
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
      // If no user, sign in anonymously
      try {
        const userCredential = await signInAnonymously(auth);
        handleUser(userCredential.user)
      } catch (error) {
        console.error("Anonymous sign-in failed:", error);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state update
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle signing in anonymously
    } catch (error) {
      console.error("Sign-out failed:", error);
    } finally {
      // Let onAuthStateChanged handle loading state
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
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
