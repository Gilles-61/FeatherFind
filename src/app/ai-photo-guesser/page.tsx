import { AIPhotoGuesserClient } from "@/components/ai-photo-guesser-client";

export default function AIPhotoGuesserPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">AI Photo Guesser</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload a photo of a bird, and our AI will try to identify it for you.
        </p>
      </div>
      <AIPhotoGuesserClient />
    </div>
  );
}
