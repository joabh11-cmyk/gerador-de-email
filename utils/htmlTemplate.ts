import { ExtractedFlightData, FlightSegment } from '../types';

export type TemplateStyle = 'classic' | 'minimal' | 'urgent';

const generateFlightSectionHtml = (title: string, segment: FlightSegment | null | undefined, style: TemplateStyle): string => {
    if (!segment) return '';

    const connectionHtml = segment.connection
        ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                    <p style="margin: 5px 0;"><strong>⌛ Conexão:</strong> ${segment.connection.duration}</p>
                    <p style="margin: 5px 0;"><strong>✈️ Voo:</strong> ${segment.connection.flightNumber}</p>
                </div>`
        : '';

    return `
            <div class="flight-details ${style}">
                <h2>${title}</h2>
                <div class="grid-details">
                    <p><strong>🔢 Voo:</strong> ${segment.flightNumber}</p>
                    <p><strong>📅 Partida:</strong> ${segment.date} às ${segment.time}</p>
                    <p><strong>🛫 De:</strong> ${segment.origin}</p>
                    <p><strong>🛬 Para:</strong> ${segment.destination}</p>
                    <p><strong>🏢 Cia:</strong> ${segment.airline}</p>
                    <p><strong>🎫 Localizador:</strong> ${segment.pnr}</p>
                </div>
                ${connectionHtml}
            </div>`;
};

const getCss = (style: TemplateStyle) => {
    const base = `
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
        .email-container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .content { padding: 30px; }
        .footer { background-color: #f9f9f9; text-align: center; padding: 20px; font-size: 12px; color: #888; }
        .footer a { text-decoration: none; font-weight: bold; }
        h1 { margin: 0; font-size: 22px; }
        p { line-height: 1.6; margin-bottom: 15px; }
        .flight-details { margin: 25px 0; padding: 20px; border-radius: 8px; }
        .flight-details h2 { margin-top: 0; font-size: 18px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px; margin-bottom: 15px; }
        .grid-details p { margin-bottom: 8px; font-size: 14px; }
  `;

    if (style === 'minimal') {
        // "New Classic" (Minimalist name, Modern Blue look)
        return `
        ${base}
        .header { background-color: #00569e; background: linear-gradient(135deg, #00569e 0%, #00447c 100%); color: #ffffff; padding: 30px; text-align: center; }
        .header img { width: 60px; height: 60px; border-radius: 50%; margin-right: 15px; vertical-align: middle; border: 2px solid rgba(255,255,255,0.2); }
        .flight-details { background-color: #f8fbff; border: 1px solid #e1effe; color: #1e3a8a; }
        .flight-details h2 { color: #00569e; border-bottom-color: #e1effe; }
        .footer a { color: #00569e; }
        .btn { display: inline-block; padding: 12px 28px; background: #00569e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 86, 158, 0.2); transition: transform 0.2s; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 8px rgba(0, 86, 158, 0.3); }
    `;
    } else if (style === 'urgent') {
        return `
        ${base}
        .header { background-color: #d32f2f; color: #ffffff; padding: 20px; text-align: center; }
        .header h1 { font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .flight-details { background-color: #fff5f5; border-left: 5px solid #d32f2f; color: #b71c1c; }
        .flight-details h2 { color: #c62828; border-bottom-color: #ef9a9a; }
        .footer a { color: #d32f2f; }
        .btn { display: inline-block; padding: 12px 24px; background: #d32f2f; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; box-shadow: 0 2px 4px rgba(211, 47, 47, 0.3); }
    `;
    } else {
        // "Original" (Classic Name, Original Blue Look)
        return `
        ${base}
        .header { background-color: #00569e; color: #ffffff; padding: 25px; text-align: center; }
        .header img { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; vertical-align: middle; }
        .flight-details { background-color: #f0f7ff; border: 1px solid #cce4ff; color: #004085; }
        .flight-details h2 { color: #00569e; border-bottom-color: #cce4ff; }
        .footer a { color: #00569e; }
        .btn { display: inline-block; padding: 12px 24px; background: #00569e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; }
    `;
    }
};

export const generateEmailHtml = (data: ExtractedFlightData, style: TemplateStyle = 'classic'): string => {
    const outboundHtml = generateFlightSectionHtml('✈️ Voo de Ida', data.outbound, style);
    const inboundHtml = generateFlightSectionHtml('✈️ Voo de Volta', data.inbound, style);
    const css = getCss(style);

    // Use uploaded image URL or placeholder
    const logoUrl = "https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png";

    let headerContent = '';

    // Header Logic
    if (style === 'urgent') {
        headerContent = `<h1>⚠️ Detalhes Importantes da Viagem</h1>`;
    } else if (style === 'minimal') {
        // New Classic (Minimal) -> Icon + Title + Subtitle
        headerContent = `
        <div style="display: flex; align-items: center; justify-content: center;">
            <img src="${logoUrl}" alt="Logo">
            <div style="text-align: left;">
                <h1 style="font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Clube do Voo</h1>
                <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: normal;">Consultoria de Viagens</p>
            </div>
        </div>`;
    } else {
        // Classic (Original) -> Icon + Title
        headerContent = `
             <img src="${logoUrl}" alt="Logo" style="vertical-align: middle;">
             <span style="vertical-align: middle; font-weight: bold; font-size: 20px;">Clube do Voo Viagens</span>
        `;
    }

    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Viagem - Clube do Voo</title>
    <style>${css}</style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            ${headerContent}
        </div>
        <div class="content">
            <p style="font-size: 18px; color: ${style === 'urgent' ? '#d32f2f' : '#333'};"><strong>${data.greetingTitle} ${data.passengerNames},</strong></p>
            <p>Esperamos que este email ${data.pronoun} encontre bem!</p>
            <p>Confira abaixo todos os detalhes confirmados da sua próxima jornada.</p>
            
            ${outboundHtml}
            ${inboundHtml}

            <div style="background: ${style === 'urgent' ? '#ffebee' : '#f9f9f9'}; padding: 20px; border-radius: 8px; font-size: 14px; margin-top: 30px; border-left: 4px solid ${style === 'urgent' ? '#d32f2f' : '#ccc'};">
               <h3 style="margin-top: 0; font-size: 16px;">ℹ️ Informações Importantes</h3>
               <p style="margin-bottom: 5px;">• <strong>Check-in:</strong> Disponível online 48h antes do voo.</p>
               <p style="margin-bottom: 0;">• <strong>Aeroporto:</strong> Chegue com 2 horas de antecedência.</p>
            </div>

            <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
               <a href="mailto:suporte@clubedovooviagens.com.br" class="btn">Fale com o Suporte</a>
            </div>

            <div class="footer">
                <p><strong>Clube do Voo Viagens</strong><br>(75) 99202-0012</p>
                <p><a href="https://www.clubedovooviagens.com.br">www.clubedovooviagens.com.br</a></p>
            </div>
        </div>
    </div>
</body>
</html>`;
};
