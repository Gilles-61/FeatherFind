
"use client";

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addSighting, updateSighting } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Bird, Sighting } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import Image from 'next/image';

const SightingFormSchema = z.object({
  birdId: z.string({ required_error: 'Please select a bird.' }).min(1, 'Please select a bird.'),
  dateSeen: z.date({ required_error: 'Please select a date.' }),
  notes: z.string().max(500, 'Notes must be 500 characters or less.').optional(),
  photo: z.any().optional(),
});

type SightingFormData = z.infer<typeof SightingFormSchema>;

interface SightingFormProps {
    birds: Bird[];
    userId: string;
    type: 'add' | 'edit';
    sighting?: Sighting;
    onSuccess: () => void;
}

export function SightingForm({ birds, userId, type, sighting, onSuccess }: SightingFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(sighting?.photoUrl || null);
  const photoRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<SightingFormData>({
    resolver: zodResolver(SightingFormSchema),
    defaultValues: {
        birdId: type === 'edit' && sighting ? sighting.birdId : undefined,
        dateSeen: type === 'edit' && sighting ? (sighting.dateSeen as any).toDate() : new Date(),
        notes: type === 'edit' && sighting ? sighting.notes : '',
    }
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = (data: SightingFormData) => {
    startTransition(async () => {
        const selectedBird = birds.find(b => b.id === data.birdId);
        if (!selectedBird) {
             toast({
                title: "Error",
                description: "Invalid bird selected.",
                variant: 'destructive',
            });
            return;
        }

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('birdId', data.birdId);
        formData.append('birdName', selectedBird.name);
        formData.append('dateSeen', data.dateSeen.toISOString());
        formData.append('notes', data.notes || '');

        // NOTE: The backend action does not yet support file uploads.
        // This is included for UI demonstration purposes.
        if (preview && preview.startsWith('data:')) {
            formData.append('photoUrl', preview);
        } else if (sighting?.photoUrl) {
            formData.append('photoUrl', sighting.photoUrl);
        }


        const action = type === 'add' 
            ? addSighting
            : updateSighting.bind(null, sighting!.id);

        const result = await action({ message: '', success: false}, formData);

        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            onSuccess();
            if (type === 'add') {
                form.reset({birdId: undefined, dateSeen: new Date(), notes: ''});
                setPreview(null);
            }
        } else {
             toast({
                title: "Error",
                description: result.message || `Failed to ${type} sighting.`,
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
                control={form.control}
                name="birdId"
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
                            <SelectItem key={bird.id} value={bird.id}>
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
                name="photo"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Photo (Optional)</FormLabel>
                        {preview && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                <Image src={preview} alt="Sighting preview" layout="fill" className="object-cover" />
                            </div>
                        )}
                         <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                ref={photoRef}
                                onChange={handlePhotoChange}
                            />
                        </FormControl>
                         <p className="text-xs text-muted-foreground mt-1">
                            Note: Photo uploads are for demonstration and are not saved permanently.
                        </p>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
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
                    {type === 'add' ? 'Save Sighting' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
    </Form>
  );
}
