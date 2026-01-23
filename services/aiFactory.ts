import { extractFlightData as extractGemini } from './geminiService';
import { extractFlightDataOpenAI } from './openaiService';
import { ExtractedFlightData } from '../types';

export const extractFlightData = async (fileBase64: string, mimeType: string): Promise<ExtractedFlightData> => {
    // 1. Get Config
    const provider = localStorage.getItem('flight_extractor_provider') || 'gemini';
    let apiKey = localStorage.getItem('flight_extractor_api_key');

    // Fallback to Env if no local key (only works if provider matches env setup, mostly for Gemini default)
    if (!apiKey && provider === 'gemini') {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    if (!apiKey) {
        throw new Error(`Chave de API não encontrada para ${provider}. Configure-a na aba 'Configurações'.`);
    }

    if (provider === 'openai') {
        return await extractFlightDataOpenAI(fileBase64, mimeType, apiKey);
    } else {
        // Gemini handles its own key inside the service for now, but cleaner if we passed it. 
        // Since we refactored geminiService to look at localStorage too, we can just call it.
        return await extractGemini(fileBase64, mimeType);
    }
};
