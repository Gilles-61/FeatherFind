import { AIGuesserClient } from "@/components/ai-guesser-client";
import { ClientSearch } from "@/components/client-search";
import { AddSightingDialog } from "@/components/add-sighting-dialog";
import { SightingCard } from "@/components/sighting-card";
import { getBirds } from "@/lib/data";
import { getUserSightings } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { MySightingsPage } from "@/components/my-sightings-page";

export default function HomePage() {
  return <MySightingsPage />;
}
