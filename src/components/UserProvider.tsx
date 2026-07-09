'use client';

import { createContext, useContext, ReactNode } from 'react';
import { SessionPayload } from '../lib/session';

interface UserContextType {
    user: SessionPayload | null;
}

const UserContext = createContext<UserContextType>({ user: null });

export function UserProvider({
    children,
    user,
}: {
    children: ReactNode;
    user: SessionPayload | null;
}) {
    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
