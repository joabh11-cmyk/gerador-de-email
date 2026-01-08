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
  connection?: ConnectionDetails | null;
}

export interface ExtractedFlightData {
  passengerNames: string;
  greetingTitle: string; // Prezado, Prezada, Prezados, Prezadas
  pronoun: string; // o, a, os, as (for "o encontre bem")
  outbound: FlightSegment;
  inbound?: FlightSegment | null;
}
