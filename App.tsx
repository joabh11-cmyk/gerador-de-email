import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import { extractFlightData } from './services/geminiService';
import { generateEmailHtml } from './utils/htmlTemplate';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'config'>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar o arquivo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (htmlOutput) {
      navigator.clipboard.writeText(htmlOutput);
      alert('HTML copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="bg-[#00569e] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1">
              <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo" className="w-8 h-8 rounded-full" />
            </div>
            <h1 className="text-xl font-bold">Gerador de Email - Clube do Voo</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'generator'
              ? 'border-[#00569e] text-[#00569e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Gerador de Email
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config'
              ? 'border-[#00569e] text-[#00569e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Configurações
          </button>
        </div>

        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Input */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-[#00569e]">1. Enviar PDF ou Imagem</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Envie o bilhete ou itinerário. A IA extrairá os dados e formatará o email automaticamente.
                </p>
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                    <strong>Erro:</strong> {error}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Como funciona:</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>A IA identifica passageiros, datas e números de voo.</li>
                  <li>Detecta automaticamente se é só ida ou ida e volta.</li>
                  <li>Ajusta o tratamento (Prezado/Prezada/Prezados) automaticamente.</li>
                  <li>Gera o código HTML pronto para uso em ferramentas de email marketing.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#00569e]">2. Resultado Gerado</h2>

              {htmlOutput ? (
                <div className="space-y-4">

                  {/* Visual Preview */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase text-gray-500">Pré-visualização</span>
                    </div>
                    <div className="h-[400px] w-full overflow-y-auto bg-gray-100 p-4">
                      {/* Render HTML inside a sanitized container or iframe-like structure for preview */}
                      <div
                        className="bg-white max-w-[600px] mx-auto shadow-lg"
                        dangerouslySetInnerHTML={{ __html: htmlOutput }}
                      />
                    </div>
                  </div>

                  {/* Code Block & Action */}
                  <div className="bg-gray-900 rounded-xl shadow-sm overflow-hidden text-white">
                    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">código_email.html</span>
                      <button
                        onClick={copyToClipboard}
                        className="bg-[#00569e] hover:bg-[#00447c] text-white text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        Copiar HTML
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-auto max-h-[200px] text-gray-300">
                      {htmlOutput}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                  {isLoading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-[#00569e] rounded-full animate-spin mb-4"></div>
                      <p>Analisando documento...</p>
                      <p className="text-xs">Isso pode levar alguns segundos</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>O código HTML aparecerá aqui</p>
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
