
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Recommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIGuideResponse = async (query: string, category: string, location?: { lat: number, lng: number }) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are 'TAMIL NADU EXPLORE Guide', a local expert for Chennai and the entire Tamil Nadu state. 
    Your goal is to help users find the best things to do, eat, and see.
    Focus on: ${category}.
    User Query: ${query}.
    Current User Coordinates: ${location ? `Lat: ${location.lat}, Lng: ${location.lng}` : 'Not provided'}.
    
    CRITICAL: For every place, you MUST identify the specific 'area' (e.g., 'T. Nagar', 'Adyar', 'Mylapore', 'Anna Nagar' for Chennai; or 'Kodaikanal Lake Area', 'East Coast Road' for state-wide spots).
    Also, categorize the price as: 'Free', 'Budget', 'Mid-range', or 'Premium'.

    Provide a JSON array of recommendations. 
    Each object must strictly follow this structure:
    {
      "id": "unique-slug",
      "name": "Name of the place",
      "category": "The specific category from the user request",
      "description": "Engaging 1-2 sentence description",
      "location": "A more detailed address or specific spot location",
      "area": "The neighborhood or town name (e.g., Ooty, Besant Nagar)",
      "priceCategory": "Free | Budget | Mid-range | Premium",
      "cost": "Specific pricing info (e.g., ₹200 entry, or ₹800 for two)",
      "bestTime": "Best time/season to visit",
      "rating": 1-5
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find recommendations for: ${query} in ${category} category in Tamil Nadu. Ensure each has an area and price category.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              location: { type: Type.STRING },
              area: { type: Type.STRING },
              priceCategory: { type: Type.STRING },
              cost: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              rating: { type: Type.NUMBER }
            },
            required: ["id", "name", "category", "description", "location", "area", "priceCategory"]
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    const results: any[] = JSON.parse(jsonStr);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return results.map(r => ({
      ...r,
      links: links.slice(0, 3)
    })) as Recommendation[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
