
"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { SuggestBirdsOutput } from '@/ai/flows/suggest-birds';
import { suggestBirds } from '@/ai/flows/suggest-birds';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function AiGuesserPage() {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestBirdsOutput>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await suggestBirds({ description });
      setSuggestions(result);
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">AI Bird Guesser</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Can't identify a bird? Describe it below and let AI help you out!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="e.g., 'A small red bird with a black mask, seen in my backyard...'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
          className="text-base"
        />
        <Button type="submit" disabled={loading || !description} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : 'Suggest Birds'}
        </Button>
      </form>

      {error && <p className="text-destructive text-center">{error}</p>}
      
      {suggestions.length > 0 && (
        <div>
            <h2 className="text-2xl font-headline font-bold text-center mb-6">Suggestions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {suggestions.map((bird) => (
                    <Link href={`/explore/${bird.name.toLowerCase().replace(/ /g, '_')}`} key={bird.name}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
                            <CardContent className="p-0">
                                <div className="aspect-video relative">
                                    <img src={bird.imageUrl} alt={bird.name} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-headline font-semibold">{bird.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{bird.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
