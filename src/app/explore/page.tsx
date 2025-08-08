
import { getBirds } from "@/lib/data";
import { ClientSearch } from "@/components/client-search";
import { getDictionary } from "@/lib/i18n";

// Defaulting to 'en' for now
const lang = 'en';

export default async function ExplorePage() {
  const birds = await getBirds();
  const dictionary = await getDictionary(lang);
  const pageDictionary = dictionary.explorePage;

  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">{pageDictionary.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{pageDictionary.subtitle}</p>
      </div>
      <ClientSearch birds={birds} dictionary={pageDictionary} />
    </div>
  );
}
