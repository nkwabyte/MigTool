'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from './UserProvider';
import { SessionPayload } from '../lib/session';

export function Providers({ children, user }: { children: ReactNode; user: SessionPayload | null }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Provider store={store}>
                <UserProvider user={user}>
                    {children}
                </UserProvider>
            </Provider>
        </ThemeProvider>
    );
}
