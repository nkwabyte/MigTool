'use server';

import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

export async function generateImage(prompt: string, model: string) {
  console.log(`Generating image with model: ${model} and prompt: ${prompt}`);

  if (model === 'nano-banana') {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Google Gemini API Key is missing" };
    }

    // Use Imagen 4 for image generation
    try {
      const ai = new GoogleGenAI({ apiKey });
      // // get and show all the models from google genai
      // const models = await ai.models.list();
      // console.log(models);
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-fast-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
        }
      });

      const generatedImage = response.generatedImages?.[0]?.image?.imageBytes;

      if (generatedImage) {
        return {
          success: true,
          message: "Image generated successfully.",
          image: generatedImage // Return base64 image data
        };
      } else {
        console.error("No image data in response:", response);
        return { success: false, error: "Failed to generate image data" };
      }

    } catch (error) {
      console.error("Error generating image with Google Imagen:", error);
      return { success: false, error: "Failed to process request with Google Imagen" };
    }
  } else if (model === 'decgan' || model === 'att-decgan') {
    // Logic for custom models (placeholder)
    return { success: true, message: `Request sent to ${model} model (simulated).` };
  }

  return { success: false, error: "Invalid model selected" };
}

/**
 * Generate an image from an input image using DeCGAN or Att-DeCGAN models
 * @param imageBase64 - Base64 encoded image
 * @param model - Model name ('decgan' or 'att-decgan')
 * @param direction - Translation direction ('A_to_B' for MRI→CT or 'B_to_A' for CT→MRI)
 */
export async function generateImageFromImage(
  imageBase64: string,
  model: 'decgan' | 'att-decgan',
  direction: 'A_to_B' | 'B_to_A'
) {
  console.log(`Generating image with ${model} model, direction: ${direction}`);

  try {
    // Dynamic import to avoid issues if package is not installed yet
    const { Client } = await import('@gradio/client');

    // Remove base64 header if present
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Determine the Hugging Face Space endpoint
    const spaceEndpoint = model === 'decgan'
      ? 'RAILKNUST/decgan'
      : 'RAILKNUST/attndecgan';

    // Connect to the Gradio client
    const client = await Client.connect(spaceEndpoint);

    // Call the /generate_image endpoint
    const result = await client.predict('/generate_image', {
      input_image: blob,
      direction: direction,
    });

    // console.log('Gradio API result:', result);

    // The result.data is an array containing the generated image
    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const imageData = result.data[0];

      // Check if imageData has a url property
      if (imageData && typeof imageData === 'object' && 'url' in imageData && imageData.url) {
        const imageUrl = imageData.url as string;
        // console.log('Fetching image from URL:', imageUrl);

        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        return {
          success: true,
          message: `Image translated successfully using ${model}`,
          image: base64Image
        };
      } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
        // Fallback: if it's a direct URL string
        const imageResponse = await fetch(imageData);
        const imageBlob = await imageResponse.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        return {
          success: true,
          message: `Image translated successfully using ${model}`,
          image: base64Image
        };
      } else {
        // console.error('Unexpected image data format:', imageData);
        return { success: false, error: 'Unexpected response format from Gradio API' };
      }
    } else {
      // console.error('No image data in Gradio response:', result);
      return { success: false, error: 'Failed to generate image from Gradio API' };
    }

  } catch (error) {
    // console.error(`Error generating image with ${model}:`, error);

    // Check if the error is due to missing package
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      return {
        success: false,
        error: 'The @gradio/client package is not installed. Please run: npm install @gradio/client'
      };
    }

    return {
      success: false,
      error: `Failed to process request with ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function generateReport(imageBase64: string) {
  // console.log(`Generating report for image...`);

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google Gemini API Key is missing" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    // Identify mime type if possible
    let mimeType = "image/png";
    if (imageBase64.includes("data:image/jpeg")) mimeType = "image/jpeg";
    else if (imageBase64.includes("data:image/png")) mimeType = "image/png";
    else if (imageBase64.includes("data:image/webp")) mimeType = "image/webp";

    const prompt = "Analyze this medical image and provide a detailed report. Return ONLY the report in Markdown format. Do not include any conversational filler (e.g., 'Here is the report', 'Of course'). Do not use em-dashes (—); use standard dashes (-) or rephrase to avoid them. Structure the report with clear headers (##, ###), detailed Paragraphs, and bullet points.";

    const response = await ai.models.generateContent({
      /// check the model_options.ts file for available models
      model: 'gemini-2.5-pro', // 'gemini-2.5-flash', // 
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      }
    });

    return { success: true, report: response.text };

  } catch (error) {
    console.error("Error generating report with Google Gemini:", error);
    return { success: false, error: "Failed to generate report" };
  }
}
