import { ExtractedFlightData, FlightSegment } from '../types';
import { getActiveAgent } from '../services/configService';

export type TemplateStyle = 'classic' | 'minimal' | 'urgent';

const formatDateLong = (dateStr: string) => {
    try {
        const [day, month, year] = dateStr.split('/');
        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
    } catch (e) { return dateStr; }
};

const getCss = (style: TemplateStyle) => {
    const base = `
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .content { padding: 20px; color: #333333; }
        .footer { background-color: #f4f4f4; color: #777777; text-align: center; padding: 10px 20px; font-size: 12px; }
        .footer a { color: #3871c1; text-decoration: none; }
        p { line-height: 1.6; }
        .flight-details { background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin: 15px 0; border-radius: 4px; }
        .flight-details h2, .flight-details h3 { color: #00569e; margin-top: 0; font-size: 18px; }
    `;

    if (style === 'minimal') {
        return `
            ${base}
            .header { background: linear-gradient(135deg, #00569e 0%, #00447c 100%); color: #ffffff; padding: 30px; text-align: center; }
            .flight-details { background-color: #f8fbff; border: 1px solid #e1effe; color: #1e3a8a; }
            .btn { display: inline-block; padding: 12px 28px; background: #00569e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; }
        `;
    } else if (style === 'urgent') {
        return `
            ${base}
            .header { background-color: #d32f2f; color: #ffffff; padding: 20px; text-align: center; }
            .flight-details { background-color: #fff5f5; border-left: 5px solid #d32f2f; color: #b71c1c; }
        `;
    } else {
        return `
            ${base}
            .header { background-color: #00569e; color: #ffffff; padding: 20px; text-align: center; }
            .header img { width: 50px; height: 50px; border-radius: 50%; }
        `;
    }
};

// --- RENDERERS FOR CONFIRMATION (GERADOR) ---

const renderSegmentConfirmation = (title: string, segment: FlightSegment | null | undefined) => {
    if (!segment) return '';
    const conn = segment.connection ? `
        <p><strong>Conexão:</strong> Sim</p>
        <p><strong>Tempo estimado de conexão:</strong> ${segment.connection.duration}</p>
        <p><strong>Número do Voo de conexão:</strong> ${segment.connection.flightNumber}</p>` : '';

    return `
        <div class="flight-details">
            <h3>${title}</h3>
            <p><strong>Número do Voo:</strong> ${segment.flightNumber}</p>
            <p><strong>Data e hora de Partida:</strong> ${segment.date} ${segment.time}</p>
            <p><strong>Local de Partida:</strong> ${segment.origin}</p>
            <p><strong>Destino:</strong> ${segment.destination}</p>
            <p><strong>Cia Aérea:</strong> ${segment.airline}</p>
            <p><strong>Localizador da Reserva:</strong> ${segment.pnr}</p>${conn}
        </div>`;
};

// --- RENDERERS FOR REMINDER (LEMBRETE) ---

const renderSegmentReminder = (title: string, segment: FlightSegment | null | undefined) => {
    if (!segment) return '';
    return `
    <div class="flight-details">
        <h3>${title}</h3>
        <p>🗓️ <strong>Data do Voo:</strong> ${formatDateLong(segment.date)}</p>
        <p>✈️ <strong>Número do voo:</strong> ${segment.flightNumber}</p>
        <p>⏰ <strong>Horário do Voo:</strong> ${segment.time}</p>
        <p>⚠️ <strong>Embarque inicia:</strong> ${segment.boardingTime || '--:--'}</p>
        <p>💺 <strong>Assento escolhido:</strong> ${segment.seat || 'Não selecionado'}</p>
        <p>🪪 Leve documento de identificação com foto.</p>
        <p>🚨 Chegue com antecedência mínima de 2h antes do início do embarque.</p>
    </div>`;
};

export const generateEmailHtml = (data: ExtractedFlightData, style: TemplateStyle = 'classic', isReminder: boolean = false): string => {
    const css = getCss(style);
    const agent = getActiveAgent();
    
    let bodyContent = '';

    if (isReminder) {
        // --- REMINDER TEMPLATE ---
        let segmentsHtml = renderSegmentReminder('Trecho 1:', data.outbound);
        if (data.inbound) segmentsHtml += renderSegmentReminder('Trecho 2:', data.inbound);
        if (data.additionalSegments) {
            data.additionalSegments.forEach((s, i) => {
                segmentsHtml += renderSegmentReminder(`Trecho ${i + 3}:`, s);
            });
        }

        bodyContent = `
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo" style="width:60px; border-radius:50%;">
                <h1>Lembrete de Viagem - Clube do Voo</h1>
            </div>
            <div class="content">
                <p>Olá, <strong>${data.passengerNames}</strong></p>
                <p>Sua viagem está bem próxima!</p>
                <p>Lembrete para as suas viagens:</p>
                
                ${segmentsHtml}

                <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>A bagagem que vocês podem levar é:</strong></p>
                    <p>• 1 bolsa ou mochila pequena para levar debaixo do seu assento;</p>
                    <p>• 1 bagagem de mão (10kg).</p>
                </div>

                <p>Para conferir os detalhes das suas viagens, seu código de reserva é: <strong>${data.outbound.pnr}</strong>.</p>
                
                <p>Se vocês tiverem alguma dúvida ou precisarem de ajuda, é só nos chamar no WhatsApp <strong>75 9 9202-0012</strong> ou no nosso e-mail <strong>suporte@clubedovooviagens.com.br</strong> 😉🧡</p>
                
                <p>Desejamos uma excelente viagem!<br>
                Agradecemos a preferência e a confiança!</p>

                <div class="footer">
                    <p>Atenciosamente,<br>
                    <strong>Joabh Souza</strong><br>
                    Consultor de Viagens Clube do Voo Viagens</p>
                    <p>🌍 <a href="https://www.clubedovooviagens.com.br">www.clubedovooviagens.com.br</a></p>
                </div>
            </div>
        </div>`;
    } else {
        // --- CONFIRMATION TEMPLATE ---
        bodyContent = `
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo">
                <h1>Confirmação de Reserva - Clube do Voo</h1>
            </div>
            <div class="content">
                <p>${data.greetingTitle} ${data.passengerNames},</p>
                <p>Esperamos que este email ${data.pronoun} encontre bem!</p>
                <p>Estamos entusiasmados em confirmar sua jornada conosco.</p>
                
                ${renderSegmentConfirmation('Detalhes do Seu Voo de Ida:', data.outbound)}
                ${renderSegmentConfirmation('Detalhes do Seu Voo de Volta:', data.inbound)}

                <p>Este localizador é a sua chave para o check-in, que poderá ser realizado online a partir de 48 horas antes da partida.</p>

                <div class="footer">
                    <p>Atenciosamente,<br>
                    <strong>${agent.name}</strong><br>
                    ${agent.role}<br>
                    ${agent.phone}</p>
                    <p><a href="https://www.clubedovooviagens.com.br">www.clubedovooviagens.com.br</a></p>
                </div>
            </div>
        </div>`;
    }

    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};
