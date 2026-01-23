import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedFlightData } from "../types";

// Initialize lazily to prevent crash on load if key is missing
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    // Vite exposes env vars on import.meta.env
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("DEBUG: API Key está vazia ou indefinida:", apiKey);
      throw new Error("API Key do Gemini não configurada. Verifique as variáveis de ambiente.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

const connectionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    duration: { type: Type.STRING, description: "Duration of the connection/layover (e.g. 2h 30m)" },
    flightNumber: { type: Type.STRING, description: "Flight number of the connecting flight" }
  },
  required: ["duration", "flightNumber"]
};

const flightSegmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    flightNumber: { type: Type.STRING },
    date: { type: Type.STRING, description: "Date in dd/mm/aaaa format" },
    time: { type: Type.STRING, description: "Time in hh:mm format" },
    origin: { type: Type.STRING, description: "Airport code or city name" },
    destination: { type: Type.STRING, description: "Airport code or city name" },
    airline: { type: Type.STRING },
    pnr: { type: Type.STRING, description: "Booking reference / Localizador" },
    connection: {
      type: Type.OBJECT,
      nullable: true,
      description: "If direct flight, set to null. If there is a connection, fill details.",
      properties: {
        duration: { type: Type.STRING },
        flightNumber: { type: Type.STRING }
      }
    }
  },
  required: ["flightNumber", "date", "time", "origin", "destination", "airline", "pnr"]
};

const extractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    passengerNames: { type: Type.STRING, description: "Full name(s) of passenger(s). If multiple, separate properly (e.g., 'João e Maria')." },
    greetingTitle: { type: Type.STRING, description: "One of: Prezado, Prezada, Prezados, Prezadas" },
    pronoun: { type: Type.STRING, description: "The object pronoun for 'find you well'. Use 'o' (masc sing), 'a' (fem sing), 'os' (masc plural), 'as' (fem plural)." },
    outbound: flightSegmentSchema,
    inbound: { ...flightSegmentSchema, nullable: true }
  },
  required: ["passengerNames", "greetingTitle", "pronoun", "outbound"]
};

export async function extractFlightData(fileBase64: string, mimeType: string): Promise<ExtractedFlightData> {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: `Analyze the attached flight document (ticket, itinerary, screenshot). 
            Extract the flight details for the outbound and inbound (if applicable) flights.
            
            Strictly follow these rules:
            1. If it is a one-way ticket, set 'inbound' to null.
            2. If it is a direct flight, set 'connection' to null.
            3. Determine the correct greeting title (Prezado/Prezada/Prezados/Prezadas) based on names.
            4. Determine the correct pronoun (o/a/os/as) for the phrase "Esperamos que este email [pronoun] encontre bem".
            5. Format dates as dd/mm/aaaa and times as hh:mm.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
        thinkingConfig: {
          thinkingBudget: 16000
        }
      }
    });

    if (!response.text) {
      throw new Error("No text response from Gemini");
    }

    return JSON.parse(response.text) as ExtractedFlightData;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
