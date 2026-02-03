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

export const generatedImages = sqliteTable('generated_images', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    modelType: text('model_type').notNull(), // 'nano-banana', 'decgan', 'att-decgan'
    imagePath: text('image_path').notNull(), // Path relative to public folder
    prompt: text('prompt'), // For nano-banana (text-to-image)
    translationDirection: text('translation_direction'), // For decgan/att-decgan ('A_to_B' or 'B_to_A')
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const generatedReports = sqliteTable('generated_reports', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    imageId: text('image_id').references(() => generatedImages.id, { onDelete: 'set null' }), // Optional link to generated image
    imageUrl: text('image_url'), // For uploaded images not in generated_images table
    reportContent: text('report_content').notNull(),
    patientName: text('patient_name').default('Unknown'),
    modality: text('modality'),
    studyDate: text('study_date'),
    bodyPart: text('body_part'),
    findings: text('findings'),
    impression: text('impression'),
    status: text('status').default('Finalized'),
    reportType: text('report_type').default('detailed'),
    radiologist: text('radiologist').default('AI Assistant'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const chatMessages = sqliteTable('chat_messages', {
    id: text('id').primaryKey(),
    imageId: text('image_id').references(() => generatedImages.id, { onDelete: 'cascade' }),
    reportId: text('report_id').references(() => generatedReports.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'user' or 'assistant'
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;

export type GeneratedReport = typeof generatedReports.$inferSelect;
export type NewGeneratedReport = typeof generatedReports.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
