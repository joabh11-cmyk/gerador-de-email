import React, { useState, useEffect } from 'react';
import { ExtractedFlightData } from '../types';

interface ReviewPanelProps {
    data: ExtractedFlightData;
    onConfirm: (updatedData: ExtractedFlightData) => void;
    onCancel: () => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ data, onConfirm, onCancel }) => {
    const [formData, setFormData] = useState<ExtractedFlightData>(data);

    // Sync state if props change (though typically this component mounts fresh)
    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (field: keyof ExtractedFlightData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDeepChange = (segment: 'outbound' | 'inbound', field: string, value: string) => {
        setFormData(prev => {
            const updatedSegment = { ...prev[segment]!, [field]: value };
            return { ...prev, [segment]: updatedSegment };
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Revisar Dados Extraídos
                </h2>
                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Edite se necessário</span>
            </div>

            <div className="space-y-6">
                {/* Core Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Passageiro(s)</label>
                        <input
                            type="text"
                            value={formData.passengerNames}
                            onChange={e => handleChange('passengerNames', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Saudação (Título)</label>
                        <select
                            value={formData.greetingTitle}
                            onChange={e => handleChange('greetingTitle', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Prezado">Prezado</option>
                            <option value="Prezada">Prezada</option>
                            <option value="Prezados">Prezados</option>
                            <option value="Prezadas">Prezadas</option>
                        </select>
                    </div>
                </div>

                {/* Flight Outbound */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">✈️ Ida</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Origem</label>
                            <input value={formData.outbound.origin} onChange={e => handleDeepChange('outbound', 'origin', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Destino</label>
                            <input value={formData.outbound.destination} onChange={e => handleDeepChange('outbound', 'destination', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nº Voo</label>
                            <input value={formData.outbound.flightNumber} onChange={e => handleDeepChange('outbound', 'flightNumber', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data</label>
                            <input value={formData.outbound.date} onChange={e => handleDeepChange('outbound', 'date', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Horário</label>
                            <input value={formData.outbound.time} onChange={e => handleDeepChange('outbound', 'time', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cia Aérea</label>
                            <input value={formData.outbound.airline} onChange={e => handleDeepChange('outbound', 'airline', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div className="col-span-2 md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Localizador (PNR)</label>
                            <input value={formData.outbound.pnr} onChange={e => handleDeepChange('outbound', 'pnr', e.target.value)} className="w-full p-2 border rounded bg-white font-mono" />
                        </div>
                    </div>
                    {formData.outbound.connection && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-bold text-blue-800 mb-2">Conexão</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tempo</label>
                                    <input value={formData.outbound.connection.duration} onChange={e => {
                                        const newConn = { ...formData.outbound.connection!, duration: e.target.value };
                                        setFormData(prev => ({ ...prev, outbound: { ...prev.outbound, connection: newConn } }));
                                    }} className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Voo Conexão</label>
                                    <input value={formData.outbound.connection.flightNumber} onChange={e => {
                                        const newConn = { ...formData.outbound.connection!, flightNumber: e.target.value };
                                        setFormData(prev => ({ ...prev, outbound: { ...prev.outbound, connection: newConn } }));
                                    }} className="w-full p-2 border rounded" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Flight Inbound */}
                {formData.inbound && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex justify-between mb-3">
                            <h3 className="font-bold text-green-900 flex items-center gap-2">✈️ Volta</h3>
                            <button onClick={() => handleChange('inbound', null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remover Volta</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Origem</label>
                                <input value={formData.inbound.origin} onChange={e => handleDeepChange('inbound', 'origin', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Destino</label>
                                <input value={formData.inbound.destination} onChange={e => handleDeepChange('inbound', 'destination', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nº Voo</label>
                                <input value={formData.inbound.flightNumber} onChange={e => handleDeepChange('inbound', 'flightNumber', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data</label>
                                <input value={formData.inbound.date} onChange={e => handleDeepChange('inbound', 'date', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Horário</label>
                                <input value={formData.inbound.time} onChange={e => handleDeepChange('inbound', 'time', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cia Aérea</label>
                                <input value={formData.inbound.airline} onChange={e => handleDeepChange('inbound', 'airline', e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div className="col-span-2 md:col-span-3">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Localizador (PNR)</label>
                                <input value={formData.inbound.pnr} onChange={e => handleDeepChange('inbound', 'pnr', e.target.value)} className="w-full p-2 border rounded bg-white font-mono" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(formData)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Confirmar Dados
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewPanel;
