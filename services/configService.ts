import { AgentProfile, AppConfig } from '../types';
import CryptoJS from 'crypto-js';

const AGENTS_KEY = 'flight_extractor_agents';
const CONFIG_KEY = 'flight_extractor_config_v2';
const SECRET_KEY = 'CLUBE_DO_VOO_SECURE_V1'; // Static key for client-side obfuscation

const DEFAULT_AGENTS: AgentProfile[] = [
    {
        id: 'default',
        name: 'Joabh Souza',
        role: 'Consultor de Viagens',
        phone: '(75) 99202-0012',
        email: 'suporte@clubedovooviagens.com.br',
        isActive: true
    }
];

// --- Encryption Helpers ---

const encrypt = (data: string): string => {
    if (!data) return '';
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

const decrypt = (ciphertext: string): string | null => {
    if (!ciphertext) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || null;
    } catch (e) {
        return null;
    }
};

// --- Services ---

export const getAgents = (): AgentProfile[] => {
    const raw = localStorage.getItem(AGENTS_KEY);
    if (!raw) return DEFAULT_AGENTS;
    try {
        return JSON.parse(raw);
    } catch {
        return DEFAULT_AGENTS;
    }
};

export const saveAgents = (agents: AgentProfile[]) => {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
};

export const getActiveAgent = (): AgentProfile => {
    const agents = getAgents();
    return agents.find(a => a.isActive) || agents[0];
};

export const setActiveAgent = (id: string) => {
    const agents = getAgents().map(a => ({
        ...a,
        isActive: a.id === id
    }));
    saveAgents(agents);
};

export const getConfig = (): AppConfig => {
    const raw = localStorage.getItem(CONFIG_KEY);

    if (raw) {
        // Try interpreting as legacy Plain JSON first
        try {
            const parsed = JSON.parse(raw);
            // If it parses and has keys we expect, return it.
            // But verify: encrypted strings are NOT valid json objects usually (unless "string").
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
        } catch {
            // Not JSON, likely encrypted string
        }

        // Try decrypting
        try {
            const decryptedString = decrypt(raw);
            if (decryptedString) {
                return JSON.parse(decryptedString);
            }
        } catch {
            // Reset if corrupted
            return { geminiKey: '', openaiKey: '', provider: 'gemini', emailJsServiceId: '', emailJsTemplateId: '', emailJsPublicKey: '' };
        }
    }

    // Fallback: Migration from old unencrypted keys (legacy v1 keys)
    return {
        geminiKey: localStorage.getItem('flight_extractor_api_key') || '',
        openaiKey: '',
        provider: (localStorage.getItem('flight_extractor_provider') as any) || 'gemini',
        emailJsServiceId: '',
        emailJsTemplateId: '',
        emailJsPublicKey: ''
    };
};

export const saveConfig = (config: AppConfig) => {
    // Encrypt the entire config object as a string
    const jsonString = JSON.stringify(config);
    const encrypted = encrypt(jsonString);

    localStorage.setItem(CONFIG_KEY, encrypted);

    // Clean up legacy keys to avoid confusion, since we are now fully using the encrypted blob
    localStorage.removeItem('flight_extractor_api_key');
    // We keep provider just in case other parts look at it, but ideally we should clean it too.
    // localStorage.removeItem('flight_extractor_provider');
};
