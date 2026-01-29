'use server';

import { db } from '../db';
import { dicomImportSessions, dicomImportedFiles } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '../lib/session';
import { randomUUID } from 'crypto';

export interface ImportedFile {
    name: string;
    size: number;
    path: string;
}

export interface ImportSessionData {
    id: string;
    timestamp: string;
    fileCount: number;
    files: ImportedFile[];
}

/**
 * Save a new DICOM import session to the database
 * Requires user authentication
 */
export async function saveImportSession(files: ImportedFile[]): Promise<{ success: boolean; error?: string; sessionId?: string }> {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const sessionId = `session_${Date.now()}`;
        const timestamp = new Date();

        // Insert session
        await db.insert(dicomImportSessions).values({
            id: sessionId,
            userId: session.userId as string,
            timestamp,
            fileCount: files.length,
        });

        // Insert files
        const fileRecords = files.map(file => ({
            id: randomUUID(),
            sessionId,
            name: file.name,
            size: file.size,
            path: file.path,
        }));

        if (fileRecords.length > 0) {
            await db.insert(dicomImportedFiles).values(fileRecords);
        }

        return { success: true, sessionId };
    } catch (error) {
        console.error('Error saving import session:', error);
        return { success: false, error: 'Failed to save import session' };
    }
}

/**
 * Get all import sessions for the current user
 * Requires user authentication
 */
export async function getImportSessions(): Promise<ImportSessionData[]> {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return [];
        }

        // Get sessions for current user
        const sessions = await db
            .select()
            .from(dicomImportSessions)
            .where(eq(dicomImportSessions.userId, session.userId as string))
            .orderBy(desc(dicomImportSessions.timestamp));

        // Get files for each session
        const sessionsWithFiles = await Promise.all(
            sessions.map(async (sess) => {
                const files = await db
                    .select({
                        name: dicomImportedFiles.name,
                        size: dicomImportedFiles.size,
                        path: dicomImportedFiles.path,
                    })
                    .from(dicomImportedFiles)
                    .where(eq(dicomImportedFiles.sessionId, sess.id));

                return {
                    id: sess.id,
                    timestamp: sess.timestamp.toISOString(),
                    fileCount: sess.fileCount,
                    files,
                };
            })
        );

        return sessionsWithFiles;
    } catch (error) {
        console.error('Error getting import sessions:', error);
        return [];
    }
}

/**
 * Delete an import session and its files
 * Requires user authentication and ownership
 */
export async function deleteImportSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify ownership
        const [importSession] = await db
            .select()
            .from(dicomImportSessions)
            .where(eq(dicomImportSessions.id, sessionId));

        if (!importSession) {
            return { success: false, error: 'Session not found' };
        }

        if (importSession.userId !== session.userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Delete session (files will be deleted automatically due to cascade)
        await db.delete(dicomImportSessions).where(eq(dicomImportSessions.id, sessionId));

        return { success: true };
    } catch (error) {
        console.error('Error deleting import session:', error);
        return { success: false, error: 'Failed to delete session' };
    }
}

/**
 * Get files for a specific session
 * Requires user authentication and ownership
 */
export async function getSessionFiles(sessionId: string): Promise<ImportedFile[]> {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return [];
        }

        // Verify ownership
        const [importSession] = await db
            .select()
            .from(dicomImportSessions)
            .where(eq(dicomImportSessions.id, sessionId));

        if (!importSession || importSession.userId !== session.userId) {
            return [];
        }

        // Get files
        const files = await db
            .select({
                name: dicomImportedFiles.name,
                size: dicomImportedFiles.size,
                path: dicomImportedFiles.path,
            })
            .from(dicomImportedFiles)
            .where(eq(dicomImportedFiles.sessionId, sessionId));

        return files;
    } catch (error) {
        console.error('Error getting session files:', error);
        return [];
    }
}
