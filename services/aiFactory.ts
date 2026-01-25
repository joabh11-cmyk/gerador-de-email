import { extractFlightData as extractGemini } from './geminiService';
import { extractFlightDataOpenAI } from './openaiService';
import { ExtractedFlightData } from '../types';
import { getConfig } from './configService';

export const extractFlightData = async (fileBase64: string, mimeType: string): Promise<ExtractedFlightData> => {
    // 1. Get Config from the unified config service
    const config = getConfig();
    const provider = config.provider || 'gemini';
    let apiKey = provider === 'gemini' ? config.geminiKey : config.openaiKey;

    // Fallback to Env if no local key
    if (!apiKey && provider === 'gemini') {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    if (!apiKey) {
        throw new Error(`Chave de API não encontrada para ${provider}. Configure-a na aba 'Configurações'.`);
    }

    if (provider === 'openai') {
        return await extractFlightDataOpenAI(fileBase64, mimeType, apiKey);
    } else {
        // Pass the apiKey to geminiService to ensure it uses the latest one from config
        return await extractGemini(fileBase64, mimeType, apiKey);
    }
};
