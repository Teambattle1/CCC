import { supabase } from './supabase';

// Public URL of the zapier-jobs Edge Function. Zapier POSTs booking inquiries
// here (with the x-zapier-secret header); each becomes an EventDay lead.
const SUPABASE_URL = 'https://ilbjytyukicbssqftmma.supabase.co';
export const ZAPIER_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/zapier-jobs`;

export type ZapierLogStatus = 'inserted' | 'updated' | 'failed' | 'rejected';

export interface ZapierWebhookLog {
  id: string;
  source: string;
  event_type: string | null;
  status: ZapierLogStatus;
  ef_offer_id: string | null;
  task_job_id: string | null;
  opgave_id: number | null;
  payload: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
}

/**
 * Field-mapping reference shown in the admin panel. Documents which Zapier
 * keys the zapier-jobs Edge Function reads when creating an EventDay lead
 * (ef_offers with status 'lead' + ef_clients/ef_contacts + ef_leads).
 */
export interface ZapierFieldMap {
  field: string;
  aliases: string[];
  type: string;
  description: string;
}

export const ZAPIER_FIELD_MAP: ZapierFieldMap[] = [
  { field: 'company', aliases: ['client', 'customer', 'client_name'], type: 'tekst', description: 'Firmanavn → ef_clients.firma (type=virksomhed). Tomt = privat.' },
  { field: 'contact_name', aliases: ['name'], type: 'tekst', description: 'Kontaktperson → ef_contacts.name' },
  { field: 'email', aliases: ['contact_email'], type: 'tekst', description: 'Email → klient + kontakt' },
  { field: 'phone', aliases: ['contact_phone'], type: 'tekst', description: 'Telefon → klient + kontakt' },
  { field: 'event_start', aliases: ['event_date', 'date', 'start'], type: 'dato/tid', description: 'Dato (dansk dd/mm/åååå eller ISO) → ef_offers.event_date + event_start_time' },
  { field: 'guests', aliases: ['participants'], type: 'tal', description: 'Antal → ef_offers.participants_count' },
  { field: 'venue', aliases: ['city'], type: 'tekst', description: 'Lokation/by → ef_offers.event_location' },
  { field: 'activities', aliases: ['activity'], type: 'tekst', description: 'Aktivitet → indgår i ef_offers.title' },
  { field: 'notes', aliases: ['note', 'comment'], type: 'tekst', description: 'Kundens besked → ef_offers.internal_note' },
  { field: 'source', aliases: ['lead_source'], type: 'tekst', description: 'Lead-kilde (fx evento.dk) → auto-oprettes i ef_leads, sættes som lead_source/bureau_name' },
  { field: 'referer', aliases: [], type: 'tekst', description: 'Henvisnings-URL → website på en ny lead-kilde' },
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
