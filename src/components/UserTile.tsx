'use client';

import { useUser } from './UserProvider';
import { LogOut, User } from 'lucide-react';
import { logout } from '../actions/auth';
import Link from 'next/link';
import { Button } from './ui/button';

export function UserTile() {
    const { user } = useUser();

    if (!user) return null;

    return (
        <div className="p-4 border-t border-[#3E3E42] bg-[#2B2B2B]">
            <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-[#00A9E0]/20 flex items-center justify-center text-[#00A9E0] group-hover:bg-[#00A9E0]/30 transition-colors">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                            {user.name}
                        </span>
                        <span className="text-xs text-white/50 truncate group-hover:text-white/70 transition-colors">
                            {user.email}
                        </span>
                    </div>
                </Link>
                <form action={logout}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-transparent"
                        title="Logout"
                        type="submit"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
