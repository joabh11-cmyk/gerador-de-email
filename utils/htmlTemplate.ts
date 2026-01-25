import { ExtractedFlightData, FlightSegment } from '../types';
import { getActiveAgent } from '../services/configService';

export type TemplateStyle = 'classic' | 'minimal' | 'urgent' | 'reminder';

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
    // Base styles
    const base = `
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .content { padding: 20px; color: #333333; }
        .footer { background-color: #f4f4f4; color: #777777; text-align: center; padding: 10px 20px; font-size: 12px; }
        .footer a { color: #3871c1; text-decoration: none; }
        p { line-height: 1.6; }
        @media print {
            body { background: white; }
            .email-container { box-shadow: none; max-width: 100%; }
        }
  `;

    if (style === 'minimal') {
        return `
      ${base}
      .header { background-color: #00569e; background: linear-gradient(135deg, #00569e 0%, #00447c 100%); color: #ffffff; padding: 30px; text-align: center; }
      .header img { width: 60px; height: 60px; border-radius: 50%; margin-right: 15px; vertical-align: middle; border: 2px solid rgba(255,255,255,0.2); }
      .flight-details { background-color: #f8fbff; border: 1px solid #e1effe; color: #1e3a8a; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .flight-details h2 { color: #00569e; margin-top: 0; font-size: 18px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px; margin-bottom: 15px; }
      .btn { display: inline-block; padding: 12px 28px; background: #00569e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 86, 158, 0.2); transition: transform 0.2s; }
  `;
    } else if (style === 'urgent') {
        return `
      ${base}
      .header { background-color: #d32f2f; color: #ffffff; padding: 20px; text-align: center; }
      .header h1 { font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
      .flight-details { background-color: #fff5f5; border-left: 5px solid #d32f2f; color: #b71c1c; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .flight-details h2 { color: #c62828; margin-top: 0; font-size: 18px; border-bottom: 1px solid #ef9a9a; padding-bottom: 10px; margin-bottom: 15px; }
  `;
    } else if (style === 'reminder') {
        return `
      ${base}
      .header { background-color: #00569e; color: #ffffff; padding: 20px; text-align: center; }
      .header img { width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; }
      .flight-details { background-color: #ffffff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .flight-details h3 { color: #00569e; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .info-box { background-color: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px; margin: 20px 0; }
  `;
    } else {
        // CLASSIC (Exact Original)
        return `
      ${base}
      .header { background-color: #00569e; color: #ffffff; padding: 20px; display: flex; align-items: center; justify-content: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .header img { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; }
      .header h1 { font-size: 20px; margin: 0; text-align: center; }
      .content h2 { color: #3871c1; font-size: 20px; }
      .flight-details { background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; margin: 20px 0; }
      .cta-button { display: inline-block; padding: 10px 20px; margin: 20px 0; color: #ffffff; background-color: #00569e; text-decoration: none; border-radius: 4px; text-align: center; }
  `;
    }
};

export const generateEmailHtml = (data: ExtractedFlightData, style: TemplateStyle = 'classic'): string => {
    const css = getCss(style);
    const agent = getActiveAgent();

    // Footer Signature
    const footerSignature = `
              <p style="margin-top: 30px;">Atenciosamente,</p>
              <p><strong>${agent.name}</strong>,<br>
              ${agent.role},<br>
              ${agent.phone}</p>
              <p><a href="https://www.clubedovooviagens.com.br">Clube do Voo Viagens</a><br>
              www.clubedovooviagens.com.br</p>
              <p><em>Este é um email automático, por favor não responda diretamente a este email. Para entrar em contato conosco, utilize os canais de atendimento mencionados acima.</em></p>
    `;

    // Helper for flight segments to match the EXACT HTML structure requested for Classic
    const renderSegmentClassic = (title: string, segment: FlightSegment | null | undefined) => {
        if (!segment) return '';
        const conn = segment.connection ? `
              <p><strong>Conexão:</strong> Sim</p>
              <p><strong>Tempo estimado de conexão:</strong> ${segment.connection.duration}</p>
              <p><strong>Número do Voo de conexão:</strong> ${segment.connection.flightNumber}</p>` : '';

        return `
          <div class="flight-details">
              <h2>${title}</h2>
              <p><strong>Número do Voo:</strong> ${segment.flightNumber}</p>
              <p><strong>Data e hora de Partida:</strong> ${segment.date} ${segment.time}</p>
              <p><strong>Local de Partida:</strong> ${segment.origin}</p>
              <p><strong>Destino:</strong> ${segment.destination}</p>
              <p><strong>Cia Aérea:</strong> ${segment.airline}</p>
              <p><strong>Localizador da Reserva:</strong> ${segment.pnr}</p>${conn}
          </div>`;
    };

    let bodyContent = '';

    if (style === 'reminder') {
        const formatDateLong = (dateStr: string) => {
            try {
                const [day, month, year] = dateStr.split('/');
                const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
            } catch (e) { return dateStr; }
        };

        const renderReminderSegment = (title: string, segment: FlightSegment | null | undefined) => {
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

        let segmentsHtml = renderReminderSegment('Trecho 1:', data.outbound);
        if (data.inbound) segmentsHtml += renderReminderSegment('Trecho 2:', data.inbound);
        if (data.additionalSegments) {
            data.additionalSegments.forEach((s, i) => {
                segmentsHtml += renderReminderSegment(`Trecho ${i + 3}:`, s);
            });
        }

        bodyContent = `
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo">
                <h1>Lembrete de Viagem - Clube do Voo</h1>
            </div>
            <div class="content">
                <p>📩 <strong>E-MAIL</strong></p>
                <p>Olá, <strong>${data.passengerNames}</strong></p>
                <p>Sua viagem está bem próxima!</p>
                <p>Lembrete para as suas viagens:</p>
                
                ${segmentsHtml}

                <div class="info-box">
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
                    <p>🌍 <a href="https://www.clubedovooviagens.com.br">Clube do Voo Viagens</a><br>
                    www.clubedovooviagens.com.br</p>
                    <p style="font-size: 10px; color: #999;">⚠️ Este é um e-mail automático, por favor, não responda diretamente a este e-mail. Para entrar em contato conosco, utilize os canais de atendimento mencionados acima.</p>
                </div>
            </div>
        </div>`;
    } else if (style === 'classic') {
        bodyContent = `
    <div class="email-container">
      <div class="header">
          <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo">
          <h1>Confirmação de Reserva de Passagem - Clube do Voo Viagens</h1>
      </div>
      <div class="content">
          <p>${data.greetingTitle} ${data.passengerNames},</p>
          <p>Esperamos que este email ${data.pronoun} encontre bem!</p>
          <p>Estamos entusiasmados em confirmar que sua jornada conosco, no Clube do Voo Viagens, está prestes a começar. Agradecemos por escolher viajar conosco e prometemos fazer de sua experiência algo inesquecível.</p>
          
          ${renderSegmentClassic('Detalhes do Seu Voo de Ida:', data.outbound)}
          ${renderSegmentClassic('Detalhes do Seu Voo de Volta:', data.inbound)}

          <p>Este localizador é a sua chave para o check-in, que poderá ser realizado online a partir de 48 horas antes da partida do seu voo. Nossa equipe entrará em contato para confirmar o check-in e enviar o cartão de embarque, caso lhe seja conveniente.</p>

          <h2>Preparando-se para o Voo:</h2>
          <p>Recomendamos chegar ao aeroporto com, pelo menos, 2 horas de antecedência. Lembre-se de verificar os requisitos de bagagem e segurança para garantir uma viagem tranquila.</p>

          <h2>Assistência Adicional:</h2>
          <p>Para qualquer necessidade especial, alterações em sua reserva, ou dúvidas, nossa equipe de atendimento ao cliente está pronta para ajudá-la. Entre em contato conosco através do 75 9 9202-0012 ou <a href="mailto:suporte@clubedovooviagens.com.br">suporte@clubedovooviagens.com.br</a>.</p>

          <p>Estamos verdadeiramente animados por fazer parte da sua próxima aventura e estamos empenhados em oferecer-lhe uma experiência agradável e confortável. Esperamos que esta viagem seja apenas o início de muitas outras maravilhosas jornadas conosco.</p>
          <p>Um mundo de novas experiências espera por você. Boa viagem!</p>

          <div class="footer">
              ${footerSignature}
          </div>
      </div>
  </div>`;

    } else {
        // Modern/Urgent Logic
        const outboundHtml = generateFlightSectionHtml('✈️ Voo de Ida', data.outbound, style);
        const inboundHtml = generateFlightSectionHtml('✈️ Voo de Volta', data.inbound, style);

        let header = '';
        if (style === 'minimal') {
            header = `
          <div style="display: flex; align-items: center; justify-content: center;">
              <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo">
              <div style="text-align: left;">
                  <h1 style="font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">Clube do Voo</h1>
                  <p style="margin: 0; opacity: 0.8; font-size: 12px; font-weight: normal;">Consultoria de Viagens</p>
              </div>
          </div>`;
        } else {
            header = `<h1>⚠️ Detalhes Importantes da Viagem</h1>`;
        }

        bodyContent = `
      <div class="email-container">
          <div class="header">
              ${header}
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
      </div>`;
    }

    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Reserva de Passagem - Clube do Voo Viagens</title>
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
};
