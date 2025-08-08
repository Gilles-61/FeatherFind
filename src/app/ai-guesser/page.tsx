import { AIGuesserClient } from "@/components/ai-guesser-client";
import { getDictionary } from "@/lib/i18n";

// Defaulting to 'en' for now
const lang = 'en';

export default async function AIGuesserPage() {
  const dictionary = await getDictionary(lang);
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
