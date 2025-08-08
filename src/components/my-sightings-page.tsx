
"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserSightings } from "@/lib/data";
import type { Sighting } from "@/types";
import { useEffect, useState } from "react";
import { SightingCard } from "@/components/sighting-card";
import { AddSightingDialog } from "@/components/add-sighting-dialog";
import { getBirds } from "@/lib/data";
import type { Bird } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function MySightingsPage() {
  const { user } = useAuth();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user && !user.isAnonymous) {
        setLoading(true);
        const [userSightings, allBirds] = await Promise.all([
          getUserSightings(user.uid),
          getBirds(),
        ]);
        setSightings(userSightings);
        setBirds(allBirds);
        setLoading(false);
      } else {
        // Handle case where there is no user or user is anonymous
        setLoading(false);
        setSightings([]);
        setBirds([]);
      }
    }
    fetchData();
  }, [user]);

  // This should not happen if page.tsx is gating correctly, but good for safety
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-4xl font-headline font-bold text-primary">My Sightings</h1>
            <p className="text-lg text-muted-foreground mt-2">A log of all the birds you've spotted.</p>
        </div>
        <AddSightingDialog birds={birds} userId={user.uid} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      ) : sightings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sightings.map((sighting) => (
            <SightingCard key={sighting.id} sighting={sighting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't logged any sightings yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Click "Add Sighting" to get started.</p>
        </div>
      )}
    </div>
  );
}
