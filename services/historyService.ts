import { HistoryItem, ExtractedFlightData } from '../types';

const STORAGE_KEY = 'flight_extractor_history';
const MAX_ITEMS = 5;

export const saveToHistory = (data: ExtractedFlightData, html: string) => {
    const history = getHistory();

    const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        data,
        html
    };

    const updatedHistory = [newItem, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
};

export const getHistory = (): HistoryItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};
