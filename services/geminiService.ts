
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Recommendation, District } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const getAIGuideResponse = async (
  query: string, 
  category: string, 
  district: District,
  location?: { lat: number, lng: number }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are 'TAMIL NADU EXPLORE Guide', a world-class tourism expert.
    Current Context:
    - Target District: ${district}
    - Category focus: ${category}
    - Search Query: ${query}

    Response MUST be a JSON array of objects following the Recommendation type.
    Provide authentic local suggestions. Include English and Tamil names.
  `;

  const generateWithTools = async (useSearch: boolean) => {
    return await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Find the best ${category} in ${district === 'All' ? 'Tamil Nadu' : district} related to: ${query}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              nameTamil: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              location: { type: Type.STRING },
              area: { type: Type.STRING },
              district: { type: Type.STRING },
              priceCategory: { type: Type.STRING },
              cost: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              rating: { type: Type.NUMBER }
            },
            required: ["id", "name", "category", "description", "area", "district", "priceCategory"]
          }
        }
      }
    });
  };

  try {
    let response;
    try {
      // Primary attempt with Google Search
      response = await generateWithTools(true);
    } catch (e) {
      console.warn("Search grounding failed or unauthorized, retrying without tools...", e);
      // Secondary attempt without Google Search
      response = await generateWithTools(false);
    }

    const jsonStr = response.text?.trim() || "[]";
    const results: any[] = JSON.parse(jsonStr);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return results.map(r => ({
      ...r,
      links: links.length > 0 ? links.slice(0, 3) : undefined
    })) as Recommendation[];
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    if (error.message?.includes('403') || error.message?.includes('401')) {
       throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};

export const generatePlaceImage = async (placeName: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';

  try {
    const prompt = `A professional travel photograph of ${placeName}, Tamil Nadu. ${description}. High resolution, beautiful lighting.`;
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data");
  } catch (error) {
    return `https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200`;
  }
};

export const getAITagline = async (subject: string = "Tamil Nadu") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a catchy one-sentence travel tagline for ${subject}. Under 8 words.`,
    });
    return response.text?.trim().replace(/"/g, '') || "Discover the heart of Tamil Nadu.";
  } catch (error) {
    return "Exploring the Soul of South India.";
  }
};
