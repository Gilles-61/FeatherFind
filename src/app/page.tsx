
import { AddSightingDialog } from '@/components/add-sighting-dialog';
import { getUserSightings } from '@/lib/data';
import { getBirds } from '@/lib/data';
import { SightingCard } from '@/components/sighting-card';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/lib/user';
import { Feather } from 'lucide-react';

async function SightingsContent() {
    const user = await getCurrentUser();
    
    if (!user) {
        // This case is handled by the AuthProvider, but as a fallback:
        return <SightingsSkeleton/>
    }

    const [sightings, birds] = await Promise.all([
        getUserSightings(user.uid),
        getBirds()
    ]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold text-primary">My Sightings</h1>
                    <p className="text-lg text-muted-foreground">A log of all the birds you've spotted.</p>
                </div>
                <AddSightingDialog birds={birds} userId={user.uid} />
            </div>

            {sightings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sightings.map(sighting => (
                        <SightingCard key={sighting.id} sighting={sighting} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Feather className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No sightings yet!</h3>
                    <p className="text-muted-foreground mt-2">Click "Add Sighting" to log your first bird.</p>
                </div>
            )}
        </div>
    )
}

export default function MySightingsPage() {
    return (
        <Suspense fallback={<SightingsSkeleton />}>
            <SightingsContent />
        </Suspense>
    );
}

function SightingsSkeleton() {
    return (
         <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-80" />
                </div>
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3 p-4 border rounded-lg">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ))}
             </div>
        </div>
    )
}
