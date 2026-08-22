export type CountryCode = 'do' | 'pa' | 'cl' | 'es' | 'mx';

export type TicketRange = {
  label: string;
  value: string;
};

export type CountryConfig = {
  code: CountryCode;
  name: string;
  currency: 'USD' | 'DOP' | 'CLP' | 'EUR' | 'MXN';
  currencySymbol: string;
  locale: string;
  ogLocale: string;
  whatsappNumber: string;
  cities: string[];
  portals: string[];
  ticketRanges: TicketRange[];
  setupFrom: number;
  showInternationalBuyer: boolean;
  legalNote: string;
  privacyLabel: string;
  assignmentExample: {
    lead: string;
    agent: string;
  };
  demo: {
    leads: number;
    contacted: number;
    qualified: number;
    visits: number;
    negotiations: number;
    reservations: number;
    sales: number;
  };
  path: string;
};
