import { ExtractedFlightData, FlightSegment } from '../types';

export const generateWhatsAppText = (data: ExtractedFlightData): string => {
    const { passengerNames, outbound, inbound } = data;

    const formatSegment = (segment: FlightSegment, type: 'IDA' | 'VOLTA') => {
        let text = `*✈️ ${type}: ${segment.origin} ➔ ${segment.destination}*\n`;
        text += `📅 Data: ${segment.date}\n`;
        text += `⏰ Horário: ${segment.time}\n`;
        text += `🔢 Voo: ${segment.airline} ${segment.flightNumber}\n`;
        text += `🎫 Localizador: *${segment.pnr}*`;

        if (segment.connection) {
            text += `\n⏳ Conexão: ${segment.connection.duration} (Voo ${segment.connection.flightNumber})`;
        }
        return text;
    };

    let message = `*Olá, ${passengerNames}! Tudo bem?*\n\n`;
    message += `Seguem os detalhes da sua viagem:\n\n`;

    message += formatSegment(outbound, 'IDA');
    message += `\n\n`;

    if (inbound) {
        message += formatSegment(inbound, 'VOLTA');
        message += `\n\n`;
    }

    message += `Qualquer dúvida, estou à disposição!\n`;
    message += `*Boa viagem!* 🌍✈️`;

    return message;
};
