export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  membership: string | null;
  sales_experience: string | null;
  source: string | null;
  created_at: string;
  tags: string[];
};

export type Note = {
  id: string;
  contact_id: string;
  body: string;
  created_at: string;
};

export type FormSubmit = {
  id: string;
  contact_id: string | null;
  form_name: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  sales_experience: string | null;
  created_at: string;
};

export type PropertyDef = {
  id: string;
  name: string;
  format: string;
  built_in: boolean;
  created_at: string;
};

export type Tag = { id: string; name: string };

export type Membership = { name: string; count: number };

export type BookingEvent = {
  id: string;
  name: string;
  duration_min: number | null;
  description: string | null;
  created_at: string;
};

export type Operator = {
  id: string;
  name: string;
  email: string | null;
  upcoming: number;
};

export type Service = {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
};

export type Booking = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  event_id: string | null;
  event_name: string | null;
  operator_id: string | null;
  operator_name: string | null;
  contact_id: string | null;
  contact_name: string | null;
};

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  kind: string;
  status: string;
  audience: number;
  opened_rate: number;
  clicked_rate: number;
  bounced_rate: number;
  subject: string | null;
  body: string | null;
  sent_at: string | null;
  created_at: string;
};

export type AutomationStep = {
  id: string;
  kind: 'email' | 'espera' | 'etiqueta' | 'whatsapp';
  detail: string;
};

export type Automation = {
  id: string;
  name: string;
  status: string;
  audience: number;
  opened_rate: number;
  clicked_rate: number;
  goal: string | null;
  steps: AutomationStep[];
  created_at: string;
};

export type Subscriber = {
  id: string;
  name: string;
  email: string;
  status: string;
  open_rate: number;
  click_rate: number;
  created_at: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string | null;
  preview: string | null;
  kind: string;
};

export type SystemEmail = {
  id: string;
  name: string;
  audience: string;
  subject: string;
  body: string;
  enabled: boolean;
};

export type SendingDomain = {
  id: string;
  domain: string;
  email_verified: boolean;
  auth_verified: boolean;
};

export type Brand = {
  company_name: string;
  address: string;
  sender_name: string;
  reply_to: string | null;
};

export type Circle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  members: number;
  created_at: string;
};

export type CircleMember = {
  id: string;
  circle_id: string;
  circle_name: string;
  contact_id: string;
  contact_name: string;
  email: string;
  status: string;
  paid: boolean;
  created_at: string;
};

export type CommunityPost = {
  id: string;
  circle_id: string | null;
  circle_name: string | null;
  author: string;
  kind: string;
  body: string;
  status: string;
  created_at: string;
};

export type SiteBlock = {
  id: string;
  type: 'nav' | 'heading' | 'text' | 'button';
  text: string;
  href?: string;
};

export type Site = {
  id: string;
  name: string;
  kind: string;
  status: string;
  url: string | null;
  blocks: SiteBlock[];
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  price_cents: number;
  status: string;
};

export type Order = {
  id: string;
  product_name: string | null;
  contact_name: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
};

export type Opportunity = {
  id: string;
  contact_id: string;
  contact_name: string;
  title: string;
  stage: string;
  value_cents: number;
  source: string | null;
  created_at: string;
};

export type Thread = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  last_body: string | null;
  last_at: string | null;
  channel: string | null;
};

export type Message = {
  id: string;
  contact_id: string;
  channel: string;
  direction: string;
  body: string;
  created_at: string;
};

export type SidebarCounts = {
  contacts: number;
  last7: number;
  last30: number;
  members: number;
  memberships: Membership[];
  subscribers: number;
  circles: number;
  circleMembers: number;
  posts: number;
};

export const STAGES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'calificado', label: 'Calificado' },
  { id: 'propuesta', label: 'Propuesta' },
  { id: 'ganado', label: 'Ganado' },
  { id: 'perdido', label: 'Perdido' },
] as const;

export type StageId = (typeof STAGES)[number]['id'];
