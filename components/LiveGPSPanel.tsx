import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation, MapPin, Clock, Wifi, WifiOff, Truck, Target,
  RefreshCw, ChevronDown, ChevronUp, Car, Crosshair,
  Battery, Signal, Gauge, Route, Calendar, ExternalLink
} from 'lucide-react';
import {
  getAllDevices, categoriseDevices, timeAgo, SKYDEANLÆG_MAP,
  getDeviceHistory,
  type LiveGPSDevice, type LiveGPSGroup, type LiveGPSHistoryResult
} from '../lib/livegps';

// ── Sub-components ──────────────────────────────────────────

const StatusBadge: React.FC<{ online: string }> = ({ online }) => {
  const cfg = online === 'online'
    ? { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Online' }
    : online === 'ack'
      ? { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'ACK' }
      : { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Offline' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {online === 'online' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-gray-800/50 border border-${color}-500/20 rounded-lg p-3 flex items-center gap-3`}>
    <div className={`p-2 rounded-lg bg-${color}-500/10`}>{icon}</div>
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
    </div>
  </div>
);

// ── Device detail modal ─────────────────────────────────────

interface DeviceDetailProps {
  device: LiveGPSDevice;
  onClose: () => void;
}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ device, onClose }) => {
  const [history, setHistory] = useState<LiveGPSHistoryResult | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadTodayHistory = async () => {
    setLoadingHistory(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await getDeviceHistory(device.id, today, '00:00', today, '23:59');
      setHistory(result);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  };

  useEffect(() => { loadTodayHistory(); }, [device.id]);

  const imei = device.device_data?.imei;
  const skyde = imei ? SKYDEANLÆG_MAP[imei] : null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{skyde ? `System ${skyde.serial}` : device.name}</h3>
            {skyde && <p className="text-xs text-gray-400">{device.name}</p>}
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge online={device.online} />
              <span className="text-[10px] text-gray-500">ID: {device.id} | IMEI: {imei}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400">✕</button>
        </div>

        {/* Position */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Position</div>
              <div className="text-sm font-mono text-green-400">{device.lat.toFixed(6)}, {device.lng.toFixed(6)}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Hastighed</div>
              <div className="text-sm font-bold text-blue-400">{device.speed} km/t</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Sidst set</div>
              <div className="text-sm text-yellow-400">{timeAgo(device.timestamp)}</div>
              <div className="text-[10px] text-gray-500">{device.time}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Stop varighed</div>
              <div className="text-sm text-orange-400">{device.stop_duration || '–'}</div>
            </div>
          </div>

          {/* Address */}
          {device.address && device.address !== '-' && (
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Adresse</div>
              <div className="text-sm text-gray-300">{device.address}</div>
            </div>
          )}

          {/* Sensors */}
          {device.sensors && device.sensors.length > 0 && (
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase mb-2">Sensorer</div>
              <div className="grid grid-cols-2 gap-2">
                {device.sensors.map(s => (
                  <div key={s.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{s.name}</span>
                    <span className={`font-mono ${s.value === 'On' || s.value === 'online' ? 'text-green-400' : 'text-gray-300'}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's history summary */}
          {loadingHistory ? (
            <div className="text-center py-3 text-gray-500 text-xs">Henter historik...</div>
          ) : history ? (
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase mb-2">Dagens historik</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Distance</span><span className="text-green-400 font-mono">{history.distance_sum}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Max hastighed</span><span className="text-blue-400 font-mono">{history.top_speed}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Kørselstid</span><span className="text-yellow-400 font-mono">{history.move_duration}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Stoptid</span><span className="text-orange-400 font-mono">{history.stop_duration}</span></div>
              </div>
            </div>
          ) : null}

          {/* Map links */}
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps?q=${device.lat},${device.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" /> Google Maps
            </a>
            <a
              href="https://app.livegps.dk/objects"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" /> LiveGPS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Device card ─────────────────────────────────────────────

interface DeviceCardProps {
  device: LiveGPSDevice;
  compact?: boolean;
  onClick: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, compact, onClick }) => {
  const imei = device.device_data?.imei;
  const skyde = imei ? SKYDEANLÆG_MAP[imei] : null;
  const colorMap: Record<string, string> = {
    'Rød': 'bg-red-500', 'Grøn': 'bg-green-500', 'Blå': 'bg-blue-500',
    'Pink': 'bg-pink-400', 'Orange': 'bg-orange-500', 'Lilla': 'bg-purple-500'
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/70 hover:border-orange-500/30 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {skyde && <div className={`w-2.5 h-2.5 rounded-full ${colorMap[skyde.color] || 'bg-gray-500'} ring-1 ring-white/20`} />}
            <span className="text-sm font-bold text-white truncate">
              {skyde ? `Sys ${skyde.serial}` : device.name}
            </span>
            <StatusBadge online={device.online} />
          </div>
          {skyde && (
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
              <span>Frekvens {skyde.freq}</span>
              <span>·</span>
              <span>{skyde.color}</span>
            </div>
          )}
          {!compact && (
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3" /> {device.speed} km/t
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(device.timestamp)}
              </span>
              {device.stop_duration && device.stop_duration !== '0s' && (
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> Stop: {device.stop_duration}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500 group-hover:text-orange-400 transition-colors">
          <Crosshair className="w-4 h-4" />
        </div>
      </div>
      {!compact && (
        <div className="mt-2 text-[10px] font-mono text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {device.lat.toFixed(5)}, {device.lng.toFixed(5)}
          {device.address && device.address !== '-' && (
            <span className="ml-2 text-gray-600 truncate">— {device.address}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Panel ──────────────────────────────────────────────

const LiveGPSPanel: React.FC = () => {
  const [groups, setGroups] = useState<LiveGPSGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<LiveGPSDevice | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    skydeanlæg: true, vehicles: true, trailers: true, other: false,
  });

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllDevices();
      setGroups(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const { skydeanlæg, vehicles, trailers, other, all } = categoriseDevices(groups);
  const onlineCount = all.filter(d => d.online === 'online').length;

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const renderSection = (
    key: string,
    title: string,
    icon: React.ReactNode,
    devices: LiveGPSDevice[],
    color: string
  ) => {
    const open = expandedSections[key];
    const online = devices.filter(d => d.online === 'online').length;
    return (
      <div key={key} className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-bold text-white">{title}</span>
            <span className="text-[10px] bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">{devices.length}</span>
            {online > 0 && (
              <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">{online} online</span>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {open && (
          <div className="p-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {devices.map(d => (
              <DeviceCard key={d.id} device={d} onClick={() => setSelectedDevice(d)} />
            ))}
            {devices.length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-600 text-xs">Ingen enheder</div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
        <span className="ml-3 text-gray-400">Henter LiveGPS data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg font-bold mb-2">LiveGPS Fejl</div>
        <div className="text-gray-500 text-sm mb-4">{error}</div>
        <button onClick={fetchDevices} className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm hover:bg-orange-500/20">
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Navigation className="w-5 h-5 text-orange-400" />} label="Total enheder" value={all.length} color="orange" />
        <StatCard icon={<Wifi className="w-5 h-5 text-green-400" />} label="Online" value={onlineCount} color="green" />
        <StatCard icon={<Target className="w-5 h-5 text-purple-400" />} label="Skydeanlæg" value={skydeanlæg.length} color="purple" />
        <StatCard icon={<Truck className="w-5 h-5 text-blue-400" />} label="Køretøjer" value={vehicles.length + trailers.length} color="blue" />
      </div>

      {/* Refresh bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Signal className="w-3 h-3 text-orange-400" />
          <span>LiveGPS API · Auto-opdatering hvert 30s</span>
          {lastRefresh && <span>· Sidst: {lastRefresh.toLocaleTimeString('da-DK')}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDevices} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-3 h-3" /> Opdater
          </button>
          <a href="https://app.livegps.dk/objects" target="_blank" rel="noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors">
            <ExternalLink className="w-3 h-3" /> LiveGPS
          </a>
        </div>
      </div>

      {/* Device sections */}
      <div className="space-y-3">
        {renderSection('skydeanlæg', 'Skydeanlæg (TeamLazer)', <Target className="w-4 h-4 text-purple-400" />, skydeanlæg, 'purple')}
        {renderSection('vehicles', 'Køretøjer', <Car className="w-4 h-4 text-blue-400" />, vehicles, 'blue')}
        {renderSection('trailers', 'Trailere', <Truck className="w-4 h-4 text-green-400" />, trailers, 'green')}
        {renderSection('other', 'Øvrige', <Navigation className="w-4 h-4 text-gray-400" />, other, 'gray')}
      </div>

      {/* API Info footer */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 text-[10px] text-gray-600 space-y-1">
        <div className="font-bold text-gray-500 uppercase tracking-wider">LiveGPS API Info</div>
        <div>Base URL: https://app.livegps.dk/api</div>
        <div>Dokumentation: https://liveiot.dk/livegps-basis-api/</div>
        <div>Endpoints: /login, /get_devices, /get_devices_latest, /get_history, /get_history_messages</div>
        <div>Auth: user_api_hash (bcrypt) via POST /login</div>
        <div>Proxy: Supabase Edge Function (livegps-proxy)</div>
      </div>

      {/* Device detail modal */}
      {selectedDevice && (
        <DeviceDetail device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}
    </div>
  );
};

export default LiveGPSPanel;
