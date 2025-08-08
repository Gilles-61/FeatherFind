
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { getAiBirdSuggestionsFromPhoto, type GuesserState } from "@/app/ai-photo-guesser/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BirdCard } from "@/components/bird-card";
import { Loader2, AlertCircle, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { Card } from "./ui/card";

const initialState: GuesserState = {};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Identifying...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Guess the Bird
        </>
      )}
    </Button>
  );
}

export function AIPhotoGuesserClient() {
  const [state, formAction] = useActionState(getAiBirdSuggestionsFromPhoto, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        setPhotoData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="photo" value={photoData || ""} />
        <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <label htmlFor="photo-upload" className="font-medium text-lg">Upload Photo</label>
                    <p className="text-muted-foreground">Select an image file from your device. For best results, use a clear photo of a single bird.</p>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                            </label>
                        </Button>
                        <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
                <div className="flex items-center justify-center aspect-video border-2 border-dashed rounded-lg">
                    {preview ? (
                        <Image src={preview} alt="Bird preview" width={400} height={225} className="object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <p>Image preview will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
        
        {state?.message && <p className="text-sm font-medium text-destructive">{state.message}</p>}

        <div className="text-center">
          <SubmitButton disabled={!photoData} />
        </div>
      </form>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.suggestions && (
        <div className="space-y-6">
          <h2 className="text-3xl font-headline text-center text-primary">AI Suggestions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {state.suggestions.map((bird) => (
              <Link href={`/explore/${bird.id}`} key={bird.id} className="block">
                <BirdCard bird={bird} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
