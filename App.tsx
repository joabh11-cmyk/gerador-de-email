import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import HistoryPanel from './components/HistoryPanel';
import { extractFlightData } from './services/aiFactory';
import { generateEmailHtml } from './utils/htmlTemplate';
import { saveToHistory } from './services/historyService';
import { HistoryItem, ExtractedFlightData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'config'>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Upload Mode State
  const [uploadMode, setUploadMode] = useState<'single' | 'dual'>('single');
  const [fileSingle, setFileSingle] = useState<File | null>(null);
  const [fileOutbound, setFileOutbound] = useState<File | null>(null);
  const [fileInbound, setFileInbound] = useState<File | null>(null);

  // Helper to process a single file and return data
  const processFile = async (file: File): Promise<ExtractedFlightData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const data = await extractFlightData(base64, file.type);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    setIsLoading(true);
    setError(null);
    setHtmlOutput(null);

    try {
      let finalData: ExtractedFlightData;

      if (uploadMode === 'single') {
        if (!fileSingle) throw new Error("Por favor, envie um arquivo.");
        finalData = await processFile(fileSingle);
      } else {
        if (!fileOutbound || !fileInbound) throw new Error("Por favor, envie os arquivos de Ida e Volta.");

        // Process both in parallel
        const [dataIda, dataVolta] = await Promise.all([
          processFile(fileOutbound),
          processFile(fileInbound)
        ]);

        // Merge Logic
        // We take the passenger names and greeting from the Outbound ticket
        // We map the 'outbound' result of the second file to 'inbound' of the final data
        finalData = {
          ...dataIda,
          inbound: dataVolta.outbound
        };
      }

      const generatedHtml = generateEmailHtml(finalData);
      setHtmlOutput(generatedHtml);
      saveToHistory(finalData, generatedHtml);
      setHistoryRefresh(prev => prev + 1);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar. Verifique os arquivos.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSingleUpload = (file: File) => {
    setFileSingle(file);
    setUploadMode('single');

    // Auto-trigger for single mode
    setIsLoading(true);
    setHtmlOutput(null);
    setError(null);

    processFile(file).then(data => {
      const html = generateEmailHtml(data);
      setHtmlOutput(html);
      saveToHistory(data, html);
      setHistoryRefresh(p => p + 1);
    }).catch(err => {
      console.error(err);
      setError(err.message || "Erro ao processar arquivo.");
    }).finally(() => setIsLoading(false));
  };

  const onOutboundUpload = (file: File) => {
    setFileOutbound(file);
    setError(null);
  };

  const onInboundUpload = (file: File) => {
    setFileInbound(file);
    setError(null);
  };

  // Legacy handler mapping (if passed as props somewhere expecting the old signature)
  const handleFileSelect = onSingleUpload;

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

              {/* Process Mode Toggle */}
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex mb-4">
                <button
                  onClick={() => setUploadMode('single')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${uploadMode === 'single'
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  Arquivo Único
                </button>
                <button
                  onClick={() => setUploadMode('dual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${uploadMode === 'dual'
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  Ida e Volta Separados
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                <h2 className="text-lg font-bold mb-4 text-[#00569e] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  1. Enviar Arquivo(s)
                </h2>

                {uploadMode === 'single' ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Envie o bilhete completo (contendo ida e volta ou só ida).
                      <span className="block text-xs text-gray-400 mt-1">Processamento automático ao selecionar.</span>
                    </p>
                    <FileUpload onFileSelect={onSingleUpload} isLoading={isLoading} />
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Envie os vouchers separadamente e clique em "Gerar Email Unificado".
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bilhete de Ida</label>
                      <div className={fileOutbound ? "border-2 border-green-500 rounded-lg overflow-hidden" : ""}>
                        <FileUpload onFileSelect={onOutboundUpload} isLoading={false} />
                      </div>
                      {fileOutbound && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Arquivo de Ida selecionado
                      </p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bilhete de Volta</label>
                      <div className={fileInbound ? "border-2 border-green-500 rounded-lg overflow-hidden" : ""}>
                        <FileUpload onFileSelect={onInboundUpload} isLoading={false} />
                      </div>
                      {fileInbound && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Arquivo de Volta selecionado
                      </p>}
                    </div>

                    <button
                      onClick={handleProcess}
                      disabled={!fileOutbound || !fileInbound || isLoading}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                        ${(!fileOutbound || !fileInbound || isLoading)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-[#00569e] hover:bg-[#00447c] shadow-lg hover:shadow-xl'
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          Gerar Email Unificado
                        </>
                      )}
                    </button>
                  </div>
                )}

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
