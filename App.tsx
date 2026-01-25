import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ConfigPanel from './components/ConfigPanel';
import HistoryPanel from './components/HistoryPanel';
import ReviewPanel from './components/ReviewPanel';
import DashboardPanel from './components/DashboardPanel';
import { extractFlightData } from './services/aiFactory';
import { generateEmailHtml, TemplateStyle } from './utils/htmlTemplate';
import { generateWhatsAppText } from './utils/whatsappTemplate';
import { saveToHistory } from './services/historyService';
import { getConfig } from './services/configService';
import { HistoryItem, ExtractedFlightData } from './types';
import emailjs from '@emailjs/browser';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'config' | 'dashboard'>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Workflow State
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'result'>('upload');
  const [extractedData, setExtractedData] = useState<ExtractedFlightData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>('classic');

  // Upload Mode State
  const [uploadMode, setUploadMode] = useState<'single' | 'dual'>('single');
  const [fileSingle, setFileSingle] = useState<File | null>(null);
  const [fileOutbound, setFileOutbound] = useState<File | null>(null);
  const [fileInbound, setFileInbound] = useState<File | null>(null);

  // Email Sending State
  const [isSending, setIsSending] = useState(false);

  // --- Logic Helpers ---

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

        const [dataIda, dataVolta] = await Promise.all([
          processFile(fileOutbound),
          processFile(fileInbound)
        ]);

        finalData = {
          ...dataIda,
          inbound: dataVolta.outbound
        };
      }

      setExtractedData(finalData);
      setCurrentStep('review');

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

    setIsLoading(true);
    setError(null);

    processFile(file).then(data => {
      setExtractedData(data);
      setCurrentStep('review');
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

  // --- Review & Result Logic ---

  const handleConfirmReview = (data: ExtractedFlightData) => {
    setExtractedData(data);
    const html = generateEmailHtml(data, selectedTemplate);
    setHtmlOutput(html);
    setCurrentStep('result');
    saveToHistory(data, html);
    setHistoryRefresh(prev => prev + 1);
  };

  const handleTemplateChange = (style: TemplateStyle) => {
    setSelectedTemplate(style);
    if (extractedData) {
      const html = generateEmailHtml(extractedData, style);
      setHtmlOutput(html);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setExtractedData(item.data);
    setHtmlOutput(item.html);
    setCurrentStep('result');
  };

  const copyToClipboard = () => {
    if (htmlOutput) {
      navigator.clipboard.writeText(htmlOutput);
      alert('HTML copiado para a área de transferência!');
    }
  };

  const copyWhatsApp = () => {
    if (extractedData) {
      const text = generateWhatsAppText(extractedData);
      navigator.clipboard.writeText(text);
      alert('Texto para WhatsApp copiado!');
    }
  };

  const handleDownloadPDF = () => {
    if (!htmlOutput) return;

    // Create an invisible iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlOutput);
      doc.close();

      // Wait for images to load then print
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Remove update print dialog closes (or timeout)
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000); // Give user time to see dialog but usually it blocks JS exec until closed
      }, 500);
    }
  };

  const handleSendEmail = async () => {
    const config = getConfig();
    if (!config.emailJsServiceId || !config.emailJsTemplateId || !config.emailJsPublicKey) {
      alert("Configure o EmailJS na aba Configurações primeiro!");
      setActiveTab('config');
      return;
    }

    if (!extractedData) return;

    const userEmail = prompt("Digite o email do cliente:");
    if (!userEmail) return;

    setIsSending(true);
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: extractedData.passengerNames,
        message: generateWhatsAppText(extractedData),
        html_content: htmlOutput
      };

      await emailjs.send(
        config.emailJsServiceId,
        config.emailJsTemplateId,
        templateParams,
        config.emailJsPublicKey
      );
      alert("Email enviado com sucesso!");
    } catch (err: any) {
      console.error("Email Error:", err);
      alert("Falha ao enviar email. Verifique suas chaves.");
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setCurrentStep('upload');
    setExtractedData(null);
    setHtmlOutput(null);
    setFileSingle(null);
    setFileOutbound(null);
    setFileInbound(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-gradient-to-r from-[#00569e] to-[#00447c] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={reset}>
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
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'dashboard'
              ? 'border-[#00569e] text-[#00569e]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Dashboard 📊
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

        {activeTab === 'config' ? (
          <ConfigPanel />
        ) : activeTab === 'dashboard' ? (
          <DashboardPanel />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Input or Review */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">

              {currentStep === 'review' && extractedData ? (
                <ReviewPanel
                  data={extractedData}
                  onConfirm={handleConfirmReview}
                  onCancel={reset}
                />
              ) : (
                <>
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
                          Envie o bilhete completo.
                          <span className="block text-xs text-gray-400 mt-1">A IA processará e mostrará para revisão.</span>
                        </p>
                        <FileUpload onFileSelect={onSingleUpload} isLoading={isLoading} />
                      </>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-2">Envie os vouchers separadamente.</p>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ida</label>
                          <div className={fileOutbound ? "border-2 border-green-500 rounded-lg overflow-hidden" : ""}>
                            <FileUpload onFileSelect={onOutboundUpload} isLoading={false} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Volta</label>
                          <div className={fileInbound ? "border-2 border-green-500 rounded-lg overflow-hidden" : ""}>
                            <FileUpload onFileSelect={onInboundUpload} isLoading={false} />
                          </div>
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
                          {isLoading ? 'Processando...' : 'Revisar & Gerar'}
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm flex items-start gap-2">
                        <strong className="font-semibold">Erro:</strong> {error}
                      </div>
                    )}
                  </div>

                  <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={historyRefresh} />
                </>
              )}
            </div>

            {/* Right Column: Result */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">

              {/* Toolbar in Result Mode */}
              {currentStep === 'result' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between animate-in fade-in slide-in-from-top-2">
                  {/* Template Select */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">Modelo:</span>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {(['classic', 'minimal', 'urgent'] as TemplateStyle[]).map(style => (
                        <button
                          key={style}
                          onClick={() => handleTemplateChange(style)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${selectedTemplate === style ? 'bg-white shadow text-[#00569e]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                          {style === 'classic' ? 'Clássico' : style === 'minimal' ? 'Minimalista' : 'Urgente'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={copyWhatsApp}
                      title="Copiar para WhatsApp"
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.304-5.235c0-5.421 4.409-9.85 9.85-9.85 2.636 0 5.118 1.026 6.982 2.887 1.865 1.862 2.891 4.345 2.891 6.975 0 5.429-4.417 9.855-9.845 9.855" /></svg>
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      title="Baixar PDF (Imprimir)"
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>

                    <button
                      onClick={handleSendEmail}
                      disabled={isSending}
                      title="Enviar por Email"
                      className={`p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 ${isSending ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}

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
                        className="bg-white max-w-[600px] mx-auto shadow-lg ring-1 ring-gray-900/5 origin-top scale-[0.9] sm:scale-100"
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
        )}
      </main>
    </div>
  );
};

export default App;
