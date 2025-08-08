
'use client';

import { Card } from '@/components/ui/card';

export function AdBanner() {
  return (
    <Card className="mt-8 flex h-24 items-center justify-center bg-muted/50">
      <div className="text-center text-sm text-muted-foreground">
        <p>Advertisement</p>
      </div>
    </Card>
  );
}
