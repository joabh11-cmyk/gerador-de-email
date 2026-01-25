import { ExtractedFlightData, FlightSegment } from '../types';

export const generateWhatsAppText = (data: ExtractedFlightData): string => {
    const { passengerNames, outbound, inbound, additionalSegments } = data;

    const formatSegment = (segment: FlightSegment, title: string) => {
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

    message += formatSegment(outbound, 'Trecho 1:');
    message += `\n\n`;

    if (inbound) {
        message += formatSegment(inbound, 'Trecho 2:');
        message += `\n\n`;
    }

    if (additionalSegments) {
        additionalSegments.forEach((s, i) => {
            message += formatSegment(s, `Trecho ${i + 3}:`);
            message += `\n\n`;
        });
    }

    message += `A bagagem que vocês podem levar é:\n`;
    message += `• 1 bolsa ou mochila pequena para levar debaixo do seu assento;\n`;
    message += `• 1 bagagem de mão (10kg).\n\n`;

    message += `Para conferir os detalhes das suas viagens, seu código de reserva é: *${outbound.pnr}*.\n\n`;
    
    message += `Se vocês tiverem alguma dúvida ou precisarem de ajuda, é só nos chamar no WhatsApp 75 9 9202-0012 ou no nosso e-mail suporte@clubedovooviagens.com.br 😉🧡\n\n`;
    
    message += `Desejamos uma excelente viagem!\n`;
    message += `Agradecemos a preferência e a confiança!\n\n`;
    
    message += `Atenciosamente,\n`;
    message += `*Joabh Souza*\n`;
    message += `Consultor de Viagens Clube do Voo Viagens`;

    return message;
};
