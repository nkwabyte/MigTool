'use client';

import { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { TopMenuBar } from '../TopMenuBar';
import { StatusBar } from '../StatusBar';
import { useAppSelector } from '@/src/store/hooks';

export function MainLayout({ children }: { children: ReactNode }) {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    return (
        <div className="h-screen w-screen flex flex-col bg-[#1E1E1E] overflow-hidden">
            {isAuthenticated ? (
                <>
                    <TopMenuBar />
                    <div className="flex-1 flex overflow-hidden">
                        <Sidebar />
                        {children}
                    </div>
                    <StatusBar />
                </>
            ) : (
                children
            )}
        </div>
    );
}
