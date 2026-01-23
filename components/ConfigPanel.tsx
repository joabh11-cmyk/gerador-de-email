import React, { useState, useEffect } from 'react';

const ConfigPanel: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState('gemini');
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        // Load saved settings
        const savedKey = localStorage.getItem('flight_extractor_api_key');
        const savedProvider = localStorage.getItem('flight_extractor_provider');
        if (savedKey) setApiKey(savedKey);
        if (savedProvider) setProvider(savedProvider);
    }, []);

    const handleSave = () => {
        localStorage.setItem('flight_extractor_api_key', apiKey);
        localStorage.setItem('flight_extractor_provider', provider);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
    };

    const handleClear = () => {
        localStorage.removeItem('flight_extractor_api_key');
        setApiKey('');
        setStatus('idle');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-1 text-[#00569e]">Configurações da IA</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Sua chave de API fica salva apenas no seu navegador.
                </p>

                <div className="space-y-4">
                    {/* Provider Selection (Future Proofing) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provedor de IA
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="gemini">Google Gemini (Recomendado)</option>
                            <option value="openai">OpenAI (GPT-4o)</option>
                        </select>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Cole sua chave aqui (Ex: AIzaSy...)"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showKey ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={handleClear}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Limpar Chave
                        </button>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#00569e] hover:bg-[#00447c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Salvar Configuração
                        </button>
                    </div>

                    {/* Status Message */}
                    {status === 'saved' && (
                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded border border-green-200 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Configurações salvas com sucesso!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigPanel;
