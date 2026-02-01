
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Recommendation, District } from "../types";

export const getAIGuideResponse = async (
  query: string, 
  category: string, 
  district: District,
  location?: { lat: number, lng: number }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are 'TAMIL NADU EXPLORE Guide', a world-class tourism expert for the state of Tamil Nadu, India.
    Current Context:
    - Target District: ${district}
    - Category focus: ${category}
    - Search Query: ${query}
    - Location: ${location ? `Lat: ${location.lat}, Lng: ${location.lng}` : 'Not provided'}

    Knowledge Base for Categories:
    1. Places to Visit: Beaches, Hill stations, Waterfalls, Temples & heritage sites, Weekend getaway spots, Hidden/offbeat places.
    2. Food & Restaurants: Budget food, Street food spots, Cafes, Biryani & local specialties, Dessert places, Late-night food.
    3. Events & Happenings: Concerts, Stand-up comedy, College culturals, Exhibitions, Festivals, Workshops.
    4. Activities & Adventures: Trekking, Surfing, Camping, Kayaking, Go-karting, Paintball, Cycling trails.
    5. Entertainment & Fun: Movie theatres, Gaming arenas, Bowling, VR experiences, Escape rooms, Indoor fun zones.
    6. Shopping & Markets: Budget shopping areas, Street markets, Malls, Bookstores, Local unique shops.

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

export const generatePlaceImage = async (placeName: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';

  try {
    const prompt = `A professional, high-quality architectural or travel photograph of ${placeName} in Tamil Nadu, India. ${description}. Golden hour lighting, sharp focus, cinematic composition, photorealistic.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image generation failed", error);
    return `https://source.unsplash.com/featured/1600x900?${encodeURIComponent(placeName + ' Tamil Nadu architecture')}`;
  }
};

/**
 * Generates a creative tagline for the website or a specific district.
 * Uses the latest gemini-3-flash-preview model.
 */
export const getAITagline = async (subject: string = "Tamil Nadu") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a catchy, poetic, one-sentence tagline for a travel website about ${subject}. Keep it under 10 words. Focus on soul, culture, and discovery.`,
    });
    return response.text?.trim().replace(/"/g, '') || "";
  } catch (error) {
    console.error("Tagline generation failed", error);
    return "Explore the Heart of Tamil Nadu.";
  }
};
