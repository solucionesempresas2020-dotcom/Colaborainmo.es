import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Property } from "../types";

// Helper to format properties for the AI context
const formatPropertiesForContext = (properties: Property[]): string => {
  return properties.map(p => 
    `- ID: ${p.id}, Tipo: ${p.type}, Ciudad: ${p.city}, Precio: ${p.price}€, Habitaciones: ${p.bedrooms}, Descripción: ${p.title} - ${p.description}`
  ).join('\n');
};

export interface ChatResponse {
  text: string;
  groundingMetadata?: any;
}

export const generateResponse = async (
  prompt: string, 
  properties: Property[],
  history: string[] = [],
  imageBase64?: string,
  imageMimeType?: string,
  customSystemInstruction?: string
): Promise<ChatResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { text: "Error: API Key no configurada." };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Context about properties
    const propertyContext = formatPropertiesForContext(properties);
    
    // Combine user's custom instruction with the dynamic data context
    const systemInstruction = `
      ${customSystemInstruction || 'Eres un asistente útil.'}

      --- DATOS DEL SISTEMA (No modificables) ---
      LISTA DE PROPIEDADES ACTUALES:
      ${propertyContext}
    `;

    // MODE 1: Image Analysis (Gemini 3 Pro)
    if (imageBase64 && imageMimeType) {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
            { text: `Contexto previo: ${history.join('\n')}\n\nAnaliza esta imagen y responde al usuario: ${prompt}` }
          ]
        },
        config: { systemInstruction }
      });
      return { text: response.text || "No pude analizar la imagen." };
    }

    // MODE 2: Text Chat with Google Maps Grounding (Gemini 2.5 Flash)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${history.join('\n')}\nUsuario: ${prompt}`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }], // Enable Maps Grounding
        temperature: 0.7,
      }
    });

    return { 
      text: response.text || "No pude generar una respuesta.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };

  } catch (error) {
    console.error("Error generating AI response:", error);
    return { text: "Lo siento, hubo un error técnico." };
  }
};

export const generatePropertyDescription = async (details: any): Promise<string> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "";

        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
        Actúa como un agente inmobiliario experto en marketing y redacción publicitaria.
        Escribe una descripción atractiva, emocional y profesional para una propiedad con los siguientes datos:
        
        - Título sugerido: ${details.title}
        - Ciudad: ${details.city}
        - Tipo: ${details.type}
        - Precio: ${details.price} €
        - Habitaciones: ${details.bedrooms}
        - Baños: ${details.bathrooms}
        - Tamaño: ${details.size} m2
        - Características extra (si las hay): ${details.extras || "Buena ubicación"}

        La descripción debe tener unos 2-3 párrafos. Destaca el estilo de vida. No uses markdown ni asteriscos.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8 // Creative
            }
        });

        return response.text || "";
    } catch (error) {
        console.error("Error generating description:", error);
        return "";
    }
};

export const generatePropertyVideo = async (prompt: string): Promise<string | null> => {
  try {
    // Check if user has selected an API key (Required for Veo)
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      await window.aistudio.openSelectKey();
      // Wait a moment for the state to update or just proceed hoping user selected it
    }

    // Create NEW instance to ensure we have the selected key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Return the URI directly; in a real app you might need to fetch with key
      // But for <video src="..."> we need a signed URL or similar. 
      // The instruction says: append API key when fetching.
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};