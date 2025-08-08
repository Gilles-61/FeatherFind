import { AIGuesserClient } from "@/components/ai-guesser-client";

export default function AIGuesserPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">AI Text Guesser</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Describe a bird you've seen, and our AI will try to identify it for you.
        </p>
      </div>
      <AIGuesserClient />
    </div>
  );
}
