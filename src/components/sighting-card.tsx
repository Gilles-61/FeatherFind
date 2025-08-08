
import type { Sighting } from "@/types";
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Feather, StickyNote } from "lucide-react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";

export function SightingCard({ sighting }: { sighting: Sighting }) {
  
  const date = sighting.dateSeen instanceof Date ? sighting.dateSeen : (sighting.dateSeen as Timestamp).toDate();

  return (
    <Card className="flex flex-col h-full bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <Feather className="h-6 w-6 text-accent" />
          {sighting.birdName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
          <Calendar className="h-4 w-4" />
          <span>{format(date, "PPP")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {sighting.notes ? (
          <div className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md h-full">
            <StickyNote className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="italic">"{sighting.notes}"</p>
          </div>
        ) : (
             <div className="flex items-center justify-center text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md h-full">
                <p>No notes for this sighting.</p>
             </div>
        )}
      </CardContent>
    </Card>
  )
}
