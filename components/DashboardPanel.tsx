import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getHistory } from '../services/historyService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

        return { total, airlineCounts, destCounts };
    }, [history]);

    const pieData = {
        labels: Object.keys(stats.airlineCounts),
        datasets: [
            {
                label: '# de Emissões',
                data: Object.values(stats.airlineCounts),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barData = {
        labels: Object.keys(stats.destCounts).slice(0, 10), // Top 10
        datasets: [
            {
                label: 'Destinos Mais Populares',
                data: Object.values(stats.destCounts).slice(0, 10),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }
        ]
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total de Emissões</h3>
                    <p className="text-4xl font-bold text-[#00569e] mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                    <h3 className="text-gray-500 text-sm font-medium uppercase mb-4">Cias Aéreas</h3>
                    <div className="h-48 flex justify-center">
                        {stats.total > 0 ? <Pie data={pieData} /> : <p className="text-gray-400 self-center">Sem dados ainda</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-medium uppercase mb-4">Top Destinos</h3>
                {stats.total > 0 ? <Bar data={barData} /> : <p className="text-gray-400">Sem dados ainda</p>}
            </div>

            <div className="text-center text-xs text-gray-400">
                Dados armazenados localmente no seu navegador.
            </div>
        </div>
    );
};

export default DashboardPanel;
