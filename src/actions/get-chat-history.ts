'use server';

import { db } from '../db';
import { chatMessages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getChatHistory(id: string, type: 'image' | 'report' = 'image') {
    try {
        const messages = await db
            .select()
            .from(chatMessages)
            .where(type === 'image' ? eq(chatMessages.imageId, id) : eq(chatMessages.reportId, id))
            .orderBy(asc(chatMessages.createdAt));

        return {
            success: true,
            messages,
        };
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return {
            success: false,
            error: 'Failed to fetch chat history',
            messages: [],
        };
    }
}
