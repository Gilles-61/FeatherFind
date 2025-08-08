
import type { Bird } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export function BirdCard({ bird }: { bird: Bird }) {
  const aiHint = bird.name.toLowerCase();
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
      <div className="aspect-video relative">
        <Image
          src={bird.imageUrl}
          alt={bird.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={aiHint}
        />
      </div>
      <CardContent className="p-4 flex-grow bg-card">
        <h3 className="text-lg font-headline font-semibold text-center">{bird.name}</h3>
      </CardContent>
    </Card>
  );
}
