
"use client";

import { Feather } from "lucide-react";
import { AuthButton } from "./auth-button";

export function WelcomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <Feather className="w-20 h-20 text-primary" />
                    <h1 className="text-5xl font-headline font-bold text-primary">Welcome to FeatherFind</h1>
                </div>
                <p className="text-xl text-muted-foreground">
                    Your personal birdwatching companion. Log your sightings, explore new species, and let our AI help you identify mysterious birds.
                </p>
                <div>
                    <AuthButton />
                </div>
            </div>
        </div>
    );
}
