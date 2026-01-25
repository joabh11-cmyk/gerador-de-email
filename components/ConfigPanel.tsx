import React, { useState, useEffect } from 'react';
import { AgentProfile, AppConfig } from '../types';
import { getConfig, saveConfig, getAgents, saveAgents } from '../services/configService';

const ConfigPanel: React.FC = () => {
    const [config, setConfig] = useState<AppConfig>({
        geminiKey: '',
        openaiKey: '',
        provider: 'gemini',
        emailJsServiceId: '',
        emailJsTemplateId: '',
        emailJsPublicKey: ''
    });
    const [agents, setAgents] = useState<AgentProfile[]>([]);
    const [status, setStatus] = useState<'idle' | 'saved'>('idle');
    const [activeTab, setActiveTab] = useState<'ai' | 'team'>('ai');

    // New Agent State
    const [newAgent, setNewAgent] = useState({ name: '', role: 'Consultor de Viagens', phone: '(75) 99202-', email: '' });

    useEffect(() => {
        setConfig(getConfig());
        setAgents(getAgents());
    }, []);

    const handleSave = () => {
        saveConfig(config);
        saveAgents(agents);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
    };

    const handleAddAgent = () => {
        if (!newAgent.name) return;
        const agent: AgentProfile = {
            id: Date.now().toString(),
            name: newAgent.name,
            role: newAgent.role,
            phone: newAgent.phone,
            email: newAgent.email,
            isActive: agents.length === 0 // Make active if first
        };
        setAgents([...agents, agent]);
        setNewAgent({ name: '', role: 'Consultor de Viagens', phone: '(75) 99202-', email: '' });
    };

    const handleDeleteAgent = (id: string) => {
        const remaining = agents.filter(a => a.id !== id);
        setAgents(remaining);
        // If we deleted the active one, activate the first one
        if (remaining.length > 0 && !remaining.some(a => a.isActive)) {
            remaining[0].isActive = true;
            setAgents([...remaining]); // trigger re-render
        }
    };

    const toggleAgentActive = (id: string) => {
        // Only one active at a time for simplicity in this version, 
        // essentially "Selecting who I am right now"
        setAgents(agents.map(a => ({
            ...a,
            isActive: a.id === id
        })));
        // In a real multi-user app, this would be session based, but for local tool, this works.
    };

    return (
        <div className="max-w-4xl mx-auto">

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ai' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    🤖 Inteligência Artificial
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    👥 Equipe & Email
                </button>
            </div>

            {activeTab === 'ai' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                    <h2 className="text-lg font-semibold text-[#00569e]">Configuração da IA</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provedor</label>
                        <select
                            value={config.provider}
                            onChange={e => setConfig({ ...config, provider: e.target.value as any })}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="gemini">Google Gemini (Recomendado)</option>
                            <option value="openai">OpenAI (GPT-4)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                        <input
                            type="password"
                            value={config.provider === 'gemini' ? config.geminiKey : config.openaiKey}
                            onChange={e => {
                                if (config.provider === 'gemini') setConfig({ ...config, geminiKey: e.target.value });
                                else setConfig({ ...config, openaiKey: e.target.value });
                            }}
                            className="w-full p-2 border rounded-md"
                            placeholder="Cole sua chave aqui..."
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Agent Management */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-[#00569e] mb-4">Gerenciar Consultores</h2>
                        <div className="space-y-4">
                            {agents.map(agent => (
                                <div key={agent.id} className={`flex items-center justify-between p-3 rounded-lg border ${agent.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            onClick={() => toggleAgentActive(agent.id)}
                                            className={`w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center ${agent.isActive ? 'border-blue-600' : 'border-gray-400'}`}
                                        >
                                            {agent.isActive && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{agent.name}</p>
                                            <p className="text-xs text-gray-500">{agent.role} • {agent.phone}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAgent(agent.id)} className="text-red-400 hover:text-red-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}

                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input placeholder="Nome" value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} className="p-2 border rounded text-sm" />
                                <input placeholder="Cargo" value={newAgent.role} onChange={e => setNewAgent({ ...newAgent, role: e.target.value })} className="p-2 border rounded text-sm" />
                                <input placeholder="Telefone" value={newAgent.phone} onChange={e => setNewAgent({ ...newAgent, phone: e.target.value })} className="p-2 border rounded text-sm" />
                                <input placeholder="Email" value={newAgent.email} onChange={e => setNewAgent({ ...newAgent, email: e.target.value })} className="p-2 border rounded text-sm" />
                                <button onClick={handleAddAgent} className="md:col-span-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded text-sm">
                                    + Adicionar Consultor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* EmailJS Config */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-[#00569e] mb-4">Configuração de Envio (EmailJS)</h2>
                        <p className="text-sm text-gray-500 mb-4">Para enviar emails direto do app, crie uma conta grátis no emailjs.com</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service ID</label>
                                <input
                                    value={config.emailJsServiceId || ''}
                                    onChange={e => setConfig({ ...config, emailJsServiceId: e.target.value })}
                                    className="w-full p-2 border rounded text-sm font-mono"
                                    placeholder="service_..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template ID</label>
                                <input
                                    value={config.emailJsTemplateId || ''}
                                    onChange={e => setConfig({ ...config, emailJsTemplateId: e.target.value })}
                                    className="w-full p-2 border rounded text-sm font-mono"
                                    placeholder="template_..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Public Key</label>
                                <input
                                    value={config.emailJsPublicKey || ''}
                                    onChange={e => setConfig({ ...config, emailJsPublicKey: e.target.value })}
                                    className="w-full p-2 border rounded text-sm font-mono"
                                    placeholder="user_..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Salvar Alterações
                </button>
            </div>

            {status === 'saved' && (
                <div className="fixed bottom-4 right-4 p-4 bg-green-800 text-white rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Configurações salvas!
                </div>
            )}
        </div>
    );
};

export default ConfigPanel;
