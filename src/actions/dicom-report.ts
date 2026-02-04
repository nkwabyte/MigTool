'use server';

import { db } from '../db';
import { generatedReports } from '../db/schema';
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from 'crypto';
import { getSession } from '../lib/session';

interface GenerateReportParams {
    imageData: string;
    reportType: 'brief' | 'detailed';
    metadata: {
        patientName?: string;
        studyDate?: string;
        modality?: string;
        bodyPart?: string;
    };
}

export async function generateDicomReport({ imageData, reportType, metadata }: GenerateReportParams) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: "Google Gemini API Key is missing" };
        }

        // Clean base64 string if needed (remove data:image/png;base64, prefix)
        const base64Image = imageData.split(',')[1] || imageData;

        // Construct System Prompt
        const role = "You are an expert Radiologist AI assistant with decades of experience.";
        const context = `You are analyzing a medical image (DICOM screenshot) for a patient named ${metadata.patientName || 'Unknown'}. 
        The modality is ${metadata.modality || 'Unknown'} and the body part is ${metadata.bodyPart || 'Unknown'}.
        Study Date: ${metadata.studyDate || 'Unknown'}.`;

        let instruction = "";
        if (reportType === 'brief') {
            instruction = `Please provide a **BRIEF**, concise preliminary report. 
            Focus on the most salient findings and a short impression. 
            Do NOT use complex headers or long descriptions. Keep it under 200 words.`;
        } else {
            instruction = `Please provide a **DETAILED**, professional radiology report.
            Include the following sections clearly labeled:
            - **CLINICAL INDICATION**: (Infer from findings if not provided)
            - **TECHNIQUE**: Describe the likely view/modality seen.
            - **FINDINGS**: detailed analysis of anatomy, abnormalities, and textures.
            - **IMPRESSION**: summary of diagnosis and recommendations.
            
            Use professional medical terminology. Be thorough.`;
        }

        const prompt = `${role}\n${context}\n${instruction}`;

        // Call Gemini
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: 'image/png'
                            }
                        }
                    ]
                }
            ]
        });

        const reportText = response.text;

        // Save to Database
        const reportId = randomUUID();
        await db.insert(generatedReports).values({
            id: reportId,
            userId: session.userId as string,
            reportContent: reportText,
            patientName: metadata.patientName || 'Unknown',
            modality: metadata.modality,
            studyDate: metadata.studyDate,
            bodyPart: metadata.bodyPart,
            reportType: reportType,
            status: 'Finalized',
            imageUrl: null,
        });

        return { success: true, reportId };

    } catch (error) {
        console.error('Error generating report:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate report'
        };
    }
}
