import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedFlightData } from "../types";

// We'll create the instance per request or cache it if the key is the same
let lastApiKey: string | null = null;
let genAIInstance: GoogleGenAI | null = null;

const getGenAI = (apiKey: string) => {
  if (apiKey !== lastApiKey || !genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
    lastApiKey = apiKey;
  }
  return genAIInstance;
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
    seat: { type: Type.STRING, description: "Selected seat (e.g. 12A). If not found, leave empty." },
    boardingTime: { type: Type.STRING, description: "Boarding time in hh:mm format. If not found, estimate 40-60 mins before flight time." },
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
    inbound: { ...flightSegmentSchema, nullable: true },
    additionalSegments: {
      type: Type.ARRAY,
      items: flightSegmentSchema,
      description: "Any additional flight segments beyond outbound and inbound."
    }
  },
  required: ["passengerNames", "greetingTitle", "pronoun", "outbound"]
};

export async function extractFlightData(fileBase64: string, mimeType: string, apiKey?: string): Promise<ExtractedFlightData> {
  try {
    // If apiKey is not provided, try to get it from localStorage as fallback
    const finalApiKey = apiKey || localStorage.getItem('flight_extractor_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

    if (!finalApiKey) {
      throw new Error("API Key não encontrada. Configure-a na aba 'Configurações'.");
    }

    const ai = getGenAI(finalApiKey);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
            Extract ALL individual flight segments found in the document.
            
            IMPORTANT: If a trip has a connection (e.g., Salvador -> São Paulo -> Rio de Janeiro), these are TWO separate flight segments. You MUST extract each one individually.
            
            Strictly follow these rules:
            1. SEGMENT MAPPING: 
               - Put the VERY FIRST flight segment in 'outbound'.
               - If there are more segments, put the VERY LAST flight segment of the entire trip in 'inbound'.
               - Put ALL segments that happen BETWEEN the first and the last in the 'additionalSegments' array, in chronological order.
               - If there is only ONE flight segment total, set 'inbound' to null and 'additionalSegments' to [].
               - If there are only TWO flight segments total, put the first in 'outbound' and the second in 'inbound'.
            2. PASSENGER NAMES: Extract the full names. If multiple passengers, join them naturally (e.g. "João Silva e Maria Souza"). Capitalize properly.
            3. GREETING: Determine the correct greeting (Prezado/Prezada/Prezados/Prezadas) based on the gender and number of passengers.
            4. PRONOUN: Choose 'o', 'a', 'os', or 'as' for the phrase "Esperamos que este email [pronoun] encontre bem".
            5. DATES & TIMES: Format dates as dd/mm/aaaa and times as hh:mm.
            6. ORIGIN/DESTINATION: Use the City Name (e.g. "São Paulo", "Nova York") rather than just the code if available.
            7. AIRLINES: Use the full name of the operating airline.
            8. SEATS: Extract the seat number for EACH segment if available.
            9. BOARDING TIME: Extract the boarding time for EACH segment. If not explicitly mentioned, calculate it as 40 minutes before the departure time.
            10. PNR: The booking reference (localizador) is usually the same for all segments, but check each one.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema
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
