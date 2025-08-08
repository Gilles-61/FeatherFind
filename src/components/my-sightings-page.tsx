
"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserSightings } from "@/lib/data";
import type { Sighting, Bird } from "@/types";
import { useEffect, useState } from "react";
import { SightingCard } from "@/components/sighting-card";
import { AddSightingDialog } from "@/components/add-sighting-dialog";
import { getBirds } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, BrainCircuit, Bird as BirdIcon } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

// Defaulting to 'en' for now
const lang = 'en';

export function MySightingsPage() {
  const { user } = useAuth();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
       const dict = await getDictionary(lang);
       setDictionary(dict.mySightingsPage);

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
        setLoading(false);
        setSightings([]);
        setBirds([]);
      }
    }
    fetchData();
  }, [user]);

  if (!user || !dictionary) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-4xl font-headline font-bold text-primary">{dictionary.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">{dictionary.subtitle}</p>
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
            <SightingCard key={sighting.id} sighting={sighting} birds={birds} userId={user.uid} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4">
            <BirdIcon className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="text-2xl font-headline text-primary">{dictionary.noSightings}</h2>
            <p className="text-muted-foreground max-w-md">{dictionary.noSightingsDescription}</p>
            <div className="flex items-center gap-4 mt-4">
                <Button asChild>
                    <Link href="/explore">
                        <Compass className="mr-2" />
                        {dictionary.exploreBirds}
                    </Link>
                </Button>
                 <Button asChild variant="secondary">
                    <Link href="/ai-guesser">
                        <BrainCircuit className="mr-2" />
                        {dictionary.useAiGuesser}
                    </Link>
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
