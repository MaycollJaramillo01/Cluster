export type CountryCode = 'pa' | 'cl' | 'es' | 'mx';

export type TicketRange = {
  label: string;
  value: string;
};

export type CountryConfig = {
  code: CountryCode;
  name: string;
  demonym: string;
  currency: 'USD' | 'CLP' | 'EUR' | 'MXN';
  currencySymbol: string;
  locale: string;
  ogLocale: string;
  whatsappNumber: string;
  cities: string[];
  ticketRanges: TicketRange[];
  setupFrom: number;
  monthlyFrom?: number;
  legalNote: string;
  privacyLabel: string;
  financingEnabled: boolean;
  demo: {
    adSpend: number;
    consultations: number;
    appointments: number;
    attended: number;
    treatments: number;
    revenue: number;
  };
  path: string;
};

export type CalculatorSnapshot = {
  consultations: number;
  ticket: number;
  bookRate: number;
  showRate: number;
  buyRate: number;
};
