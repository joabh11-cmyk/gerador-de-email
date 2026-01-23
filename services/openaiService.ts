import OpenAI from "openai";
import { ExtractedFlightData } from "../types";

let openai: OpenAI | null = null;

const getOpenAI = (apiKey: string) => {
    if (!openai || openai.apiKey !== apiKey) {
        openai = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    }
    return openai;
};

export async function extractFlightDataOpenAI(fileBase64: string, mimeType: string, apiKey: string): Promise<ExtractedFlightData> {
    try {
        const ai = getOpenAI(apiKey);

        const response = await ai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an expert flight data extractor. You must extract data from flight tickets/itineraries and return valid JSON.
          
          Format dates as dd/mm/aaaa and times as hh:mm.
          If multiple passengers, separate names with 'e' (e.g. "João e Maria").
          Determine greetingTitle (Prezado/Prezada/Prezados) and pronoun (o/a/os/as) based on names.
          
          JSON Schema:
          {
            "passengerNames": "string",
            "greetingTitle": "string",
            "pronoun": "string",
            "outbound": {
              "flightNumber": "string",
              "date": "string",
              "time": "string",
              "origin": "string",
              "destination": "string",
              "airline": "string",
              "pnr": "string",
              "connection": { "duration": "string", "flightNumber": "string" } | null
            },
            "inbound": {
              "flightNumber": "string",
              "date": "string",
              "time": "string",
              "origin": "string",
              "destination": "string",
              "airline": "string",
              "pnr": "string",
              "connection": { "duration": "string", "flightNumber": "string" } | null
            } | null
          }
          `
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract flight details from this image." },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${fileBase64}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ]
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        return JSON.parse(content) as ExtractedFlightData;
    } catch (error) {
        console.error("OpenAI Extraction Error:", error);
        throw error;
    }
}
