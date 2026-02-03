'use server';

import { db } from '../db';
import { generatedImages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '../lib/session';

export async function getGeneratedImages() {
    try {
        const session = await getSession();
        const userId = session?.userId || 'default-user'; // Fallback

        if (!userId) return { success: false, error: 'User not authenticated', images: [] };

        const images = await db
            .select()
            .from(generatedImages)
            .where(eq(generatedImages.userId, userId as string))
            .orderBy(desc(generatedImages.createdAt));

        return { success: true, images };
    } catch (error) {
        console.error('Error fetching generated images:', error);
        return { success: false, error: 'Failed to fetch images', images: [] };
    }
}
