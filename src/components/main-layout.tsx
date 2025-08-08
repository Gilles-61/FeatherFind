
"use client";

import { Home, Compass, BrainCircuit, Feather } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'My Sightings' },
        { href: '/explore', icon: Compass, label: 'Explore Birds' },
        { href: '/ai-guesser', icon: BrainCircuit, label: 'AI Guesser' },
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
                                <Link href={item.href} legacyBehavior passHref>
                                    <SidebarMenuButton
                                        isActive={pathname === item.href}
                                        tooltip={{children: item.label, side:"right", align:"center"}}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center justify-start border-b bg-background/80 backdrop-blur-sm px-4 md:hidden">
                    <SidebarTrigger />
                    <Link href="/" className="flex items-center gap-2 ml-4">
                        <Feather className="w-7 h-7 text-primary" />
                        <h1 className="text-xl font-headline font-bold text-primary">FeatherFind</h1>
                    </Link>
                </header>
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
