
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Recommendation, District } from "../types";

export const getAIGuideResponse = async (
  query: string, 
  category: string, 
  district: District,
  location?: { lat: number, lng: number }
) => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are 'TAMIL NADU EXPLORE Guide', a world-class tourism expert for the state of Tamil Nadu, India.
    Current Context:
    - Target District: ${district}
    - Category focus: ${category}
    - Search Query: ${query}
    - Location: ${location ? `Lat: ${location.lat}, Lng: ${location.lng}` : 'Not provided'}

    Rules:
    1. If a district is specified, strictly prioritize results in that district.
    2. Provide authentic local suggestions (hidden gems, heritage sites, local eateries).
    3. Include both English and Tamil names for the place if possible.
    
    Response MUST be a JSON array of objects:
    {
      "id": "slug",
      "name": "English Name",
      "nameTamil": "தமிழ் பெயர்",
      "category": "Category Name",
      "description": "Engaging description",
      "location": "Address",
      "area": "Neighborhood/Town",
      "district": "The District name",
      "priceCategory": "Free|Budget|Mid-range|Premium",
      "cost": "Pricing details",
      "bestTime": "Best visit window",
      "rating": 1-5
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find the best ${category} in ${district === 'All' ? 'Tamil Nadu' : district} related to: ${query}`,
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

    // Access .text property directly (not as a method)
    const jsonStr = response.text?.trim() || "[]";
    const results: any[] = JSON.parse(jsonStr);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return results.map(r => ({
      ...r,
      links: links.slice(0, 3)
    })) as Recommendation[];
  } catch (error: any) {
    if (error.message?.includes('403') || error.message?.includes('401')) {
       throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};
