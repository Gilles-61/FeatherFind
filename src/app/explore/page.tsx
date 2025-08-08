
import { getBirds } from "@/lib/data";
import { ClientSearch } from "@/components/client-search";

export default async function ExplorePage() {
  const birds = await getBirds();

  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">Explore Birds</h1>
          <p className="text-lg text-muted-foreground mt-2">Discover the variety of birds in our database.</p>
      </div>
      <ClientSearch birds={birds} />
    </div>
  );
}
