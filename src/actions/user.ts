'use server';

import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createSession, getSession } from '../lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const UpdateProfileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().optional().or(z.literal('')),
});

export type UpdateProfileState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        form?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function updateProfile(prevState: UpdateProfileState, formData: FormData) {
    const session = await getSession();
    if (!session || !session.userId) {
        return {
            message: 'Unauthorized',
        };
    }

    const validatedFields = UpdateProfileSchema.safeParse({
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

    // Check if email is taken by another user
    if (email !== session.email) {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (existingUser) {
            return {
                errors: {
                    email: ['Email already exists.'],
                },
            };
        }
    }

    try {
        const updateData: any = {
            name,
            email,
        };

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, String(session.userId)));

        // Update session with new details
        await createSession(String(session.userId), name, email);

        revalidatePath('/profile');
        revalidatePath('/', 'layout'); // Update layout to reflect name change in sidebar/header

        return { success: true, message: 'Profile updated successfully.' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Profile.',
        };
    }
}
