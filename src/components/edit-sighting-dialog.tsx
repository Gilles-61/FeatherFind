
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Bird, Sighting } from '@/types';
import { Edit } from 'lucide-react';
import React from 'react';
import { SightingForm } from './sighting-form';

export function EditSightingDialog({ birds, userId, sighting }: { birds: Bird[], userId: string, sighting: Sighting }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/80 hover:text-primary hover:bg-primary/10">
            <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit Sighting</DialogTitle>
          <DialogDescription>
            Update the details of your bird sighting.
          </DialogDescription>
        </DialogHeader>
        <SightingForm 
            birds={birds} 
            userId={userId} 
            type="edit"
            sighting={sighting}
            onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
