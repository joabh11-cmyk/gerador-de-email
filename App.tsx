import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import HistoryPanel from './components/HistoryPanel';
import { extractFlightData } from './services/aiFactory';
import { generateEmailHtml } from './utils/htmlTemplate';
import { saveToHistory } from './services/historyService';
import { HistoryItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'config'>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setHtmlOutput(null);

    try {
      // Convert file to Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const extractedData = await extractFlightData(base64Data, file.type);
      const generatedHtml = generateEmailHtml(extractedData);

      setHtmlOutput(generatedHtml);
      saveToHistory(extractedData, generatedHtml);
      setHistoryRefresh(prev => prev + 1);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar o arquivo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setHtmlOutput(item.html);
  };

  const copyToClipboard = () => {
    if (htmlOutput) {
      navigator.clipboard.writeText(htmlOutput);
      alert('HTML copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-gradient-to-r from-[#00569e] to-[#00447c] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1.5 shadow-inner">
              <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo" className="w-9 h-9 rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gerador de Email</h1>
              <p className="text-xs text-blue-100 opacity-80">Clube do Voo • Extrator Inteligente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 max-w-2xl">
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'generator'
              ? 'border-[#00569e] text-[#00569e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Gerador
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'config'
              ? 'border-[#00569e] text-[#00569e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Configurações
          </button>
        </div>

        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Input (5 cols) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <h2 className="text-lg font-bold mb-4 text-[#00569e] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  1. Enviar Arquivo
                </h2>
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <strong className="block font-semibold mb-1">Erro ao processar:</strong>
                      {error}
                    </div>
                  </div>
                )}
              </div>

              <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={historyRefresh} />
            </div>

            {/* Right Column: Output (7 cols) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <h2 className="text-lg font-bold text-[#00569e] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                2. Resultado Gerado
              </h2>

              {htmlOutput ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* Visual Preview */}
                  <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pré-visualização</span>
                    </div>
                    <div className="h-[500px] w-full overflow-y-auto bg-gray-50/50 p-6 scrollbar-thin">
                      <div
                        className="bg-white max-w-[600px] mx-auto shadow-lg ring-1 ring-gray-900/5"
                        dangerouslySetInnerHTML={{ __html: htmlOutput }}
                      />
                    </div>
                  </div>

                  {/* Code Block & Action */}
                  <div className="bg-[#1e1e1e] rounded-xl shadow-lg overflow-hidden text-white border border-gray-800">
                    <div className="px-4 py-3 bg-[#2d2d2d] border-b border-gray-700/50 flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">código_email.html</span>
                      <button
                        onClick={copyToClipboard}
                        className="bg-[#00569e] hover:bg-[#00447c] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        Copiar HTML
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-auto max-h-[250px] text-gray-300 scrollbar-thin scrollbar-thumb-gray-600 font-ligatures-none">
                      {htmlOutput}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-400 transition-colors hover:border-gray-300">
                  {isLoading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-[#00569e] rounded-full animate-spin mb-4 shadow-sm"></div>
                      <p className="font-medium text-gray-600">Analisando documento...</p>
                      <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-medium">O código HTML aparecerá aqui</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ConfigPanel />
        )}
      </main>
    </div>
  );
};

export default App;
