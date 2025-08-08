
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, BrainCircuit, Bird as BirdIcon } from "lucide-react";

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
        <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4">
            <BirdIcon className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="text-2xl font-headline text-primary">No Sightings Yet</h2>
            <p className="text-muted-foreground max-w-md">It looks like your birdwatching journal is empty. Add your first sighting, explore bird species, or get help from our AI.</p>
            <div className="flex items-center gap-4 mt-4">
                <Button asChild>
                    <Link href="/explore">
                        <Compass className="mr-2" />
                        Explore Birds
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/ai-guesser">
                        <BrainCircuit className="mr-2" />
                        Use AI Guesser
                    </Link>
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
