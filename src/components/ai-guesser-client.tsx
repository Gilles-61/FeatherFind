
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { getAiBirdSuggestions, type GuesserState } from "@/app/ai-guesser/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BirdCard } from "@/components/bird-card";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import React from "react";
import { useLanguage } from "@/hooks/use-language";

const initialState: GuesserState = {};

function SubmitButton({ dictionary }: { dictionary: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {dictionary.buttonPending}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {dictionary.buttonIdle}
        </>
      )}
    </Button>
  );
}

export function AIGuesserClient({ dictionary }: { dictionary: any }) {
  const { locale } = useLanguage();
  const [state, formAction] = useActionState(getAiBirdSuggestions, initialState);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <Textarea
          name="description"
          placeholder={dictionary.placeholder}
          rows={5}
          className="text-base"
          required
          minLength={10}
        />
        {state?.message && <p className="text-sm font-medium text-destructive">{state.message}</p>}
        <div className="text-center">
          <SubmitButton dictionary={dictionary} />
        </div>
      </form>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{dictionary.errorTitle}</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.suggestions && (
        <div className="space-y-6">
          <h2 className="text-3xl font-headline text-center text-primary">{dictionary.suggestionsTitle}</h2>
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
