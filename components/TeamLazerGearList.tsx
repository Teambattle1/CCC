import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Link2, Unlink, Monitor, Crosshair, AlertCircle, CheckCircle2, Loader, Pencil, X, Save, Navigation, Printer, Battery } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GearItem {
  id: string;
  name: string;
  type: string;
  location: string | null;
  color_code: string | null;
  frequency: string | null;
  out_of_service: boolean;
  out_of_service_reason: string | null;
  har_gps: boolean;
  emei_number: string | null;
  serial_numbers: string | null;
  description: string | null;
  battery_change_date: string | null;
}

interface GearLink {
  id: string;
  display_id: string;
  kaster_id: string;
}

interface EditForm {
  name: string;
  location: string;
  color_code: string;
  frequency: string;
  out_of_service: boolean;
  out_of_service_reason: string;
  serial_numbers: string;
  description: string;
  battery_change_date: string;
  emei_number: string;
  har_gps: boolean;
}

type SortKey = 'name' | 'type' | 'location' | 'color_code' | 'frequency' | 'status' | 'serial_numbers' | 'battery_change_date' | 'emei_number';
type SortDir = 'asc' | 'desc';

const COLOR_DOT: Record<string, string> = {
  lilla: 'bg-purple-500',
  orange: 'bg-orange-500',
  blå: 'bg-blue-500',
  rød: 'bg-red-500',
  grøn: 'bg-green-500',
  pink: 'bg-pink-400',
  sort: 'bg-gray-700',
};

function getColorDot(color: string | null) {
  if (!color) return null;
  const cls = COLOR_DOT[color.toLowerCase()] || 'bg-gray-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls} mr-1`} />;
}

const LINK_ROW_COLOR: Record<string, string> = {
  lilla: 'border-purple-500/60 bg-purple-500/10',
  orange: 'border-orange-500/60 bg-orange-500/10',
  blå: 'border-blue-500/60 bg-blue-500/10',
  rød: 'border-red-500/60 bg-red-500/10',
  grøn: 'border-green-500/60 bg-green-500/10',
  pink: 'border-pink-500/60 bg-pink-500/10',
  sort: 'border-gray-500/60 bg-gray-500/10',
};

const LINK_BADGE_COLOR: Record<string, string> = {
  lilla: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  blå: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  rød: 'bg-red-500/20 text-red-400 border-red-500/40',
  grøn: 'bg-green-500/20 text-green-400 border-green-500/40',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
  sort: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

const FALLBACK_ROW = 'border-cyan-500/60 bg-cyan-500/10';
const FALLBACK_BADGE = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';

function getLinkRowColor(color: string | null) {
  if (!color) return FALLBACK_ROW;
  return LINK_ROW_COLOR[color.toLowerCase()] || FALLBACK_ROW;
}

function getLinkBadgeColorByGear(color: string | null) {
  if (!color) return FALLBACK_BADGE;
  return LINK_BADGE_COLOR[color.toLowerCase()] || FALLBACK_BADGE;
}

function formatDate(d: string | null): string {
  if (!d || d === '0001-01-01') return '–';
  try {
    return new Date(d).toLocaleDateString('da-DK');
  } catch {
    return d;
  }
}

const TeamLazerGearList: React.FC = () => {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [links, setLinks] = useState<GearLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('color_code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [linkingDisplayId, setLinkingDisplayId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', location: '', color_code: '', frequency: '', out_of_service: false,
    out_of_service_reason: '', serial_numbers: '', description: '', battery_change_date: '',
    emei_number: '', har_gps: false,
  });
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [gearRes, linksRes] = await Promise.all([
      supabase
        .from('gear')
        .select('id, name, geartype_id, location, color_code, frequency, out_of_service, out_of_service_reason, har_gps, emei_number, serial_numbers, description, battery_change_date, geartypes!left(name)')
        .or('geartype_id.eq.aee1e9b3-5bae-4c02-ab5a-00dabae9240b,geartype_id.eq.724da061-16e2-4c63-8833-bb6cc7c5cf97')
        .order('name'),
      supabase.from('gear_links').select('*'),
    ]);

    if (gearRes.data) {
      setGear(
        gearRes.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          type: g.geartypes?.name || 'Ukendt',
          location: g.location,
          color_code: g.color_code,
          frequency: g.frequency,
          out_of_service: g.out_of_service || false,
          out_of_service_reason: g.out_of_service_reason || null,
          har_gps: g.har_gps || false,
          emei_number: g.emei_number || null,
          serial_numbers: g.serial_numbers || null,
          description: g.description || null,
          battery_change_date: g.battery_change_date || null,
        }))
      );
    }
    if (linksRes.data) setLinks(linksRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (editingId) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedGear = [...gear].sort((a, b) => {
    let aVal: string | boolean;
    let bVal: string | boolean;
    if (sortKey === 'status') {
      aVal = a.out_of_service;
      bVal = b.out_of_service;
    } else {
      aVal = (a[sortKey] || '').toLowerCase();
      bVal = (b[sortKey] || '').toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const displays = gear.filter((g) => g.type === 'Display');
  const kasters = gear.filter((g) => g.type === 'Kaster');

  const getLinkedPartner = (gearId: string): { partnerId: string; linkId: string } | null => {
    const asDisplay = links.find((l) => l.display_id === gearId);
    if (asDisplay) return { partnerId: asDisplay.kaster_id, linkId: asDisplay.id };
    const asKaster = links.find((l) => l.kaster_id === gearId);
    if (asKaster) return { partnerId: asKaster.display_id, linkId: asKaster.id };
    return null;
  };

  const getPartnerName = (gearId: string): string | null => {
    const link = getLinkedPartner(gearId);
    if (!link) return null;
    return gear.find((g) => g.id === link.partnerId)?.name || null;
  };

  const getLinkDisplayColor = (gearId: string): string | null => {
    const link = links.find((l) => l.display_id === gearId || l.kaster_id === gearId);
    if (!link) return null;
    const display = gear.find((g) => g.id === link.display_id);
    return display?.color_code || null;
  };

  const handleLinkKaster = async (kasterId: string) => {
    if (!linkingDisplayId || saving) return;
    setSaving(true);
    await supabase.from('gear_links').insert({ display_id: linkingDisplayId, kaster_id: kasterId });
    setLinkingDisplayId(null);
    await fetchData();
    setSaving(false);
  };

  const handleUnlink = async (gearId: string) => {
    const link = getLinkedPartner(gearId);
    if (!link || saving) return;
    setSaving(true);
    await supabase.from('gear_links').delete().eq('id', link.linkId);
    await fetchData();
    setSaving(false);
  };

  const startEdit = (item: GearItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      location: item.location || '',
      color_code: item.color_code || '',
      frequency: item.frequency || '',
      out_of_service: item.out_of_service,
      out_of_service_reason: item.out_of_service_reason || '',
      serial_numbers: item.serial_numbers || '',
      description: item.description || '',
      battery_change_date: item.battery_change_date && item.battery_change_date !== '0001-01-01' ? item.battery_change_date : '',
      emei_number: item.emei_number || '',
      har_gps: item.har_gps,
    });
    setLinkingDisplayId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId || saving) return;
    setSaving(true);
    await supabase.from('gear').update({
      name: editForm.name,
      location: editForm.location || null,
      color_code: editForm.color_code || null,
      frequency: editForm.frequency || null,
      out_of_service: editForm.out_of_service,
      out_of_service_reason: editForm.out_of_service_reason || null,
      serial_numbers: editForm.serial_numbers || null,
      description: editForm.description || null,
      battery_change_date: editForm.battery_change_date || null,
      emei_number: editForm.emei_number || null,
      har_gps: editForm.har_gps,
    }).eq('id', editingId);
    setEditingId(null);
    await fetchData();
    setSaving(false);
  };

  const openGpsTrack = () => {
    window.open('https://app.livegps.dk/objects', '_blank');
  };

  const printPdf = (pSortKey: SortKey, pSortDir: SortDir) => {
    const sorted = [...gear].sort((a, b) => {
      let aVal: string | boolean;
      let bVal: string | boolean;
      if (pSortKey === 'status') { aVal = a.out_of_service; bVal = b.out_of_service; }
      else { aVal = (a[pSortKey] || '').toLowerCase(); bVal = (b[pSortKey] || '').toLowerCase(); }
      if (aVal < bVal) return pSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return pSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const sortLabels: Record<SortKey, string> = {
      name: 'Navn', type: 'Type', status: 'Status', location: 'Sted',
      color_code: 'Farve', frequency: 'Frekvens', serial_numbers: 'Serienr.',
      battery_change_date: 'Batteri', emei_number: 'IMEI',
    };
    const colorDotHtml = (c: string | null) => {
      if (!c) return '';
      const colors: Record<string, string> = { lilla: '#a855f7', orange: '#f97316', 'blå': '#3b82f6', 'rød': '#ef4444', 'grøn': '#22c55e', pink: '#f472b6', sort: '#374151' };
      return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[c.toLowerCase()] || '#6b7280'};margin-right:5px;vertical-align:middle"></span>`;
    };

    const rows = sorted.map(item => {
      const partner = getPartnerName(item.id);
      const gpsIcon = item.har_gps ? `<span style="color:#f97316">&#9678; GPS</span>` : '';
      return `<tr>
        <td>${item.name}</td>
        <td>${item.type}</td>
        <td style="color:${item.out_of_service ? '#ef4444' : '#22c55e'}">${item.out_of_service ? 'Ude af drift' : 'I drift'}</td>
        <td>${item.location || '–'}</td>
        <td>${colorDotHtml(item.color_code)}${item.color_code || '–'}</td>
        <td>${item.frequency || '–'}</td>
        <td>${item.serial_numbers || '–'}</td>
        <td>${formatDate(item.battery_change_date)}</td>
        <td style="color:#f97316">${item.har_gps && item.serial_numbers ? 'Sys ' + item.serial_numbers : '–'}</td>
        <td>${partner || '–'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>TeamLazer Gear Oversigt</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #222; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 9px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a2e; color: #fff; text-align: left; padding: 4px 6px; font-size: 9px; text-transform: uppercase; white-space: nowrap; }
  td { padding: 4px 6px; border-bottom: 1px solid #ddd; white-space: nowrap; }
  tr:nth-child(even) { background: #f8f8f8; }
</style></head><body>
<h1>TeamLazer Gear Oversigt</h1>
<div class="meta">Sorteret efter: ${sortLabels[pSortKey]} (${pSortDir === 'asc' ? 'stigende' : 'faldende'}) &bull; Udskrevet: ${new Date().toLocaleDateString('da-DK')} &bull; ${displays.length} Displays, ${kasters.length} Kastere, ${links.length} Links</div>
<table>
  <thead><tr><th>Navn</th><th>Type</th><th>Status</th><th>Sted</th><th>Farve</th><th>Freq</th><th>Serie#</th><th>Batteri</th><th>LiveGPS</th><th>Linket til</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.setTimeout(() => w.print(), 400); }
    setShowPrintMenu(false);
  };

  const linkedKasterIds = new Set(links.map((l) => l.kaster_id));
  const linkedDisplayIds = new Set(links.map((l) => l.display_id));
  const availableKasters = kasters.filter((k) => !linkedKasterIds.has(k.id) && !k.out_of_service);

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-battle-orange" /> : <ArrowDown className="w-3 h-3 text-battle-orange" />;
  };

  const editInputCls = "bg-battle-dark border border-white/20 rounded px-1.5 py-1 text-white text-xs focus:border-battle-orange focus:outline-none";

  if (loading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader className="w-6 h-6 text-battle-orange animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-battle-grey/50 rounded-lg border border-white/10 p-2.5 text-center">
          <div className="text-xl font-bold text-white">{displays.length}</div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Monitor className="w-3 h-3" /> Displays</div>
        </div>
        <div className="bg-battle-grey/50 rounded-lg border border-white/10 p-2.5 text-center">
          <div className="text-xl font-bold text-white">{kasters.length}</div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Crosshair className="w-3 h-3" /> Kastere</div>
        </div>
        <div className="bg-battle-grey/50 rounded-lg border border-white/10 p-2.5 text-center">
          <div className="text-xl font-bold text-battle-orange">{links.length}</div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Link2 className="w-3 h-3" /> Linkede par</div>
        </div>
        <div className="bg-battle-grey/50 rounded-lg border border-white/10 p-2.5 text-center">
          <div className="text-xl font-bold text-orange-400">{gear.filter(g => g.har_gps).length}</div>
          <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Navigation className="w-3 h-3" /> LiveGPS</div>
        </div>
      </div>

      {/* Linking mode banner */}
      {linkingDisplayId && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3 flex items-center justify-between">
          <span className="text-blue-400 text-xs">
            Vælg kaster til <strong>{gear.find((g) => g.id === linkingDisplayId)?.name}</strong>
          </span>
          <button onClick={() => setLinkingDisplayId(null)} className="text-blue-400 hover:text-white text-xs underline">Annuller</button>
        </div>
      )}

      {/* Print button */}
      <div className="flex justify-end mb-2 relative">
        <button
          onClick={() => setShowPrintMenu(!showPrintMenu)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-battle-grey/50 hover:bg-battle-grey border border-white/10 rounded-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print som PDF
        </button>
        {showPrintMenu && (
          <div className="absolute top-full right-0 mt-1 z-50 bg-battle-dark border border-white/20 rounded-lg shadow-2xl p-2 w-48">
            <div className="text-[10px] text-gray-400 mb-1.5 font-medium">Sortér efter:</div>
            {([
              ['name', 'Navn'],
              ['type', 'Type'],
              ['status', 'Status'],
              ['location', 'Sted'],
              ['color_code', 'Farve'],
              ['frequency', 'Frekvens'],
              ['serial_numbers', 'Serienr.'],
              ['battery_change_date', 'Batteri skiftet'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => printPdf(key, 'asc')}
                className="w-full text-left px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-battle-grey/50 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {([
                  ['name', 'Navn'],
                  ['type', 'Type'],
                  ['status', 'Status'],
                  ['location', 'Sted'],
                  ['color_code', 'Farve'],
                  ['frequency', 'Freq'],
                  ['serial_numbers', 'Serie#'],
                  ['battery_change_date', 'Batteri'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="text-left px-2 py-2 text-gray-400 font-medium text-[11px] cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-0.5">
                      {label}
                      <SortIcon col={key} />
                    </div>
                  </th>
                ))}
                <th className="text-left px-2 py-2 text-orange-400 font-medium text-[11px] whitespace-nowrap">LiveGPS</th>
                <th className="text-left px-2 py-2 text-gray-400 font-medium text-[11px] whitespace-nowrap">Linket til</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedGear.map((item) => {
                const partner = getPartnerName(item.id);
                const linkColor = getLinkDisplayColor(item.id);
                const isLinked = linkColor !== null;
                const isDisplay = item.type === 'Display';
                const isKaster = item.type === 'Kaster';
                const isLinkTarget = linkingDisplayId && isKaster && !linkedKasterIds.has(item.id) && !item.out_of_service;
                const rowColor = isLinked ? getLinkRowColor(linkColor) : '';
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <tr key={item.id} className="border-b border-white/5 bg-battle-orange/5 border-l-2 border-l-battle-orange">
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={`${editInputCls} w-28`} />
                      </td>
                      <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{item.type}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <select
                          value={editForm.out_of_service ? 'true' : 'false'}
                          onChange={(e) => setEditForm({ ...editForm, out_of_service: e.target.value === 'true' })}
                          className={editInputCls}
                        >
                          <option value="false">OK</option>
                          <option value="true">Ude</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={`${editInputCls} w-24`} />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input value={editForm.color_code} onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })} className={`${editInputCls} w-16`} />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input value={editForm.frequency} onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })} className={`${editInputCls} w-10`} />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input value={editForm.serial_numbers} onChange={(e) => setEditForm({ ...editForm, serial_numbers: e.target.value })} className={`${editInputCls} w-14`} />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input type="date" value={editForm.battery_change_date} onChange={(e) => setEditForm({ ...editForm, battery_change_date: e.target.value })} className={`${editInputCls} w-28`} />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <label className="inline-flex items-center gap-0.5 text-[10px] text-orange-400" title="Har GPS">
                            <input type="checkbox" checked={editForm.har_gps} onChange={(e) => setEditForm({ ...editForm, har_gps: e.target.checked })} className="accent-orange-500 w-3 h-3" />
                          </label>
                          <input value={editForm.emei_number} onChange={(e) => setEditForm({ ...editForm, emei_number: e.target.value })} placeholder="IMEI..." className={`${editInputCls} w-24 text-[10px]`} />
                        </div>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {partner ? (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getLinkBadgeColorByGear(linkColor)}`}>
                            <Link2 className="w-2.5 h-2.5" />{partner}
                          </span>
                        ) : <span className="text-gray-600">–</span>}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={saveEdit} disabled={saving || !editForm.name.trim()}
                            className="p-1 text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded transition-colors disabled:opacity-40" title="Gem">
                            <Save className="w-3 h-3" />
                          </button>
                          <button onClick={cancelEdit}
                            className="p-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors" title="Annuller">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-white/5 transition-colors ${
                      isLinkTarget ? 'bg-blue-500/5 hover:bg-blue-500/15 cursor-pointer' : 'hover:bg-white/5'
                    } ${isLinked ? `border-l-2 ${rowColor}` : ''}`}
                    onClick={() => isLinkTarget ? handleLinkKaster(item.id) : undefined}
                  >
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isDisplay ? <Monitor className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> : <Crosshair className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                        <span className="text-white font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{item.type}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {item.out_of_service ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/15 text-red-400 border border-red-500/30" title={item.out_of_service_reason || undefined}>
                          <AlertCircle className="w-2.5 h-2.5" /> Ude
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-green-500/15 text-green-400 border border-green-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{item.location || '–'}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <span className="flex items-center text-gray-300">
                        {getColorDot(item.color_code)}
                        {item.color_code || '–'}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{item.frequency || '–'}</td>
                    <td className="px-2 py-1.5 text-gray-400 whitespace-nowrap">{item.serial_numbers || '–'}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {item.battery_change_date && item.battery_change_date !== '0001-01-01' ? (
                        <span className="text-gray-400 text-[10px]">{formatDate(item.battery_change_date)}</span>
                      ) : <span className="text-gray-600">–</span>}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {item.har_gps && item.serial_numbers ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); openGpsTrack(); }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-colors cursor-pointer"
                          title={`Åbn LiveGPS → find Sys ${item.serial_numbers} (IMEI: ${item.emei_number || '–'})`}
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          Sys {item.serial_numbers}
                        </button>
                      ) : <span className="text-gray-600">–</span>}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {partner ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getLinkBadgeColorByGear(linkColor)}`}>
                          <Link2 className="w-2.5 h-2.5" />{partner}
                        </span>
                      ) : <span className="text-gray-600">–</span>}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                          disabled={saving}
                          className="p-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors disabled:opacity-40"
                          title="Rediger"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {isLinked ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUnlink(item.id); }}
                            disabled={saving}
                            className="p-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors disabled:opacity-40"
                            title="Fjern link"
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                        ) : isDisplay && !linkedDisplayIds.has(item.id) && !item.out_of_service ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setLinkingDisplayId(item.id); }}
                            disabled={saving || availableKasters.length === 0}
                            className="p-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded transition-colors disabled:opacity-40"
                            title="Link til kaster"
                          >
                            <Link2 className="w-3 h-3" />
                          </button>
                        ) : isLinkTarget ? (
                          <span className="text-blue-400 text-[10px] font-medium">Vælg</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamLazerGearList;
