
import { getBirdById } from "@/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function BirdDetailPage({ params }: { params: { birdId: string } }) {
  const bird = await getBirdById(params.birdId);

  if (!bird) {
    notFound();
  }
  
  const aiHint = bird.name.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto">
      <Button asChild variant="ghost" className="mb-4 -ml-4">
        <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
        </Link>
      </Button>
      <Card>
        <div className="grid md:grid-cols-2 gap-8 items-start p-6">
          <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg">
            <Image 
              src={bird.imageUrl} 
              alt={bird.name} 
              fill
              className="object-cover" 
              data-ai-hint={aiHint}
              />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">{bird.name}</h1>
            <p className="text-lg text-foreground/80 leading-relaxed">{bird.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
