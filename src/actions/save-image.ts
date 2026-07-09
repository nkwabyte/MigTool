'use server';

import { db } from '../db';
import { generatedImages } from '../db/schema';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function saveGeneratedImage(
    base64Image: string,
    modelType: 'nano-banana' | 'decgan' | 'att-decgan' | 'models/gemini-3-pro-image-preview',
    userId: string,
    prompt?: string,
    translationDirection?: 'A_to_B' | 'B_to_A'
) {
    try {
        // Generate unique filename
        const imageId = randomUUID();
        const timestamp = Date.now();
        const filename = `${timestamp}_${imageId}.png`;
        const relativePath = `/generated/${filename}`;
        const absolutePath = join(process.cwd(), 'public', 'generated', filename);

        // Remove base64 header if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Save image to filesystem
        await writeFile(absolutePath, buffer);

        // Save metadata to database
        await db.insert(generatedImages).values({
            id: imageId,
            userId,
            modelType,
            imagePath: relativePath,
            prompt: prompt || null,
            translationDirection: translationDirection || null,
        });

        return {
            success: true,
            imageId,
            imagePath: relativePath,
        };
    } catch (error) {
        console.error('Error saving generated image:', error);
        return {
            success: false,
            error: 'Failed to save image',
        };
    }
}
