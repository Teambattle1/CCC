import { supabase } from './supabase';

// Public URL of the zapier-jobs Edge Function. This is the endpoint Zapier
// POSTs job/booking data to (with the x-zapier-secret header).
const SUPABASE_URL = 'https://ilbjytyukicbssqftmma.supabase.co';
export const ZAPIER_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/zapier-jobs`;

export type ZapierLogStatus = 'inserted' | 'updated' | 'failed' | 'rejected';

export interface ZapierWebhookLog {
  id: string;
  source: string;
  event_type: string | null;
  status: ZapierLogStatus;
  task_job_id: string | null;
  opgave_id: number | null;
  payload: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
}

/**
 * Field-mapping reference shown in the admin panel. Documents which Zapier
 * keys map to which task_jobs columns (mirrors ALLOWED/ALIASES in the
 * zapier-jobs Edge Function).
 */
export interface ZapierFieldMap {
  field: string;
  aliases: string[];
  type: string;
  description: string;
}

export const ZAPIER_FIELD_MAP: ZapierFieldMap[] = [
  { field: 'opgave_id', aliases: ['external_id', 'booking_id', 'job_id'], type: 'tal', description: 'Eksternt booking-ID. Bruges til at matche/opdatere eksisterende jobs.' },
  { field: 'client_name', aliases: ['company', 'client', 'customer'], type: 'tekst', description: 'Kundens/firmaets navn' },
  { field: 'client_contact_name', aliases: ['contact_name'], type: 'tekst', description: 'Kontaktperson' },
  { field: 'client_contact_phone', aliases: ['contact_phone', 'phone'], type: 'tekst', description: 'Telefon' },
  { field: 'client_contact_email', aliases: ['contact_email', 'email'], type: 'tekst', description: 'Email' },
  { field: 'agency', aliases: [], type: 'tekst', description: 'Bureau' },
  { field: 'event_date', aliases: ['event_start', 'start', 'date'], type: 'dato/tid', description: 'Event start (ISO-8601 anbefales)' },
  { field: 'event_end', aliases: ['end'], type: 'dato/tid', description: 'Event slut' },
  { field: 'event_time', aliases: [], type: 'tekst', description: 'Tidspunkt som fritekst' },
  { field: 'duration_minutes', aliases: [], type: 'tal', description: 'Varighed i minutter' },
  { field: 'guests_count', aliases: ['guests', 'participants'], type: 'tal', description: 'Antal gæster' },
  { field: 'instructors_count', aliases: [], type: 'tal', description: 'Antal instruktører' },
  { field: 'assistants_count', aliases: [], type: 'tal', description: 'Antal assistenter' },
  { field: 'activities', aliases: [], type: 'liste', description: 'Aktiviteter (array eller komma-separeret)' },
  { field: 'location_name', aliases: ['venue'], type: 'tekst', description: 'Lokationsnavn' },
  { field: 'location_address', aliases: ['address'], type: 'tekst', description: 'Adresse' },
  { field: 'location_city', aliases: ['city'], type: 'tekst', description: 'By' },
  { field: 'notes', aliases: [], type: 'tekst', description: 'Noter' },
  { field: 'privat', aliases: [], type: 'ja/nej', description: 'Privat booking' },
  { field: 'kun_tilbud', aliases: [], type: 'ja/nej', description: 'Kun et tilbud (ikke bekræftet)' },
  { field: 'payment_method', aliases: [], type: 'tekst', description: 'Betalingsmetode' },
  { field: 'payment_amount', aliases: [], type: 'beløb', description: 'Beløb' },
  { field: 'short_code', aliases: [], type: 'tekst', description: 'Session-kode (alternativ match-nøgle)' },
  { field: 'source', aliases: ['lead_source'], type: 'tekst', description: 'Lead-kilde (fx evento.dk) — auto-oprettes i ef_leads og gemmes på jobbet som lead_source.' },
];

/** Fetch recent webhook deliveries for the admin panel. */
export async function fetchZapierLog(limit = 50): Promise<ZapierWebhookLog[]> {
  const { data, error } = await supabase
    .from('zapier_webhook_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Error fetching zapier log:', error);
    return [];
  }
  return (data as ZapierWebhookLog[]) || [];
}
