'use server';

import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '../lib/session';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

const SignupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type FormState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        form?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function signup(prevState: FormState, formData: FormData) {
    const validatedFields = SignupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));

    if (existingUser) {
        return {
            errors: {
                email: ['Email already exists.'],
            },
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    try {
        await db.insert(users).values({
            id: userId,
            name,
            email,
            password: hashedPassword,
        });
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create User.',
        };
    }

    await createSession(userId, name, email);
    return { success: true };
}

export async function login(prevState: FormState, formData: FormData) {
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        return {
            message: 'Invalid email or password.',
        };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        return {
            message: 'Invalid email or password.',
        };
    }

    await createSession(user.id, user.name, user.email);
    return { success: true };
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
