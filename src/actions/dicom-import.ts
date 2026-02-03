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
export async function importDicomFiles(formData: FormData): Promise<ImportResult & { savedFiles?: { name: string, size: number, path: string }[] }> {
    try {
        const files = formData.getAll('files') as File[];

        if (files.length === 0) {
            return { success: false, error: 'No files provided' };
        }

        // Generate unique session ID using timestamp
        const sessionId = `session_${Date.now()}`;

        // Create upload directory path
        const uploadDir = join(process.cwd(), 'public', 'dicom', sessionId);

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const savedFiles: { name: string, size: number, path: string }[] = [];
        // Dynamically import adm-zip to avoid build issues if it's not installed yet
        const AdmZip = (await import('adm-zip')).default;

        // Save each file or extract zip
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Check if it's a zip file
            if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
                try {
                    const zip = new AdmZip(buffer);
                    const zipEntries = zip.getEntries();

                    for (const entry of zipEntries) {
                        // Skip directories and MacOS specific files
                        if (entry.isDirectory || entry.entryName.includes('__MACOSX') || entry.entryName.includes('.DS_Store')) {
                            continue;
                        }

                        // Sanitize filename
                        const sanitizedName = entry.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                        const filePath = join(uploadDir, sanitizedName);
                        const fileContent = entry.getData();

                        await writeFile(filePath, fileContent);
                        savedFiles.push({
                            name: sanitizedName,
                            size: entry.header.size,
                            path: `/dicom/${sessionId}/${sanitizedName}`
                        });
                    }
                } catch (zipError) {
                    console.error(`Error extracting zip ${file.name}:`, zipError);
                    // If zip extraction fails, try to save it as a regular file? 
                    // Or just log error. For now, we'll log and continue.
                }
            } else {
                // Regular file handling
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filePath = join(uploadDir, sanitizedName);

                await writeFile(filePath, buffer);
                savedFiles.push({
                    name: sanitizedName,
                    size: file.size,
                    path: `/dicom/${sessionId}/${sanitizedName}`
                });
            }
        }

        return {
            success: true,
            sessionId,
            fileCount: savedFiles.length,
            savedFiles
        };
    } catch (error) {
        console.error('Error importing DICOM files:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
