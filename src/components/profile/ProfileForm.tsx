'use client';

import { useActionState } from 'react';
import { updateProfile, UpdateProfileState } from '@/src/actions/user';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useUser } from '@/src/components/UserProvider';
import { Loader2 } from 'lucide-react';

export function ProfileForm() {
    const { user } = useUser();
    const initialState: UpdateProfileState = {};
    const [state, action, isPending] = useActionState(updateProfile, initialState);

    if (!user) {
        return <div className="text-white">Loading profile...</div>;
    }

    return (
        <form action={action} className="space-y-6 max-w-md">
            {state.message && (
                <div className={`p-4 rounded text-sm ${state.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {state.message}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    className="bg-[#2B2B2B] border-[#3E3E42] text-white"
                />
                {state.errors?.name && (
                    <p className="text-sm text-red-500">{state.errors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    className="bg-[#2B2B2B] border-[#3E3E42] text-white"
                />
                {state.errors?.email && (
                    <p className="text-sm text-red-500">{state.errors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-white">New Password (optional)</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="bg-[#2B2B2B] border-[#3E3E42] text-white"
                />
                {state.errors?.password && (
                    <p className="text-sm text-red-500">{state.errors.password}</p>
                )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-[#00A9E0] hover:bg-[#0090C0]">
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                    </>
                ) : (
                    'Update Profile'
                )}
            </Button>
        </form>
    );
}
