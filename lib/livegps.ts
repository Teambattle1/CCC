import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────────────
export interface LiveGPSDevice {
  id: number;
  name: string;
  online: 'online' | 'offline' | 'ack';
  alarm: number;
  time: string;
  timestamp: number;
  lat: number;
  lng: number;
  course: string;
  speed: number;
  altitude: number;
  address: string;
  protocol: string;
  power: string;
  icon_color: string;
  stop_duration: string;
  engine_status: boolean | null;
  sensors: LiveGPSSensor[];
  device_data: {
    id: string;
    imei: string;
    name: string;
    plate_number: string;
    device_model: string;
    registration_number: string;
    object_owner: string;
    vin: string;
    group_id: number | null;
    sim_number: string;
    tail_color: string;
  };
}

export interface LiveGPSSensor {
  id: number;
  type: string;
  name: string;
  value: string;
  val: string | null;
  tag_name: string;
  show_in_popup: number;
}

export interface LiveGPSGroup {
  id: number;
  title: string;
  items: LiveGPSDevice[];
}

export interface LiveGPSHistoryResult {
  items: LiveGPSHistoryItem[];
  distance_sum: string;
  top_speed: string;
  move_duration: string;
  stop_duration: string;
}

export interface LiveGPSHistoryItem {
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
  time: string;
  course: number;
  altitude: number;
  distance: string;
}

// ── API Calls via Supabase Edge Function ───────────────────────────

const SUPABASE_URL = 'https://ilbjytyukicbssqftmma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYmp5dHl1a2ljYnNzcWZ0bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzA0NjEsImV4cCI6MjA3MDQwNjQ2MX0.I_PWByMPcOYhWgeq9MxXgOo-NCZYfEuzYmo35XnBFAY';

async function callProxy(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/livegps-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ endpoint, params }),
  });
  if (!res.ok) throw new Error(`LiveGPS proxy error: ${res.status}`);
  return res.json();
}

/**
 * Fetch all devices grouped by category
 */
export async function getAllDevices(): Promise<LiveGPSGroup[]> {
  return callProxy('get_devices');
}

/**
 * Fetch a single device by its LiveGPS ID
 */
export async function getDevice(deviceId: number): Promise<LiveGPSDevice | null> {
  const groups: LiveGPSGroup[] = await callProxy('get_devices', { id: String(deviceId) });
  for (const g of groups) {
    const found = g.items.find(d => d.id === deviceId);
    if (found) return found;
  }
  return null;
}

/**
 * Fetch a device by its IMEI number
 */
export async function getDeviceByImei(imei: string): Promise<LiveGPSDevice | null> {
  const groups: LiveGPSGroup[] = await callProxy('get_devices', { imei });
  for (const g of groups) {
    if (g.items.length > 0) return g.items[0];
  }
  return null;
}

/**
 * Fetch latest device updates (polling-friendly)
 */
export async function getDevicesLatest(sinceTimestamp?: number): Promise<{ items: LiveGPSDevice[]; time: number }> {
  const params: Record<string, string> = {};
  if (sinceTimestamp) params.time = String(sinceTimestamp);
  return callProxy('get_devices_latest', params);
}

/**
 * Fetch movement history for a device
 */
export async function getDeviceHistory(
  deviceId: number,
  fromDate: string,
  fromTime: string,
  toDate: string,
  toTime: string
): Promise<LiveGPSHistoryResult> {
  return callProxy('get_history', {
    device_id: String(deviceId),
    from_date: fromDate,
    from_time: fromTime,
    to_date: toDate,
    to_time: toTime,
  });
}

// ── Device categorisation helpers ──────────────────────────────────

/** Known IMEI → serial number mapping for Skydeanlæg */
export const SKYDEANLÆG_MAP: Record<string, { serial: string; color: string; freq: string }> = {
  '352093082479139': { serial: '3111', color: 'Rød', freq: '2' },
  '352093082479584': { serial: '3127', color: 'Grøn', freq: '3' },
  '359632108723278': { serial: '3130', color: 'Blå', freq: '2' },
  '359632108722700': { serial: '3136', color: 'Pink', freq: '3' },
  '352093082955039': { serial: '3139', color: 'Orange', freq: '1' },
  '359632108716561': { serial: '3184', color: 'Lilla', freq: '1' },
};

export function categoriseDevices(groups: LiveGPSGroup[]) {
  const all: LiveGPSDevice[] = groups.flatMap(g => g.items);
  const skydeanlæg: LiveGPSDevice[] = [];
  const vehicles: LiveGPSDevice[] = [];
  const trailers: LiveGPSDevice[] = [];
  const other: LiveGPSDevice[] = [];

  for (const d of all) {
    const imei = d.device_data?.imei;
    if (imei && SKYDEANLÆG_MAP[imei]) {
      skydeanlæg.push(d);
    } else if (/trailer/i.test(d.name) || /kassetrailer/i.test(d.name)) {
      trailers.push(d);
    } else if (/^[A-Z]{2}\d{5}/.test(d.name) || /caddy|sharan|partner|expert|kia|cargo/i.test(d.name)) {
      vehicles.push(d);
    } else {
      other.push(d);
    }
  }

  return { skydeanlæg, vehicles, trailers, other, all };
}

/** Time-ago helper */
export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'Lige nu';
  if (diff < 3600) return `${Math.floor(diff / 60)} min siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}t siden`;
  return `${Math.floor(diff / 86400)}d siden`;
}
