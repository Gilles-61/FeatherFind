
"use client";

import { useState } from "react";
import type { Bird } from "@/types";
import { Input } from "@/components/ui/input";
import { BirdCard } from "@/components/bird-card";
import Link from "next/link";
import { Search } from "lucide-react";

export function ClientSearch({ birds }: { birds: Bird[] }) {
  const [search, setSearch] = useState("");

  const filteredBirds = birds.filter((bird) =>
    bird.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
       <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search for a bird..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg mx-auto pl-12"
        />
      </div>

      {filteredBirds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBirds.map((bird) => (
            <Link href={`/explore/${bird.id}`} key={bird.id} className="block group">
              <BirdCard bird={bird} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No birds found matching your search.</p>
        </div>
      )}
    </div>
  );
}
