'use client';

import { useActionState, useEffect } from 'react';
import { login } from '@/src/actions/auth';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { useAppDispatch } from '@/src/store/hooks';
import { login as loginAction } from '@/src/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [state, action, pending] = useActionState(login, { success: false });
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            dispatch(loginAction());
            router.push('/');
        }
    }, [state.success, dispatch, router]);

    return (
        <div className="flex flex-col space-y-6 bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Welcome back
                </h1>
                <p className="text-sm text-gray-400">
                    Enter your email to sign in to your account
                </p>
            </div>
            <form action={action} className="flex flex-col gap-4 text-white">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                    <input
                        id="email"
                        name="email"
                        placeholder="m@example.com"
                        type="email"
                        className="flex h-10 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {state?.errors?.email && <p className="text-red-500 text-sm">{state.errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                    <input
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        className="flex h-10 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {state?.errors?.password && <p className="text-red-500 text-sm">{state.errors.password}</p>}
                </div>

                {state?.message && (
                    <p className="text-red-400 text-sm text-center">{state.message}</p>
                )}

                <Button disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {pending ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
            <div className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline underline-offset-4 hover:text-white">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
