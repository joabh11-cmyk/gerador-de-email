import { ExtractedFlightData, FlightSegment } from '../types';

export const generateWhatsAppText = (data: ExtractedFlightData, isReminder: boolean = false): string => {
    const { passengerNames, outbound, inbound, additionalSegments } = data;

    if (isReminder) {
        const formatSegmentReminder = (segment: FlightSegment, title: string) => {
            let text = `*${title}*\n`;
            text += `🗓️ Data do Voo: ${segment.date}\n`;
            text += `✈️ Número do voo: ${segment.flightNumber}\n`;
            text += `⏰ Horário do Voo: ${segment.time}\n`;
            text += `⚠️ Embarque inicia: ${segment.boardingTime || '--:--'}\n`;
            text += `💺 Assento escolhido: ${segment.seat || 'Não selecionado'}\n`;
            text += `🪪 Leve documento de identificação com foto.\n`;
            text += `🚨 Chegue com antecedência mínima de 2h antes do início do embarque.`;
            return text;
        };

        let message = `📩 *E-MAIL*\n`;
        message += `Olá, *${passengerNames}*\n`;
        message += `Sua viagem está bem próxima!\n`;
        message += `Lembrete para as suas viagens:\n\n`;

        message += formatSegmentReminder(outbound, 'Trecho 1:');
        message += `\n\n`;

        if (inbound) {
            message += formatSegmentReminder(inbound, 'Trecho 2:');
            message += `\n\n`;
        }

        if (additionalSegments) {
            additionalSegments.forEach((s, i) => {
                message += formatSegmentReminder(s, `Trecho ${i + 3}:`);
                message += `\n\n`;
            });
        }

        message += `A bagagem que vocês podem levar é:\n`;
        message += `• 1 bolsa ou mochila pequena para levar debaixo do seu assento;\n`;
        message += `• 1 bagagem de mão (10kg).\n\n`;

        message += `Para conferir os detalhes das suas viagens, seu código de reserva é: *${outbound.pnr}*.\n\n`;
        message += `Se vocês tiverem alguma dúvida ou precisarem de ajuda, é só nos chamar no WhatsApp 75 9 9202-0012 ou no nosso e-mail suporte@clubedovooviagens.com.br 😉🧡\n\n`;
        message += `Desejamos uma excelente viagem!\n`;
        message += `Atenciosamente,\n*Joabh Souza*`;

        return message;
    } else {
        // Standard Confirmation Format
        const formatSegmentConf = (segment: FlightSegment, type: 'IDA' | 'VOLTA') => {
            let text = `*✈️ ${type}: ${segment.origin} ➔ ${segment.destination}*\n`;
            text += `📅 Data: ${segment.date}\n`;
            text += `⏰ Horário: ${segment.time}\n`;
            text += `🔢 Voo: ${segment.airline} ${segment.flightNumber}\n`;
            text += `🎫 Localizador: *${segment.pnr}*`;
            return text;
        };

        let message = `*Olá, ${passengerNames}! Tudo bem?*\n\n`;
        message += `Seguem os detalhes da sua reserva confirmada:\n\n`;
        message += formatSegmentConf(outbound, 'IDA');
        message += `\n\n`;
        if (inbound) {
            message += formatSegmentConf(inbound, 'VOLTA');
            message += `\n\n`;
        }
        message += `*Boa viagem!* 🌍✈️`;
        return message;
    }
};
