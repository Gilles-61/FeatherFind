
"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserSightings } from "@/lib/data";
import type { Sighting } from "@/types";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setLoading(true);
        const userSightings = await getUserSightings(user.uid);
        setSightings(userSightings);
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (authLoading) {
    return null; // Or a full-page loader
  }
  
  if (!user) {
    redirect('/login');
  }

  const totalSightings = sightings.length;
  const uniqueSpecies = new Set(sightings.map(s => s.birdId)).size;
  const userInitial = user.displayName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
          <AvatarFallback className="text-4xl">{userInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">{user.displayName}</h1>
          <p className="text-lg text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Birdwatching Stats</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sightings</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSightings}</div>
                <p className="text-xs text-muted-foreground">sightings logged</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Species</CardTitle>
                <Bird className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueSpecies}</div>
                <p className="text-xs text-muted-foreground">different species spotted</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
