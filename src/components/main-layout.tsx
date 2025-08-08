
"use client";

import { Home, Compass, BrainCircuit, Feather, Camera } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AuthButton } from './auth-button';
import { useAuth } from '@/hooks/use-auth';
import { getDictionary } from '@/lib/i18n';

// Defaulting to 'en', a language switcher would be needed for dynamic language changes.
const lang = 'en';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [dictionary, setDictionary] = useState<any>(null);

    useEffect(() => {
        const fetchDictionary = async () => {
            const dict = await getDictionary(lang);
            setDictionary(dict.mainLayout);
        };
        fetchDictionary();
    }, []);

    if (loading || (user && !dictionary)) {
        return null;
    }

    if (!user) {
        return <main>{children}</main>;
    }
    
    const navItems = [
        { href: '/', icon: Home, label: dictionary.nav.mySightings },
        { href: '/explore', icon: Compass, label: dictionary.nav.exploreBirds },
        { href: '/ai-guesser', icon: BrainCircuit, label: dictionary.nav.aiTextGuesser },
        { href: '/ai-photo-guesser', icon: Camera, label: dictionary.nav.aiPhotoGuesser },
    ];

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2.5">
                           <Feather className="w-8 h-8 text-primary transition-all group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7" />
                           <h1 className="text-2xl font-headline font-bold text-primary group-data-[collapsible=icon]:hidden">FeatherFind</h1>
                        </Link>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                                    tooltip={{children: item.label, side:"right", align:"center"}}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter>
                    <div className="group-data-[collapsible=icon]:hidden">
                       <AuthButton dictionary={dictionary.authButton} />
                    </div>
                 </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:hidden">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <Link href="/" className="flex items-center gap-2">
                            <Feather className="w-7 h-7 text-primary" />
                            <h1 className="text-xl font-headline font-bold text-primary">FeatherFind</h1>
                        </Link>
                    </div>
                     <div className="md:hidden">
                        <AuthButton dictionary={dictionary.authButton} />
                    </div>
                </header>
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
