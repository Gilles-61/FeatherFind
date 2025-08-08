
"use client";

import { AIGuesserClient } from "@/components/ai-guesser-client";
import { useLanguage } from "@/hooks/use-language";

export default function AIGuesserPage() {
  const { dictionary } = useLanguage();

  if (!dictionary) {
    return null; // Or loading skeleton
  }

  const pageDictionary = dictionary.aiGuesserPage;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">{pageDictionary.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {pageDictionary.subtitle}
        </p>
      </div>
      <AIGuesserClient dictionary={pageDictionary} />
    </div>
  );
}
