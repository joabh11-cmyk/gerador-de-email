import React, { useState, useEffect } from 'react';
import { ExtractedFlightData, FlightSegment } from '../types';

interface ReviewPanelProps {
    data: ExtractedFlightData;
    onConfirm: (updatedData: ExtractedFlightData) => void;
    onCancel: () => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ data, onConfirm, onCancel }) => {
    const [formData, setFormData] = useState<ExtractedFlightData>(data);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (field: keyof ExtractedFlightData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDeepChange = (segment: 'outbound' | 'inbound' | number, field: string, value: string) => {
        setFormData(prev => {
            if (typeof segment === 'number') {
                const updatedAdditional = [...(prev.additionalSegments || [])];
                updatedAdditional[segment] = { ...updatedAdditional[segment], [field]: value };
                return { ...prev, additionalSegments: updatedAdditional };
            }
            const updatedSegment = { ...prev[segment]!, [field]: value };
            return { ...prev, [segment]: updatedSegment };
        });
    };

    const addSegment = () => {
        setFormData(prev => ({
            ...prev,
            additionalSegments: [
                ...(prev.additionalSegments || []),
                { ...prev.outbound, flightNumber: '', origin: '', destination: '', seat: '', boardingTime: '' }
            ]
        }));
    };

    const removeAdditionalSegment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            additionalSegments: prev.additionalSegments?.filter((_, i) => i !== index)
        }));
    };

    const renderFlightSegment = (title: string, segment: 'outbound' | 'inbound' | number, color: string) => {
        let s: FlightSegment | null | undefined;
        if (typeof segment === 'number') {
            s = formData.additionalSegments?.[segment];
        } else {
            s = formData[segment];
        }

        if (!s) return null;
        const bgColor = color === 'blue' ? 'bg-blue-50 border-blue-100' : color === 'green' ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100';
        const textColor = color === 'blue' ? 'text-blue-900' : color === 'green' ? 'text-green-900' : 'text-purple-900';

        return (
            <div className={`${bgColor} p-4 rounded-lg border`}>
                <div className="flex justify-between mb-3">
                    <h3 className={`font-bold ${textColor} flex items-center gap-2`}>✈️ {title}</h3>
                    {segment === 'inbound' && (
                        <button onClick={() => handleChange('inbound', null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remover</button>
                    )}
                    {typeof segment === 'number' && (
                        <button onClick={() => removeAdditionalSegment(segment)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remover</button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Origem</label>
                        <input value={s.origin} onChange={e => handleDeepChange(segment, 'origin', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Destino</label>
                        <input value={s.destination} onChange={e => handleDeepChange(segment, 'destination', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nº Voo</label>
                        <input value={s.flightNumber} onChange={e => handleDeepChange(segment, 'flightNumber', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data</label>
                        <input value={s.date} onChange={e => handleDeepChange(segment, 'date', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Horário</label>
                        <input value={s.time} onChange={e => handleDeepChange(segment, 'time', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cia Aérea</label>
                        <input value={s.airline} onChange={e => handleDeepChange(segment, 'airline', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assento</label>
                        <input value={s.seat || ''} onChange={e => handleDeepChange(segment, 'seat', e.target.value)} className="w-full p-2 border rounded" placeholder="Ex: 12A" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Embarque</label>
                        <input value={s.boardingTime || ''} onChange={e => handleDeepChange(segment, 'boardingTime', e.target.value)} className="w-full p-2 border rounded" placeholder="Ex: 14:20" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Localizador (PNR)</label>
                        <input value={s.pnr} onChange={e => handleDeepChange(segment, 'pnr', e.target.value)} className="w-full p-2 border rounded bg-white font-mono" />
                    </div>
                </div>
            </div>
        );
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
                            <option value="Prezada">Prezadas</option>
                        </select>
                    </div>
                </div>

                {/* Flight Segments in chronological order */}
                {renderFlightSegment('Trecho 1', 'outbound', 'blue')}
                
                {formData.additionalSegments?.map((_, index) => (
                    renderFlightSegment(`Trecho ${index + 2}`, index, 'purple')
                ))}

                {formData.inbound && renderFlightSegment(`Trecho ${(formData.additionalSegments?.length || 0) + 2}`, 'inbound', 'green')}

                <button 
                    onClick={addSegment}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Adicionar Trecho Extra
                </button>

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
