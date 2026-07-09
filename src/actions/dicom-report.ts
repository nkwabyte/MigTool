'use server';

import { db } from '../db';
import { generatedReports } from '../db/schema';
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from 'crypto';
import { getSession } from '../lib/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        Study Date: ${metadata.studyDate || 'Unknown'}.`;

        let instruction = "";
        if (reportType === 'brief') {
            instruction = `Please analyze the image and provide a JSON response.
            
            The JSON object must have the following structure:
            {
                "modality": "The imaging modality (e.g., CT, MRI, X-Ray, Ultrasound)",
                "bodyPart": "The primary body part imaged (e.g., Chest, Brain, Abdomen, Knee)",
                "reportContent": "A **BRIEF**, concise preliminary report (Markdown formatted). Focus on the most salient findings and a short impression. Keep it under 200 words."
            }`;
        } else {
            instruction = `Please analyze the image and provide a JSON response.
            
            The JSON object must have the following structure:
            {
                "modality": "The imaging modality (e.g., CT, MRI, X-Ray, Ultrasound)",
                "bodyPart": "The primary body part imaged (e.g., Chest, Brain, Abdomen, Knee)",
                "reportContent": "A **DETAILED**, professional radiology report (Markdown formatted). Include sections for CLINICAL INDICATION, TECHNIQUE, FINDINGS, and IMPRESSION. Use professional medical terminology."
            }`;
        }

        const prompt = `${role}\n${context}\n${instruction}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks around the JSON.`;

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

        const responseText = response.text;

        let analysisData;
        try {
            // Clean up any potential markdown code blocks if the model ignores the instruction
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            analysisData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI JSON response:", e);
            // Fallback if JSON parsing fails
            analysisData = {
                modality: metadata.modality || "Unknown",
                bodyPart: metadata.bodyPart || "Unknown",
                reportContent: responseText
            };
        }

        const reportText = analysisData.reportContent;
        const detectedModality = analysisData.modality;
        const detectedBodyPart = analysisData.bodyPart;

        // Generate report ID first (needed for filename)
        const reportId = randomUUID();

        // Save the screenshot to filesystem
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'report-images');
        await mkdir(uploadsDir, { recursive: true });

        const imageFileName = `report-${reportId}.png`;
        const imagePath = join(uploadsDir, imageFileName);
        const publicPath = `/uploads/report-images/${imageFileName}`;

        // Convert base64 to buffer and save
        const imageBuffer = Buffer.from(base64Image, 'base64');
        await writeFile(imagePath, imageBuffer);

        // Save to Database
        await db.insert(generatedReports).values({
            id: reportId,
            userId: session.userId as string,
            reportContent: reportText,
            patientName: metadata.patientName || 'Unknown',
            modality: detectedModality || metadata.modality || 'Unknown', // Prefer AI detection
            studyDate: metadata.studyDate,
            bodyPart: detectedBodyPart || metadata.bodyPart || 'Unknown', // Prefer AI detection
            reportType: reportType,
            status: 'Finalized',
            imageUrl: publicPath,
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
