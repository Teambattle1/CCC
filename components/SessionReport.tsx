import React, { useEffect, useState } from 'react';
import {
  Printer,
  MapPin,
  Users,
  Clock,
  Calendar,
  Truck,
  Package,
  FileText,
  ChevronRight,
  Loader2,
  Phone,
  Fuel,
  BatteryCharging,
  User,
  Building2,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  Navigation,
  Warehouse,
  Star,
} from 'lucide-react';
import { TaskJob, ResolvedActivity, fetchJobCrew, CrewAssignment, fetchJobPackingItems, JobPackingItem, fetchJobVehicles, VehicleAssignment, ActivityInfo, fetchActivityInfo } from '../lib/supabase';

interface SessionReportProps {
  job: TaskJob;
  activities: ResolvedActivity[];
  onNavigateActivity?: (viewState: string) => void;
}

// Warehouse coordinates (same as OCC)
const WAREHOUSES = {
  jylland: { label: 'Jylland (Fredericia)', lon: 9.7528, lat: 55.5678 },
  sjaelland: { label: 'Sjælland (Frederikssund)', lon: 12.0687, lat: 55.8375 },
};

// Activity color mapping
const ACTIVITY_COLORS: Record<string, string> = {
  'team_challenge': '#ec4899',
  'teamlazer': '#3b82f6',
  'teamrobin': '#86efac',
  'teambox': '#9ca3af',
  'teamconnect': '#a855f7',
  'teamplay': '#f97316',
  'teamtaste': '#eab308',
  'teamsegway': '#ef4444',
  'teamcontrol': '#ffffff',
  'teamconstruct': '#facc15',
  'teamaction': '#67e8f9',
  'teamrace': '#f97316',
};

// ─── Helpers ───

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatShortDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch { return '—'; }
};

const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const t = d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  return t.replace(':', '.');
};

const hhmmToMinutes = (t: string | null): number | null => {
  if (!t) return null;
  const cleaned = t.replace('.', ':');
  const m = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

const minutesToHHMM = (mins: number): string => {
  const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
  const m = ((mins % 1440) + 1440) % 1440 % 60;
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
};

const extractHHMM = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const t = new Date(dateStr).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    const dotted = t.replace(':', '.');
    return dotted === '00.00' ? null : dotted;
  } catch { return null; }
};

function extractPostalCode(text: string): number | null {
  const m = text.match(/\b(\d{4})\b/);
  return m ? Number(m[1]) : null;
}

function getTaskRegion(cityOrAddress: string | null | undefined): 'øst' | 'vest' | null {
  if (!cityOrAddress) return null;
  const postal = extractPostalCode(cityOrAddress);
  if (postal === null) return null;
  return postal < 5000 ? 'øst' : 'vest';
}

// ─── Sub-components ───

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-battle-grey/50 border border-white/10 rounded-2xl p-6 print:border print:rounded-lg print:p-4 ${className}`}>
    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 print:text-gray-600 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

const Row: React.FC<{ label: string; value?: string | number | null; bold?: boolean }> = ({ label, value, bold }) => {
  const display = (value === null || value === undefined || value === '') ? null : value;
  if (display === null) return null;
  return (
    <div className="flex gap-2 mb-1 text-sm">
      <span className="text-gray-500 print:text-gray-600 flex-shrink-0 w-28">{label}:</span>
      <span className={`${bold ? 'text-white font-semibold' : 'text-gray-300'} print:text-black`}>{display}</span>
    </div>
  );
};

const NoteRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="mb-3">
      <span className="text-xs font-bold text-gray-500 uppercase print:text-gray-600">{label}: </span>
      <span className="text-sm text-gray-300 print:text-black whitespace-pre-wrap">{value}</span>
    </div>
  );
};

// Timeline colors matching OCC
type TLColor = 'highlight' | 'blue' | 'green' | 'yellow' | 'purple' | 'default';
const TL_CLASSES: Record<TLColor, string> = {
  highlight: 'bg-red-500/20 border-red-500/40 text-red-400',
  green: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  default: 'bg-gray-500/20 border-gray-500/40 text-gray-400',
};

const TimelineItem: React.FC<{ label: string; time: string; color: TLColor }> = ({ label, time, color }) => (
  <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg border flex-shrink-0 ${TL_CLASSES[color]}`}>
    <span className="text-[10px] uppercase tracking-wide font-semibold opacity-80">{label}</span>
    <span className="text-sm font-mono font-bold">{time}</span>
  </div>
);

// ─── Main Component ───

const SessionReport: React.FC<SessionReportProps> = ({ job, activities, onNavigateActivity }) => {
  const [crew, setCrew] = useState<CrewAssignment[]>([]);
  const [packingItems, setPackingItems] = useState<JobPackingItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleAssignment[]>([]);
  const [activityInfos, setActivityInfos] = useState<ActivityInfo[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ jylland?: { km: number; min: number }; sjaelland?: { km: number; min: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const activityIds: string[] = Array.isArray(job.activities) ? job.activities : [];
      const [crewData, packingData, vehicleData, actInfoData] = await Promise.all([
        fetchJobCrew(job.id),
        fetchJobPackingItems(job.id),
        fetchJobVehicles(job.id),
        activityIds.length > 0 ? fetchActivityInfo(activityIds) : Promise.resolve([]),
      ]);
      setCrew(crewData);
      setPackingItems(packingData);
      setVehicles(vehicleData);
      setActivityInfos(actInfoData);
      setLoading(false);
    };
    loadData();
  }, [job.id]);

  // Route calculation (Nominatim → OSRM, same as OCC)
  useEffect(() => {
    if (!job) { setRouteInfo(null); return; }
    const q = (job.location_address || job.location_name || '').trim();
    if (!q || q.length < 4) { setRouteInfo(null); return; }
    (async () => {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Denmark')}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'da' } }
        );
        const geoData = await geoRes.json();
        if (!geoData.length) { setRouteInfo(null); return; }
        const destLon = parseFloat(geoData[0].lon);
        const destLat = parseFloat(geoData[0].lat);
        const calcRoute = async (wh: { lon: number; lat: number }) => {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${wh.lon},${wh.lat};${destLon},${destLat}?overview=false`
          );
          const data = await res.json();
          if (data.routes?.[0]) return {
            km: Math.round(data.routes[0].distance / 1000),
            min: Math.round(data.routes[0].duration / 60),
          };
          return undefined;
        };
        const [jyl, sjl] = await Promise.all([
          calcRoute(WAREHOUSES.jylland),
          calcRoute(WAREHOUSES.sjaelland),
        ]);
        setRouteInfo({ jylland: jyl, sjaelland: sjl });
      } catch { setRouteInfo(null); }
    })();
  }, [job.location_address, job.location_name]);

  const handlePrint = () => { window.print(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-battle-orange animate-spin" />
      </div>
    );
  }

  // ─── Derived data ───
  const opgaveId = job.opgave_id ? `#${String(job.opgave_id).padStart(4, '0')}` : `#${job.short_code || '????'}`;
  const statusColor = job.opgave_status === 'completed' || job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
    job.opgave_status === 'cancelled' || job.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
    job.opgave_status === 'tentativ' ? 'bg-yellow-500/20 text-yellow-400' :
    'bg-blue-500/20 text-blue-400';
  const displayStatus = job.opgave_status || job.status || 'scheduled';

  const leads = crew.filter(c => c.role === 'lead' || c.role === 'teamlead');
  const instructors = crew.filter(c => c.role !== 'lead' && c.role !== 'teamlead');
  const primaryVehicle = vehicles[0] || null;
  const showPayment = job.customer_type === 'privat' || job.customer_type === 'polterabend';

  // Region + warehouse detection
  const region = getTaskRegion(job.location_address) ?? getTaskRegion(job.location_city);
  const warehouseKey = region === 'vest' ? 'jylland' : 'sjaelland';
  const warehouseLabel = warehouseKey === 'jylland' ? 'Vest (Fredericia)' : 'Øst (Frederikssund)';

  // Activity data
  const actCounts: Record<string, string> = job.activity_counts && typeof job.activity_counts === 'object' ? job.activity_counts : {};
  const actSessions: Record<string, string> = job.activity_sessions && typeof job.activity_sessions === 'object' ? job.activity_sessions : {};
  const activityIds: string[] = Array.isArray(job.activities) ? job.activities : [];
  const maxSessions = activityIds.reduce((mx, id) => Math.max(mx, Number(actSessions[id]) || 1), 1);

  // Activity logistics times from DB
  const actInfoMap: Record<string, ActivityInfo> = {};
  activityInfos.forEach(a => { actInfoMap[a.id] = a; });
  const packTimeSum = activityIds.reduce((s, id) => s + (actInfoMap[id]?.pack_time_minutes || 0), 0);
  const setupTimeSum = activityIds.reduce((s, id) => s + (actInfoMap[id]?.setup_time_minutes || 0), 0);
  const unpackTimeSum = activityIds.reduce((s, id) => s + (actInfoMap[id]?.unpack_time_minutes || 0), 0);
  const teardownTimeSum = setupTimeSum; // teardown ≈ setup

  // ─── Timing calculations ───
  const getinLagerTime = extractHHMM(job.get_in_time_storage);
  const getinLocTime = extractHHMM(job.get_in_time_location);
  const gamestartTime = extractHHMM(job.event_date);
  const durPerSession = Number(job.duration_minutes) || 0;
  const totalDur = durPerSession * maxSessions;

  let endTime: string | null = null;
  let endTimeMins: number | null = null;
  if (job.event_end) {
    endTime = formatTime(job.event_end);
    endTimeMins = hhmmToMinutes(endTime);
  } else if (gamestartTime && totalDur > 0) {
    const gsMins = hhmmToMinutes(gamestartTime);
    if (gsMins !== null) {
      endTimeMins = gsMins + totalDur;
      endTime = minutesToHHMM(endTimeMins);
    }
  }

  const getinLagerMins = hhmmToMinutes(getinLagerTime);
  const getinLocMins = hhmmToMinutes(getinLocTime);
  const gamestartMins = hhmmToMinutes(gamestartTime);
  const transitMinutes = (getinLagerMins !== null && getinLocMins !== null && getinLocMins > getinLagerMins)
    ? getinLocMins - getinLagerMins : null;
  const setupMinutes = (getinLocMins !== null && gamestartMins !== null && gamestartMins > getinLocMins)
    ? gamestartMins - getinLocMins : null;

  // ─── Build timeline (matching OCC exactly) ───
  const timelineItems: { label: string; time: string; color: TLColor }[] = [];

  if (getinLagerTime)
    timelineItems.push({ label: 'Get-in lager', time: getinLagerTime, color: 'green' });
  if (packTimeSum > 0)
    timelineItems.push({ label: 'Pak lager', time: `${packTimeSum} min`, color: 'blue' });
  if (transitMinutes !== null && transitMinutes > 0) {
    const driveMin = Math.max(0, transitMinutes - packTimeSum);
    if (driveMin > 0)
      timelineItems.push({ label: 'Kørsel', time: `${driveMin} min`, color: 'yellow' });
  }
  if (getinLocTime)
    timelineItems.push({ label: 'Get-in lokation', time: getinLocTime, color: 'green' });
  if (setupTimeSum > 0)
    timelineItems.push({ label: 'Opsætning', time: `${setupTimeSum} min`, color: 'blue' });
  if (gamestartTime)
    timelineItems.push({ label: 'Session start', time: gamestartTime, color: 'highlight' });
  if (totalDur > 0)
    timelineItems.push({ label: maxSessions > 1 ? `Sessiontid ×${maxSessions}` : 'Sessiontid', time: `${totalDur} min`, color: 'highlight' });
  if (endTime)
    timelineItems.push({ label: 'Session slut', time: endTime, color: 'highlight' });
  if (teardownTimeSum > 0)
    timelineItems.push({ label: 'Nedpakning', time: `${teardownTimeSum} min`, color: 'blue' });
  if (job.bil_tankes || job.bil_oplades) {
    const bilLabel = [job.bil_tankes ? 'Tank' : '', job.bil_oplades ? 'Oplad' : ''].filter(Boolean).join(' + ');
    const bilMin = (job.bil_tankes ? 10 : 0) + (job.bil_oplades ? 30 : 0);
    timelineItems.push({ label: bilLabel, time: `${bilMin} min`, color: 'purple' });
  }
  if (transitMinutes !== null && transitMinutes > 0) {
    const driveMin = Math.max(0, transitMinutes - packTimeSum);
    if (driveMin > 0)
      timelineItems.push({ label: 'Retur kørsel', time: `${driveMin} min`, color: 'yellow' });
  }
  if (unpackTimeSum > 0)
    timelineItems.push({ label: 'Udpak lager', time: `${unpackTimeSum} min`, color: 'blue' });

  // Opgave slut calculation
  const bilExtraMin = (job.bil_tankes ? 10 : 0) + (job.bil_oplades ? 30 : 0);
  const postEventMins = teardownTimeSum
    + ((transitMinutes !== null && transitMinutes > 0) ? Math.max(0, transitMinutes - packTimeSum) : 0)
    + unpackTimeSum
    + bilExtraMin;
  const dagSlutMins = (endTimeMins !== null && postEventMins > 0) ? endTimeMins + postEventMins : null;
  const dagSlutTime = dagSlutMins !== null ? minutesToHHMM(dagSlutMins) : null;
  if (dagSlutTime)
    timelineItems.push({ label: 'Opgave slut', time: dagSlutTime, color: 'green' });

  // Category sums for timeline summary
  const pakOpsTotal = packTimeSum + setupTimeSum + teardownTimeSum + unpackTimeSum;
  const driveOneWay = (transitMinutes !== null && transitMinutes > 0) ? Math.max(0, transitMinutes - packTimeSum) : 0;
  const korselTotal = driveOneWay * 2;

  // Tables/tablecloths
  const tableItems = [
    { label: 'Skæreborde 80cm', value: job.bord_skaere_80 },
    { label: 'Foldeborde 180cm', value: job.bord_folde_180 },
    { label: 'Foldeborde 240cm', value: job.bord_folde_240 },
    { label: 'Høje caféborde', value: job.hoeje_cafeborde },
    { label: 'Dug 180cm', value: job.dug_180 },
    { label: 'Dug 240cm', value: job.dug_240 },
    { label: 'Dug rund 80cm', value: job.dug_rund_80 },
  ].filter(t => t.value && Number(t.value) > 0);

  // All note fields (including new ones from OCC)
  const noteFields = [
    { label: 'Generelt', value: job.notes },
    { label: 'Opgavenote', value: job.task_notes },
    { label: 'Timing', value: job.timing_note },
    { label: 'Crew', value: job.crew_note },
    { label: 'Aktiviteter', value: job.aktiviteter_note },
    { label: 'Gear', value: job.gear_note },
    { label: 'Transport', value: job.transport_note },
    { label: 'Lokation', value: job.location_note },
    { label: 'Betaling', value: job.payment_note },
  ].filter(n => n.value);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 print:max-w-full print:px-8 print:py-4 print:space-y-3">
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          * { color: black !important; border-color: #ccc !important; background: white !important; }
          .print-header { background: #f3f4f6 !important; }
          .print-orange { color: #ea580c !important; }
        }
      `}</style>

      {/* Action buttons */}
      <div className="no-print flex items-center justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-battle-orange/20 hover:bg-battle-orange/30 text-battle-orange px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Printer size={16} />
          Print Rapport
        </button>
      </div>

      {/* Header */}
      <div className="bg-battle-grey/50 border border-white/10 rounded-2xl p-6 print-header print:border print:rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {job.client_logo_url && (
              <img
                src={job.client_logo_url}
                alt=""
                className="w-12 h-12 object-contain rounded-lg print:w-10 print:h-10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-mono font-bold text-battle-orange print-orange print:text-black">
                  {opgaveId}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                  {displayStatus}
                </span>
                {job.kun_tilbud && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
                    KUN TILBUD
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white print:text-black">
                {job.client_name || 'Ukendt kunde'}
              </h1>
              {job.location_name && (
                <p className="text-sm text-gray-400 print:text-gray-600">@ {job.location_name}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-400 print:text-gray-600">
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar size={14} />
              <span>{formatDate(job.event_date)}</span>
            </div>
            {job.event_time && (
              <div className="text-xs text-gray-500 mt-0.5">{job.event_time}</div>
            )}
            {job.duration_minutes && (
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Clock size={14} />
                <span>{totalDur > 0 && maxSessions > 1 ? `${job.duration_minutes} min × ${maxSessions} = ${totalDur} min` : `${job.duration_minutes} min`}</span>
              </div>
            )}
          </div>
        </div>

        {/* Kontaktet status badges */}
        {(job.kunde_kontaktet || job.hotel_kontaktet === 'ja' || job.location_kontaktet) && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {job.kunde_kontaktet && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                <CheckCircle2 size={12} />
                Kunde kontaktet {job.kunde_kontaktet_dato ? formatShortDate(job.kunde_kontaktet_dato) : ''}
                {job.kunde_kontaktet_note ? ` — ${job.kunde_kontaktet_note}` : ''}
              </span>
            )}
            {(job.location_kontaktet || job.hotel_kontaktet === 'ja') && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                <CheckCircle2 size={12} />
                Lokation kontaktet {job.hotel_kontaktet_dato ? formatShortDate(job.hotel_kontaktet_dato) : job.location_kontaktet_dato ? formatShortDate(job.location_kontaktet_dato) : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dagsoverblik Timeline */}
      {timelineItems.length > 1 && (
        <Section title="Dagsoverblik" icon={<Clock size={14} />}>
          <div className="flex items-center gap-2 flex-wrap">
            {timelineItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-4 h-0.5 bg-gray-600 flex-shrink-0 print:bg-gray-400" />}
                <TimelineItem label={item.label} time={item.time} color={item.color} />
              </React.Fragment>
            ))}
          </div>

          {/* Category summary */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 flex-wrap text-xs">
            {pakOpsTotal > 0 && (
              <span className="text-blue-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Pak/ops: <strong>{pakOpsTotal} min</strong>
              </span>
            )}
            {korselTotal > 0 && (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Kørsel: <strong>~{korselTotal} min</strong>
              </span>
            )}
            {totalDur > 0 && (
              <span className="text-red-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Session: <strong>{totalDur} min</strong>
              </span>
            )}
            {getinLagerMins !== null && (dagSlutMins ?? endTimeMins) !== null && (
              <>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">
                  Samlet dag: <strong className="text-white">{(() => {
                    const total = (dagSlutMins ?? endTimeMins!) - getinLagerMins;
                    return `${Math.floor(total / 60)}t ${total % 60}m`;
                  })()}</strong>
                </span>
              </>
            )}
            {getinLagerTime && (
              <span className="text-gray-400">Start: <strong className="text-white">{getinLagerTime}</strong></span>
            )}
            {(dagSlutTime || endTime) && (
              <span className="text-gray-400">Slut: <strong className="text-battle-orange">{dagSlutTime || endTime}</strong></span>
            )}
          </div>
        </Section>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">

        {/* Kunde */}
        <Section title="Kunde" icon={<Building2 size={14} />}>
          <Row label="Kunde" value={job.client_name} bold />
          <Row label="Type" value={job.customer_type?.toUpperCase()} />
          {job.guests_count && (
            <div className="flex gap-2 mb-1">
              <span className="text-gray-500 flex-shrink-0 w-28 text-sm">Gæster:</span>
              <span className="text-2xl font-bold text-battle-orange print-orange">{job.guests_count}</span>
            </div>
          )}
          <Row label="Kontakt" value={job.client_contact_name} />
          {job.client_contact_phone && (
            <div className="flex gap-2 mb-1 text-sm">
              <span className="text-gray-500 flex-shrink-0 w-28">Tlf:</span>
              <a href={`tel:${job.client_contact_phone}`} className="text-blue-400 hover:underline no-print">{job.client_contact_phone}</a>
              <span className="hidden print:inline text-black">{job.client_contact_phone}</span>
            </div>
          )}
          {job.client_contact_email && (
            <div className="flex gap-2 mb-1 text-sm">
              <span className="text-gray-500 flex-shrink-0 w-28">Email:</span>
              <a href={`mailto:${job.client_contact_email}`} className="text-blue-400 hover:underline no-print truncate">{job.client_contact_email}</a>
              <span className="hidden print:inline text-black truncate">{job.client_contact_email}</span>
            </div>
          )}
          <Row label="Bureau" value={job.agency} />
          <Row label="Kundenr." value={job.customer_number} />
          <Row label="Sprog" value={job.language} />
          <Row label="Firma info" value={job.firma_info} />
        </Section>

        {/* Tid & Dato — with full post-event breakdown */}
        <Section title="Tid & Dato" icon={<Clock size={14} />}>
          <Row label="Dato" value={formatDate(job.event_date)} bold />
          {job.event_end && <Row label="Slutdato" value={formatDate(job.event_end)} />}
          <div className="h-2" />
          <Row label="Get-in lager" value={getinLagerTime} />
          {packTimeSum > 0 && (
            <div className="text-xs text-blue-400 ml-28 -mt-0.5 mb-1 italic">↳ Pak lager: {packTimeSum} min</div>
          )}
          {transitMinutes !== null && transitMinutes > 0 && (
            <div className="text-xs text-yellow-500 ml-28 -mt-0.5 mb-1 italic">↳ Kørsel: {Math.max(0, transitMinutes - packTimeSum)} min</div>
          )}
          <Row label="Get-in lok." value={getinLocTime} />
          {(setupMinutes !== null && setupMinutes > 0 || setupTimeSum > 0) && (
            <div className="text-xs text-blue-400 ml-28 -mt-0.5 mb-1 italic">↳ Opsætning: {setupMinutes || setupTimeSum} min</div>
          )}
          <Row label="Session start" value={gamestartTime} bold />
          <Row label="Varighed" value={totalDur > 0 ? (maxSessions > 1 ? `${durPerSession} min × ${maxSessions} = ${totalDur} min` : `${totalDur} min`) : null} />
          <Row label="Session slut" value={endTime} />
          {/* Post-event breakdown */}
          {teardownTimeSum > 0 && (
            <div className="text-xs text-blue-400 ml-28 -mt-0.5 mb-1 italic">↳ Nedpakning: {teardownTimeSum} min</div>
          )}
          {transitMinutes !== null && transitMinutes > 0 && (
            <div className="text-xs text-yellow-500 ml-28 -mt-0.5 mb-1 italic">↳ Retur kørsel: {Math.max(0, transitMinutes - packTimeSum)} min</div>
          )}
          {unpackTimeSum > 0 && (
            <div className="text-xs text-blue-400 ml-28 -mt-0.5 mb-1 italic">↳ Udpak lager: {unpackTimeSum} min</div>
          )}
          {dagSlutTime && <Row label="Opgave slut" value={dagSlutTime} bold />}
        </Section>

        {/* Lokation — with route info */}
        <Section title="Lokation" icon={<MapPin size={14} />}>
          <Row label="Sted" value={job.location_name} bold />
          <Row label="Adresse" value={job.location_address} />
          <Row label="By" value={job.location_city} />
          {job.location_address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="no-print text-battle-orange text-xs mt-2 inline-block hover:underline"
            >
              Vis i Google Maps →
            </a>
          )}
          {job.location_kontaktet && (
            <div className="mt-2 text-xs text-green-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} />
              Lokation kontaktet {job.location_kontaktet_dato ? formatShortDate(job.location_kontaktet_dato) : ''}
            </div>
          )}
          {job.get_in_location && job.get_in_location !== job.location_name && (
            <div className="mt-3 pt-3 border-t border-white/5 print:border-gray-300">
              <Row label="Get-in sted" value={job.get_in_location} />
            </div>
          )}
          {job.get_back_location && (
            <div className="mt-2 pt-2 border-t border-white/5 print:border-gray-300">
              <Row label="Returadresse" value={job.get_back_location} />
            </div>
          )}

          {/* Route info from both warehouses */}
          {routeInfo && (
            <div className="mt-3 pt-3 border-t border-white/5 print:border-gray-300">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Navigation size={10} />
                Kørsel fra lager
              </div>
              {routeInfo.jylland && (
                <div className="flex gap-2 text-xs mb-1">
                  <span className="text-gray-500 w-28 flex-shrink-0">Fredericia:</span>
                  <span className={`${region === 'vest' ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    {routeInfo.jylland.min} min ({routeInfo.jylland.km} km)
                  </span>
                  {region === 'vest' && <span className="text-battle-orange font-bold text-[10px]">✦</span>}
                </div>
              )}
              {routeInfo.sjaelland && (
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-500 w-28 flex-shrink-0">Frederikssund:</span>
                  <span className={`${region === 'øst' ? 'text-white font-semibold' : 'text-gray-600'}`}>
                    {routeInfo.sjaelland.min} min ({routeInfo.sjaelland.km} km)
                  </span>
                  {region === 'øst' && <span className="text-battle-orange font-bold text-[10px]">✦</span>}
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Crew */}
        <Section title="Crew" icon={<Users size={14} />}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-battle-orange print-orange">{job.guests_count || 0}</div>
              <div className="text-xs text-gray-500">Gæster</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 print:text-black">{job.instructors_count || 0}</div>
              <div className="text-xs text-gray-500">Instruktører</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 print:text-black">{job.assistants_count || 0}</div>
              <div className="text-xs text-gray-500">Assistenter</div>
            </div>
          </div>

          {leads.length > 0 && (
            <>
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Lead</div>
              {leads.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-battle-orange" />
                    <span className="text-white text-sm font-semibold print:text-black">{c.employee_name}</span>
                  </div>
                  {c.employee_phone && (
                    <a href={`tel:${c.employee_phone}`} className="text-xs text-gray-500 hover:text-blue-400 no-print flex items-center gap-1">
                      <Phone size={10} /> {c.employee_phone}
                    </a>
                  )}
                  <span className="hidden print:inline text-xs text-gray-600">{c.employee_phone}</span>
                </div>
              ))}
            </>
          )}
          {instructors.length > 0 && (
            <>
              <div className={`text-xs font-bold text-gray-500 uppercase mb-2 ${leads.length > 0 ? 'mt-3' : ''}`}>Instruktører</div>
              {instructors.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-white text-sm print:text-black">{c.employee_name}</span>
                  </div>
                  {c.employee_phone && (
                    <a href={`tel:${c.employee_phone}`} className="text-xs text-gray-500 hover:text-blue-400 no-print flex items-center gap-1">
                      <Phone size={10} /> {c.employee_phone}
                    </a>
                  )}
                  <span className="hidden print:inline text-xs text-gray-600">{c.employee_phone}</span>
                </div>
              ))}
            </>
          )}
          {crew.length === 0 && (
            <p className="text-sm text-gray-500">Ingen crew tildelt</p>
          )}
        </Section>
      </div>

      {/* Activities - full width */}
      {activities.length > 0 && (
        <Section title="Aktiviteter" icon={<Package size={14} />}>
          <div className="space-y-3">
            {activities.map((act) => {
              const actId = activityIds.find(id => {
                const viewMap: Record<string, string> = {
                  'A1': 'team_challenge', 'A2': 'teamlazer', 'A3': 'teamtaste',
                  'A4': 'teamplay', 'A5': 'teamrobin', 'A6': 'teamsegway',
                  'A7': 'teamconnect', 'A8': 'teambox', 'A9': 'teamcontrol',
                  'A10': 'teamaction', 'A11': 'teamconstruct', 'A12': 'teamrace',
                };
                return viewMap[id] === act.viewState;
              });
              const count = actId ? actCounts[actId] : null;
              const sessions = actId ? actSessions[actId] : null;
              const info = actId ? actInfoMap[actId] : null;

              return (
                <div key={act.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/20 print:bg-gray-50 print:border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACTIVITY_COLORS[act.viewState] || '#f97316' }}
                    />
                    <div>
                      <span className="text-white text-sm font-medium print:text-black">{act.name}</span>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        {sessions && Number(sessions) > 1 && (
                          <span className="text-battle-orange font-semibold">×{sessions} sessions</span>
                        )}
                        {count && Number(count) > 0 && (
                          <span>{count} enheder</span>
                        )}
                        {info?.default_duration && (
                          <span>{info.default_duration} min/session</span>
                        )}
                        {info && (info.pack_time_minutes || info.setup_time_minutes) && (
                          <span className="text-blue-400">
                            {[
                              info.pack_time_minutes ? `pak ${info.pack_time_minutes}m` : '',
                              info.setup_time_minutes ? `ops ${info.setup_time_minutes}m` : '',
                              info.unpack_time_minutes ? `udpak ${info.unpack_time_minutes}m` : '',
                            ].filter(Boolean).join(' / ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateActivity?.(act.viewState)}
                    className="no-print p-1 text-gray-500 hover:text-battle-orange transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          {(() => {
            const totalUnits = activityIds.reduce((sum, id) => sum + (Number(actCounts[id]) || 0), 0);
            return totalUnits > 0 ? (
              <div className="mt-3 pt-3 border-t border-white/5 text-sm font-bold text-battle-orange uppercase print-orange">
                Antal enheder total: {totalUnits}
              </div>
            ) : null;
          })()}
        </Section>
      )}

      {/* Transport — with warehouse info */}
      {(primaryVehicle || job.bil_tankes || job.bil_oplades) && (
        <Section title="Transport" icon={<Truck size={14} />}>
          <Row label="Lager" value={warehouseLabel} bold />
          {primaryVehicle?.car_name && <Row label="Bil" value={primaryVehicle.car_name} bold />}
          {primaryVehicle?.car_team_id && <Row label="Team nr." value={primaryVehicle.car_team_id} />}
          {primaryVehicle?.trailer_name && <Row label="Trailer" value={primaryVehicle.trailer_name} />}
          {primaryVehicle?.trailer_team_id && <Row label="Team nr." value={primaryVehicle.trailer_team_id} />}
          {job.bil_tankes && (
            <div className="flex items-center gap-2 mt-2 text-sm text-yellow-400">
              <Fuel size={14} /> <span className="font-semibold">Bil skal tankes</span>
            </div>
          )}
          {job.bil_oplades && (
            <div className="flex items-center gap-2 mt-1 text-sm text-green-400">
              <BatteryCharging size={14} /> <span className="font-semibold">Bil skal oplades</span>
            </div>
          )}
        </Section>
      )}

      {/* Packing Items */}
      {packingItems.length > 0 && (
        <Section title="Pakkeliste" icon={<Package size={14} />}>
          <div className="space-y-1.5">
            {packingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-gray-500" />
                  <span className="text-white text-sm print:text-black">{item.item_name}</span>
                </div>
                <span className="text-gray-400 text-xs print:text-gray-600">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Borde & Dug */}
      {tableItems.length > 0 && (
        <Section title="Borde & Dug">
          {tableItems.map((t, i) => (
            <Row key={i} label={t.label} value={t.value} />
          ))}
        </Section>
      )}

      {/* Setup/Teardown */}
      {(job.lane_setup || job.lane_teardown) && (
        <Section title="Bane Opsætning">
          {job.lane_setup && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1 print:text-gray-600">Opsætning</p>
              <p className="text-white text-sm print:text-black">{job.lane_setup}</p>
            </div>
          )}
          {job.lane_teardown && (
            <div>
              <p className="text-xs text-gray-500 mb-1 print:text-gray-600">Nedtagning</p>
              <p className="text-white text-sm print:text-black">{job.lane_teardown}</p>
            </div>
          )}
        </Section>
      )}

      {/* Betaling — only for privat/polterabend */}
      {showPayment && (
        <Section title="Betaling" icon={<CreditCard size={14} />}>
          <Row label="Metode" value={job.payment_method?.toUpperCase()} bold />
          <Row label="Beløb" value={job.payment_amount ? `${job.payment_amount} kr` : null} />
          {job.payment_method === 'kreditkort' && (
            <Row label="Kortgebyr" value={job.payment_card_fee ? `${job.payment_card_fee} kr` : null} />
          )}
          <Row label="Kontakt" value={job.payment_contact} />
          {job.mobilepay && (
            <>
              <Row label="MobilePay" value={job.mobilepay_amount ? `${job.mobilepay_amount} kr` : 'Ja'} />
              {job.mobilepay_received && <Row label="MP modtaget" value={`${job.mobilepay_received} kr`} />}
              <Row label="MP note" value={job.mobilepay_note} />
            </>
          )}
          {job.kontant_amount && (
            <>
              <Row label="Kontant" value={`${job.kontant_amount} kr`} />
              {job.kontant_received && <Row label="Modtaget" value={`${job.kontant_received} kr`} />}
              <Row label="Kontant note" value={job.kontant_note} />
            </>
          )}
          {job.faktura_sendt && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-green-400">
              <CheckCircle2 size={14} />
              <span className="font-semibold">Faktura sendt</span>
            </div>
          )}
          {job.payment_method === 'ub' && job.ub_note && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-xs text-red-400 font-bold uppercase">U/B Årsag: </span>
              <span className="text-sm text-gray-300">{job.ub_note}</span>
            </div>
          )}
        </Section>
      )}

      {/* Evaluation */}
      {job.skal_evalueres && (
        <Section title="Evaluering" icon={<Star size={14} />}>
          {job.evaluation_score !== null && job.evaluation_score !== undefined ? (
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={18}
                    className={s <= (job.evaluation_score || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-yellow-400">{job.evaluation_score}/5</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Ikke evalueret endnu</p>
          )}
          {job.evaluation_notes && (
            <p className="text-sm text-gray-300 mt-2">{job.evaluation_notes}</p>
          )}
        </Section>
      )}

      {/* Notes */}
      {noteFields.length > 0 && (
        <Section title="Noter" icon={<FileText size={14} />}>
          {noteFields.map((n, i) => (
            <NoteRow key={i} label={n.label} value={n.value} />
          ))}
        </Section>
      )}
    </div>
  );
};

export default SessionReport;
