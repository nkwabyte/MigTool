import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const dicomImportSessions = sqliteTable('dicom_import_sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    fileCount: integer('file_count').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const dicomImportedFiles = sqliteTable('dicom_imported_files', {
    id: text('id').primaryKey(),
    sessionId: text('session_id').notNull().references(() => dicomImportSessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    size: integer('size').notNull(),
    path: text('path').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type DicomImportSession = typeof dicomImportSessions.$inferSelect;
export type NewDicomImportSession = typeof dicomImportSessions.$inferInsert;

export type DicomImportedFile = typeof dicomImportedFiles.$inferSelect;
export type NewDicomImportedFile = typeof dicomImportedFiles.$inferInsert;
