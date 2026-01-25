import { AgentProfile, AppConfig } from '../types';

const AGENTS_KEY = 'flight_extractor_agents';
const CONFIG_KEY = 'flight_extractor_config_v2'; // v2 to migrate cleanly if needed

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
    if (raw) return JSON.parse(raw);

    // Migration from old keys
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
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    // Sync legacy keys for backward compat with services
    localStorage.setItem('flight_extractor_api_key', config.geminiKey);
    localStorage.setItem('flight_extractor_provider', config.provider);
};
