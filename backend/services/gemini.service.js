import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function generateEmbedding(text, dimensionality = 768) {
  try {
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
      config: {
        outputDimensionality: dimensionality,
      },
    });
    return embedRes.embeddings?.[0]?.values || null;
  } catch (error) {
    console.error('Gemini embedding error:', error);
    throw error;
  }
}

export async function generateContentStream(prompt) {
  return await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
}
