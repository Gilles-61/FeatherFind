
"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addSighting } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Bird } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import React from 'react';

const SightingFormSchema = z.object({
  birdName: z.string({ required_error: 'Please select a bird.' }).min(1, 'Please select a bird.'),
  dateSeen: z.date({ required_error: 'Please select a date.' }),
  notes: z.string().max(500, 'Notes must be 500 characters or less.').optional(),
});

type SightingFormData = z.infer<typeof SightingFormSchema>;

export function AddSightingDialog({ birds, userId }: { birds: Bird[], userId: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SightingFormData>({
    resolver: zodResolver(SightingFormSchema),
    defaultValues: {
        dateSeen: new Date(),
        notes: '',
    }
  });

  const onSubmit = (data: SightingFormData) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('birdName', data.birdName);
        formData.append('dateSeen', data.dateSeen.toISOString());
        formData.append('notes', data.notes || '');

        const result = await addSighting({ message: '', success: false}, formData);

        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            setOpen(false);
            form.reset({dateSeen: new Date(), notes: ''});
        } else {
             toast({
                title: "Error",
                description: result.message || "Failed to add sighting.",
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Sighting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Log a New Sighting</DialogTitle>
          <DialogDescription>
            Record a new bird you've spotted. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                    control={form.control}
                    name="birdName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Bird</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a bird" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {birds.map(bird => (
                                <SelectItem key={bird.id} value={bird.name}>
                                    {bird.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dateSeen"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Seen</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., It was singing on a fence post..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Sighting
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
