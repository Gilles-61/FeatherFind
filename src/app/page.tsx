
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MySightingsPage } from '@/components/my-sightings-page';
import { redirect } from 'next/navigation';


export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    // This case is handled by the AuthProvider's loading screen, but as a fallback:
    return null; 
  }
  
  if (!user) {
    redirect('/login');
  }

  return <MySightingsPage />;
}
