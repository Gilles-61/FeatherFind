
"use client";

import { getBirds } from "@/lib/data";
import { ClientSearch } from "@/components/client-search";
import { useLanguage } from "@/hooks/use-language";
import { useEffect, useState } from "react";
import type { Bird } from "@/types";
import { AdBanner } from "@/components/ad-banner";

export default function ExplorePage() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const { dictionary } = useLanguage();

  useEffect(() => {
    async function fetchBirds() {
      const allBirds = await getBirds();
      setBirds(allBirds);
    }
    fetchBirds();
  }, []);

  if (!dictionary) {
    return null; // Or a loading skeleton
  }
  
  const pageDictionary = dictionary.explorePage;

  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">{pageDictionary.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{pageDictionary.subtitle}</p>
      </div>
      <ClientSearch birds={birds} dictionary={pageDictionary} />
      <AdBanner />
    </div>
  );
}
