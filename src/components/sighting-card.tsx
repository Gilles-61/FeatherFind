
"use client";

import type { Bird, Sighting } from "@/types";
import { Card, CardDescription, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Feather, StickyNote, Camera, Trash2, Edit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { deleteSighting } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { EditSightingDialog } from "./edit-sighting-dialog";

export function SightingCard({ sighting, birds, userId }: { sighting: Sighting, birds: Bird[], userId: string }) {
  
  const date = sighting.dateSeen instanceof Date ? sighting.dateSeen : (sighting.dateSeen as Timestamp).toDate();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSighting(userId, sighting.id);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="flex flex-col h-full bg-card overflow-hidden">
        {sighting.photoUrl ? (
            <div className="aspect-video relative">
                 <Image src={sighting.photoUrl} alt={`Sighting of ${sighting.birdName}`} fill className="object-cover" />
            </div>
        ) : (
             <div className="aspect-video relative bg-secondary/50 flex flex-col items-center justify-center">
                <Camera className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">No photo for this sighting</p>
            </div>
        )}
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
       <CardFooter className="bg-secondary/30 p-2 justify-end gap-2">
            <EditSightingDialog birds={birds} userId={userId} sighting={sighting} />
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        sighting record.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                       {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
    </Card>
  )
}
