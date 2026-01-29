export interface ImportedFile {
    name: string;
    size: number;
    path: string;
}

export interface ImportSession {
    id: string;
    timestamp: string;
    fileCount: number;
    files: ImportedFile[];
}

const STORAGE_KEY = 'dicom_import_sessions';

export const dicomStorage = {
    /**
     * Save a new import session to localStorage
     */
    saveImportSession(session: ImportSession): void {
        const sessions = this.getImportSessions();
        sessions.unshift(session); // Add to beginning (most recent first)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    },

    /**
     * Get all import sessions from localStorage
     */
    getImportSessions(): ImportSession[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to parse import sessions:', error);
            return [];
        }
    },

    /**
     * Delete an import session by ID
     */
    deleteImportSession(id: string): void {
        const sessions = this.getImportSessions();
        const filtered = sessions.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    /**
     * Get a single import session by ID
     */
    getImportSession(id: string): ImportSession | null {
        const sessions = this.getImportSessions();
        return sessions.find(s => s.id === id) || null;
    },

    /**
     * Clear all import sessions
     */
    clearAllSessions(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};
