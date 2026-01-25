import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedFlightData } from "../types";

// Initialize lazily to prevent crash on load if key is missing
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    // 1. Try LocalStorage (User Configured)
    let apiKey = localStorage.getItem('flight_extractor_api_key');

    // 2. Try Env Vars (Server/Build Configured)
    if (!apiKey) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    if (!apiKey) {
      console.error("DEBUG: API Key está vazia ou indefinida:", apiKey);
      throw new Error("API Key não encontrada. Configure-a na aba 'Configurações' ou no ambiente.");
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
            2. If it is a direct flight, set 'connection' to null. If there are stops, summarize the connection details (duration and flight number of connecting flight).
            3. PASSENGER NAMES: Extract the full names. If multiple passengers, join them naturally (e.g. "João Silva e Maria Souza"). Capitalize properly.
            4. GREETING: Determine the correct greeting (Prezado/Prezada/Prezados/Prezadas) based on the gender and number of passengers.
            5. PRONOUN: Choose 'o', 'a', 'os', or 'as' for the phrase "Esperamos que este email [pronoun] encontre bem".
            6. DATES & TIMES: Format dates as dd/mm/aaaa and times as hh:mm. Pay attention to "Next Day" (+1) arrival times, but extract the time exactly as shown.
            7. ORIGIN/DESTINATION: Use the City Name (e.g. "São Paulo", "Nova York") rather than just the code if available.
            8. AIRLINES: Use the full name of the operating airline.
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
