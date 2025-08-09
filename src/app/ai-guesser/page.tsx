
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleAIForm, type AIFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bird, Bot, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Getting Guess...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Ask the AI
        </>
      )}
    </Button>
  );
}

export default function AIGuesserPage() {
  const initialState: AIFormState = {
    description: '',
  };
  const [state, formAction] = useFormState(handleAIForm, initialState);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">AI Bird Guesser</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Describe a bird you saw, and our AI will try to identify it for you.
        </p>
      </div>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Describe the Bird</CardTitle>
            <CardDescription>
              Be as detailed as possible. Include its size, main colors, beak shape, and any distinct markings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="e.g., A small, brown bird with a bright red chest and a black head..."
                defaultValue={state.description}
                rows={5}
                required
              />
              {state.formErrors?.description && (
                <p className="text-sm font-medium text-destructive">{state.formErrors.description}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.error && (
         <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.guess && (
        <Card className="bg-primary/5">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bird className="h-6 w-6 text-primary" />
                AI Guess
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">The AI thinks it's a...</p>
                <p className="text-3xl font-bold font-headline text-primary">{state.guess.birdName}</p>
             </div>
            
            <div>
                <Label className="text-xs">Confidence</Label>
                <div className="flex items-center gap-2">
                    <Progress value={state.guess.confidence * 100} className="w-full" />
                    <span className="text-sm font-bold text-primary">
                        {Math.round(state.guess.confidence * 100)}%
                    </span>
                </div>
            </div>

             <div>
                <Label className="text-xs">Reasoning</Label>
                <p className="text-sm text-muted-foreground italic border-l-4 border-primary/20 pl-4 py-1">
                    "{state.guess.reasoning}"
                </p>
             </div>

          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-primary/10 p-4 rounded-b-lg">
             <p className="text-sm text-primary/80 text-center sm:text-left">
                Is this the bird you saw?
             </p>
             <Button asChild variant="secondary" className="w-full sm:w-auto">
                 <Link href={`/explore/${state.guess.birdName.toLowerCase().replace(/ /g, '_')}`}>
                    View in Bird Explorer
                 </Link>
             </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
