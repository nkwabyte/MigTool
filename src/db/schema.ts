import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
