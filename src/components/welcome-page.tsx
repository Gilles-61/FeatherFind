
"use client";

import { Feather } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useLanguage } from "@/hooks/use-language";

export function WelcomePage() {
    const { dictionary } = useLanguage();

    if (!dictionary) {
        return null; // Or a loading skeleton
    }

    const { welcome, subtitle, getStarted } = dictionary.welcomePage;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <Feather className="w-20 h-20 text-primary" />
                    <h1 className="text-5xl font-headline font-bold text-primary">{welcome}</h1>
                </div>
                <p className="text-xl text-muted-foreground">
                    {subtitle}
                </p>
                <div>
                  <Button asChild size="lg">
                    <Link href="/login">{getStarted}</Link>
                  </Button>
                </div>
            </div>
        </div>
    );
}
