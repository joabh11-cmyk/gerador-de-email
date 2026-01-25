export interface ConnectionDetails {
  duration: string;
  flightNumber: string;
}

export interface FlightSegment {
  flightNumber: string;
  date: string; // Format: dd/mm/aaaa
  time: string; // Format: hh:mm
  origin: string;
  destination: string;
  airline: string;
  pnr: string; // Localizador
  seat?: string; // Assento selecionado
  boardingTime?: string; // Horário de embarque
  connection?: ConnectionDetails | null;
}

export interface ExtractedFlightData {
  passengerNames: string;
  greetingTitle: string; // Prezado, Prezada, Prezados, Prezadas
  pronoun: string; // o, a, os, as (for "o encontre bem")
  outbound: FlightSegment;
  inbound?: FlightSegment | null;
  additionalSegments?: FlightSegment[]; // Para Trecho 3, 4, etc.
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: ExtractedFlightData;
  html: string;
  agentName?: string; // Who generated this?
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string; // e.g. "Consultor de Viagens"
  phone: string; // e.g. "(75) 99202-0012"
  email: string;
  isActive: boolean;
}

export interface AppConfig {
  geminiKey: string;
  openaiKey: string;
  provider: 'gemini' | 'openai';
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
}
