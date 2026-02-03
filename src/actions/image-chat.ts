'use server';

import { db } from '../db';
import { chatMessages, generatedImages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from "@google/genai";
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function sendChatMessage(imageId: string, userMessage: string) {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "Google Gemini API Key is missing" };
        }

        // Get image metadata from database
        const [image] = await db
            .select()
            .from(generatedImages)
            .where(eq(generatedImages.id, imageId))
            .limit(1);

        if (!image) {
            return { success: false, error: "Image not found" };
        }

        // Read image file
        const imagePath = join(process.cwd(), 'public', image.imagePath);
        const imageBuffer = await readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Save user message
        const userMessageId = randomUUID();
        await db.insert(chatMessages).values({
            id: userMessageId,
            imageId,
            role: 'user',
            content: userMessage,
        });

        // Get previous chat messages for context
        const previousMessages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.imageId, imageId))
            .orderBy(asc(chatMessages.createdAt));

        // Prepare context about the image
        let systemPrompt = `You are a helpful medical imaging AI assistant. The user is discussing a medical image that was generated using the ${image.modelType} model. `;

        if (image.modelType === 'nano-banana') {
            systemPrompt += `This image was generated from the text prompt: "${image.prompt}". `;
        } else {
            const direction = image.translationDirection === 'A_to_B' ? 'CT to MRI' : 'MRI to CT';
            systemPrompt += `This is a medical image translation from ${direction} using ${image.modelType === 'decgan' ? 'DeCGAN' : 'Attention-based DeCGAN'} model. `;
        }

        systemPrompt += `\n\nRespond naturally to the user's messages. If they say "thank you" or similar pleasantries, respond appropriately without repeating information. Only provide detailed analysis when specifically asked.`;

        // Build conversation history for context
        const conversationHistory = previousMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Add system context and current user message
        const contents = [
            {
                role: 'user',
                parts: [
                    { text: systemPrompt },
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: 'image/png'
                        }
                    }
                ]
            },
            ...conversationHistory,
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ];

        // Call Gemini API with conversation history
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents,
        });

        const aiResponse = response.text;

        // Save AI response
        const aiMessageId = randomUUID();
        await db.insert(chatMessages).values({
            id: aiMessageId,
            imageId,
            role: 'assistant',
            content: aiResponse,
        });

        return {
            success: true,
            message: aiResponse,
        };
    } catch (error) {
        console.error('Error in chat:', error);
        return {
            success: false,
            error: 'Failed to process chat message',
        };
    }
}
