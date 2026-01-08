import { ExtractedFlightData, FlightSegment } from '../types';

const generateFlightSectionHtml = (title: string, segment: FlightSegment | null | undefined): string => {
  if (!segment) return '';

  const connectionHtml = segment.connection
    ? `
                <p><strong>Conexão:</strong> Sim</p>
                <p><strong>Tempo estimado de conexão:</strong> ${segment.connection.duration}</p>
                <p><strong>Número do Voo de conexão:</strong> ${segment.connection.flightNumber}</p>`
    : '';

  return `
            <div class="flight-details">
                <h2>${title}</h2>
                <p><strong>Número do Voo:</strong> ${segment.flightNumber}</p>
                <p><strong>Data e hora de Partida:</strong> ${segment.date} ${segment.time}</p>
                <p><strong>Local de Partida:</strong> ${segment.origin}</p>
                <p><strong>Destino:</strong> ${segment.destination}</p>
                <p><strong>Cia Aérea:</strong> ${segment.airline}</p>
                <p><strong>Localizador da Reserva:</strong> ${segment.pnr}</p>${connectionHtml}
            </div>`;
};

export const generateEmailHtml = (data: ExtractedFlightData): string => {
  const outboundHtml = generateFlightSectionHtml('Detalhes do Seu Voo de Ida:', data.outbound);
  const inboundHtml = generateFlightSectionHtml('Detalhes do Seu Voo de Volta:', data.inbound);

  return `<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Reserva de Passagem - Clube do Voo Viagens</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #00569e;
            color: #ffffff;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .header img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
        }

        .header h1 {
            font-size: 20px;
            margin: 0;
            text-align: center;
        }

        .content {
            padding: 20px;
            color: #333333;
        }

        .content h2 {
            color: #3871c1;
            font-size: 20px;
        }

        .content p {
            line-height: 1.6;
        }

        .flight-details {
            background-color: #f9f9f9;
            padding: 10px;
            border: 1px solid #ddd;
            margin: 20px 0;
        }

        .footer {
            background-color: #f4f4f4;
            color: #777777;
            text-align: center;
            padding: 10px 20px;
            font-size: 12px;
        }

        .footer a {
            color: #3871c1;
            text-decoration: none;
        }

        .cta-button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            color: #ffffff;
            background-color: #00569e;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <img src="https://i.ibb.co/4ZRSkhmj/Nova-Logo-3.png" alt="Logo">
            <h1>Confirmação de Reserva de Passagem - Clube do Voo Viagens</h1>
        </div>
        <div class="content">
            <p>${data.greetingTitle} ${data.passengerNames},</p>
            <p>Esperamos que este email ${data.pronoun} encontre bem!</p>
            <p>Estamos entusiasmados em confirmar que sua jornada conosco, no Clube do Voo Viagens, está prestes a começar. Agradecemos por escolher viajar conosco e prometemos fazer de sua experiência algo inesquecível.</p>
            
            ${outboundHtml}

            ${inboundHtml}

            <p>Este localizador é a sua chave para o check-in, que poderá ser realizado online a partir de 48 horas antes da partida do seu voo. Nossa equipe entrará em contato para confirmar o check-in e enviar o cartão de embarque, caso lhe seja conveniente.</p>

            <h2>Preparando-se para o Voo:</h2>
            <p>Recomendamos chegar ao aeroporto com, pelo menos, 2 horas de antecedência. Lembre-se de verificar os requisitos de bagagem e segurança para garantir uma viagem tranquila.</p>

            <h2>Assistência Adicional:</h2>
            <p>Para qualquer necessidade especial, alterações em sua reserva, ou dúvidas, nossa equipe de atendimento ao cliente está pronta para ajudá-la. Entre em contato conosco através do 75 9 9202-0012 ou <a href="mailto:suporte@clubedovooviagens.com.br">suporte@clubedovooviagens.com.br</a>.</p>

            <p>Estamos verdadeiramente animados por fazer parte da sua próxima aventura e estamos empenhados em oferecer-lhe uma experiência agradável e confortável. Esperamos que esta viagem seja apenas o início de muitas outras maravilhosas jornadas conosco.</p>
            <p>Um mundo de novas experiências espera por você. Boa viagem!</p>

            <div class="footer">
                <p>Atenciosamente,</p>
                <p>Joabh Souza,</p>
                <p>Consultor de Viagens Clube do Voo Viagens,</p>
                <p><a href="https://www.clubedovooviagens.com.br">Clube do Voo Viagens</a></p>
                <p>www.clubedovooviagens.com.br</p>
                <p><em>Este é um email automático, por favor não responda diretamente a este email. Para entrar em contato conosco, utilize os canais de atendimento mencionados acima.</em></p>
            </div>
        </div>
    </div>
</body>

</html>`;
};
