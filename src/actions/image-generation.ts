'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateImage(prompt: string, model: string) {
  console.log(`Generating image with model: ${model} and prompt: ${prompt}`);

  if (model === 'nano-banana') {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Google Gemini API Key is missing" };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-1.5-pro as requested (most recent/capable)
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await geminiModel.generateContent([
        `Generate a detailed description for an image based on this prompt: ${prompt}. The description should be suitable for an image generation model.`
      ]);

      const response = await result.response;
      const text = response.text();

      console.log("Gemini response:", text);

      return {
        success: true,
        message: "Gemini (Nano Banana / 1.5 Pro) processed request successfully. (Image generation simulated)",
      };

    } catch (error) {
      console.error("Error generating content with Google Gemini:", error);
      return { success: false, error: "Failed to process request with Google Gemini" };
    }
  } else if (model === 'decgan' || model === 'att-decgan') {
    // Logic for custom models (placeholder)
    return { success: true, message: `Request sent to ${model} model (simulated).` };
  }

  return { success: false, error: "Invalid model selected" };
}

export async function generateReport(imageBase64: string) {
  console.log(`Generating report for image...`);

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google Gemini API Key is missing" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    // Identify mime type if possible
    let mimeType = "image/png";
    if (imageBase64.includes("data:image/jpeg")) mimeType = "image/jpeg";
    else if (imageBase64.includes("data:image/png")) mimeType = "image/png";
    else if (imageBase64.includes("data:image/webp")) mimeType = "image/webp";

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      },
    };

    const prompt = "Analyze this medical image and provide a detailed report describing what you see. Identify any anatomical structures, abnormalities, or key features.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return { success: true, report: text };

  } catch (error) {
    console.error("Error generating report with Google Gemini:", error);
    return { success: false, error: "Failed to generate report" };
  }
}
