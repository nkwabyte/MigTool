'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface ImportResult {
    success: boolean;
    sessionId?: string;
    fileCount?: number;
    error?: string;
}

/**
 * Server action to import DICOM files
 * Saves files to /public/uploads/dicom/{sessionId}/
 */
export async function importDicomFiles(formData: FormData): Promise<ImportResult> {
    try {
        const files = formData.getAll('files') as File[];

        if (files.length === 0) {
            return { success: false, error: 'No files provided' };
        }

        // Generate unique session ID using timestamp
        const sessionId = `session_${Date.now()}`;

        // Create upload directory path
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'dicom', sessionId);

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Save each file
        let savedCount = 0;
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sanitize filename to prevent path traversal
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = join(uploadDir, sanitizedName);

            await writeFile(filePath, buffer);
            savedCount++;
        }

        return {
            success: true,
            sessionId,
            fileCount: savedCount
        };
    } catch (error) {
        console.error('Error importing DICOM files:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
