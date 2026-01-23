import React, { useEffect, useState } from 'react';
import { HistoryItem } from '../types';
import { getHistory, clearHistory } from '../services/historyService';

interface HistoryPanelProps {
    onSelect: (item: HistoryItem) => void;
    refreshTrigger: number; // Prop used to force refresh when new item is added
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelect, refreshTrigger }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, [refreshTrigger]);

    const handleClear = () => {
        clearHistory();
        setHistory([]);
    };

    if (history.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-400 text-sm">Nenhum histórico recente.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-700">Recentes</h3>
                <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                    Limpar
                </button>
            </div>
            <ul className="divide-y divide-gray-100">
                {history.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => onSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-900 text-sm group-hover:text-blue-700 truncate">
                                    {item.data.passengerNames}
                                </span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                                {item.data.outbound.origin} ➔ {item.data.outbound.destination}
                            </p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HistoryPanel;
