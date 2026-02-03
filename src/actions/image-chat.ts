'use server';

import { db } from '../db';
import { chatMessages, generatedImages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from "@google/genai";
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function sendChatMessage(id: string, userMessage: string, type: 'image' | 'report' = 'image') {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "Google Gemini API Key is missing" };
        }

        let systemPrompt = "";
        let base64Image = null;

        const imageId = type === 'image' ? id : null;
        const reportId = type === 'report' ? id : null;

        if (type === 'image') {
            // Get image metadata from database
            const [image] = await db
                .select()
                .from(generatedImages)
                .where(eq(generatedImages.id, id))
                .limit(1);

            if (!image) {
                return { success: false, error: "Image not found" };
            }

            // Read image file
            const imagePath = join(process.cwd(), 'public', image.imagePath);
            const imageBuffer = await readFile(imagePath);
            base64Image = imageBuffer.toString('base64');

            // Prepare context about the image
            systemPrompt = `You are a helpful medical imaging AI assistant. The user is discussing a medical image that was generated using the ${image.modelType} model. `;

            if (image.modelType === 'nano-banana') {
                systemPrompt += `This image was generated from the text prompt: "${image.prompt}". `;
            } else {
                const direction = image.translationDirection === 'A_to_B' ? 'CT to MRI' : 'MRI to CT';
                systemPrompt += `This is a medical image translation from ${direction} using ${image.modelType === 'decgan' ? 'DeCGAN' : 'Attention-based DeCGAN'} model. `;
            }
        } else {
            // Report chat
            // Dynamically import to avoid circular dependency issues if any, though likely fine here
            const { generatedReports } = await import('../db/schema');

            const [report] = await db
                .select()
                .from(generatedReports)
                .where(eq(generatedReports.id, id))
                .limit(1);

            if (!report) {
                return { success: false, error: "Report not found" };
            }

            systemPrompt = `You are a helpful medical imaging AI assistant. You are discussing a radiology report with the user.
            
            Report Details:
            Patient: ${report.patientName}
            Modality: ${report.modality}
            Body Part: ${report.bodyPart}
            
            Report Content:
            ${report.reportContent}
            
            Answer the user's questions based on the information in this report. Explain medical terms if asked. Be helpful and professional.`;
        }

        systemPrompt += `\n\nRespond naturally to the user's messages. If they say "thank you" or similar pleasantries, respond appropriately without repeating information. Only provide detailed analysis when specifically asked.`;

        // Save user message
        const userMessageId = randomUUID();
        await db.insert(chatMessages).values({
            id: userMessageId,
            imageId: imageId,
            reportId: reportId,
            role: 'user',
            content: userMessage,
        });

        // Get previous chat messages for context
        const previousMessages = await db
            .select()
            .from(chatMessages)
            .where(type === 'image' ? eq(chatMessages.imageId, id) : eq(chatMessages.reportId, id))
            .orderBy(asc(chatMessages.createdAt));

        // Build conversation history for context
        // Exclude the message we just added to avoid duplications in context if we fetched it
        const historyContext = previousMessages.filter(msg => msg.id !== userMessageId).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Add system context and current user message
        const contents = [
            {
                role: 'user',
                parts: [
                    { text: systemPrompt },
                    ...(base64Image ? [{
                        inlineData: {
                            data: base64Image,
                            mimeType: 'image/png'
                        }
                    }] : [])
                ]
            },
            ...historyContext,
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
            imageId: imageId,
            reportId: reportId,
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
