-- Migration: Make imageId nullable in chat_messages table
-- This allows chat messages to be associated with either images OR reports

-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table

-- Step 1: Create a new table with the correct schema
CREATE TABLE chat_messages_new (
    id TEXT PRIMARY KEY,
    image_id TEXT REFERENCES generated_images(id) ON DELETE CASCADE,
    report_id TEXT REFERENCES generated_reports(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Step 2: Copy existing data
INSERT INTO chat_messages_new (id, image_id, report_id, role, content, created_at)
SELECT id, image_id, report_id, role, content, created_at
FROM chat_messages;

-- Step 3: Drop old table
DROP TABLE chat_messages;

-- Step 4: Rename new table
ALTER TABLE chat_messages_new RENAME TO chat_messages;
