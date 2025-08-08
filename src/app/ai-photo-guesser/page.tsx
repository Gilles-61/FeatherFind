
"use client";

import { AIPhotoGuesserClient } from "@/components/ai-photo-guesser-client";
import { useLanguage } from "@/hooks/use-language";

export default function AIPhotoGuesserPage() {
  const { dictionary } = useLanguage();

  if (!dictionary) {
    return null; // Or a loading skeleton
  }

  const pageDictionary = dictionary.aiPhotoGuesserPage;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">{pageDictionary.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDictionary.subtitle}
        </p>
      </div>
      <AIPhotoGuesserClient dictionary={pageDictionary} />
    </div>
  );
}
