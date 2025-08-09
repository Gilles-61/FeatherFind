
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { BirdResult, guessBirdFromDescriptionAction } from "./actions";
import { Bird, Lightbulb, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { BirdCard } from "@/components/bird-card";
import type { Bird as BirdType } from "@/types";
import { getBirdById } from "@/lib/data";

export default function AIGuesserPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<BirdResult | null>(null);
  const [birdDetails, setBirdDetails] = useState<BirdType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
        setError("Please enter a description of the bird.");
        return;
    }
    setError(null);
    setResult(null);
    setBirdDetails(null);

    startTransition(async () => {
      const { result, error } = await guessBirdFromDescriptionAction(description);
      if (error) {
        setError(error);
      } else if (result) {
        setResult(result);
        const foundBird = await getBirdById(result.birdId);
        if(foundBird) {
            setBirdDetails(foundBird);
        }
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
            <Bird className="h-10 w-10"/> AI Bird Guesser
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
            Can't figure out what bird you saw? Describe it, and our AI expert will try to identify it for you.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Describe the Bird</CardTitle>
            <CardDescription>
              Be as descriptive as possible. Include details like color, size, beak shape, sounds, and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., A small, plump bird with a bright red chest and a grey back. It was hopping around on my lawn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={isPending}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">The more detail, the better the guess!</p>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Identify Bird
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>AI Analysis Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Reasoning</AlertTitle>
                <AlertDescription className="italic">
                    "{result.reasoning}"
                </AlertDescription>
            </Alert>
            
            {birdDetails ? (
              <div>
                <h3 className="text-lg font-semibold text-center mb-4 text-primary">Our best guess is the <span className="font-bold">{result.birdName}</span>.</h3>
                <Link href={`/explore/${birdDetails.id}`}>
                    <BirdCard bird={birdDetails} />
                </Link>
              </div>
            ) : (
                <p className="text-center text-muted-foreground">Could not load details for the guessed bird.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
