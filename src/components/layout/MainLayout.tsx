'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../Sidebar';
import { TopMenuBar } from '../TopMenuBar';
import { StatusBar } from '../StatusBar';

export function MainLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

    if (isAuthPage) {
        return (
            <div className="h-screen w-screen bg-[#1E1E1E]">
                {children}
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-[#1E1E1E] overflow-hidden">
            <TopMenuBar />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                {children}
            </div>
            <StatusBar />
        </div>
    );
}
