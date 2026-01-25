import React, { useMemo } from 'react';
import { getHistory } from '../services/historyService';

const DashboardPanel: React.FC = () => {
    const history = getHistory();

    const stats = useMemo(() => {
        const total = history.length;
        const airlineCounts: Record<string, number> = {};
        const destCounts: Record<string, number> = {};

        history.forEach(item => {
            const airline = item.data.outbound.airline || 'Outras';
            airlineCounts[airline] = (airlineCounts[airline] || 0) + 1;

            const dest = item.data.outbound.destination || 'Desconhecido';
            destCounts[dest] = (destCounts[dest] || 0) + 1;
        });

        // Sort to find top items
        const topAirline = Object.entries(airlineCounts).sort((a, b) => b[1] - a[1])[0];
        const topDest = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            topAirline: topAirline ? `${topAirline[0]} (${topAirline[1]})` : '-',
            topDest: topDest ? `${topDest[0]} (${topDest[1]})` : '-'
        };
    }, [history]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-[#00569e] mb-4">Painel de Estatísticas</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total de Emissões</h3>
                    <p className="text-4xl font-extrabold text-[#00569e] mt-2">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Top Cia Aérea</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.topAirline}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Top Destino</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.topDest}</p>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center text-sm text-blue-700 mt-6">
                💡 O histórico é salvo localmente no seu navegador para privacidade.
            </div>
        </div>
    );
};

export default DashboardPanel;
