import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, CheckCircle2, Loader, Pencil, X, Save, Printer, MapPin, ShoppingCart } from 'lucide-react';
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
  serial_numbers: string | null;
  description: string | null;
  battery_change_date: string | null;
  maintenance_date: string | null;
  maintenance_note: string | null;
  next_checkup: string | null;
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
  maintenance_date: string;
  maintenance_note: string;
  next_checkup: string;
}

type SortKey = 'name' | 'type' | 'location' | 'color_code' | 'frequency' | 'status' | 'serial_numbers' | 'maintenance_date';
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

function formatDate(d: string | null): string {
  if (!d || d === '0001-01-01') return '–';
  try {
    return new Date(d).toLocaleDateString('da-DK');
  } catch {
    return d;
  }
}

interface ActivityGearListProps {
  activitySlug: string;
  activityName: string;
}

const ActivityGearList: React.FC<ActivityGearListProps> = ({ activitySlug, activityName }) => {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', location: '', color_code: '', frequency: '', out_of_service: false,
    out_of_service_reason: '', serial_numbers: '', description: '', battery_change_date: '',
    maintenance_date: '', maintenance_note: '', next_checkup: '',
  });
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showShoppingNote, setShowShoppingNote] = useState(false);
  const [shoppingNote, setShoppingNote] = useState('');
  const [shoppingSaving, setShoppingSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'oos'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gear')
      .select('id, name, activity_slug, color_code, location, frequency, out_of_service, out_of_service_reason, serial_numbers, description, battery_change_date, maintenance_date, maintenance_note, next_checkup, geartype_id, geartypes(name)')
      .eq('activity_slug', activitySlug)
      .order('name');

    if (!error && data) {
      setGear(
        data.map((g: any) => ({
          id: g.id,
          name: g.name,
          type: g.geartypes?.name || '?',
          location: g.location || null,
          color_code: g.color_code || null,
          frequency: g.frequency || null,
          out_of_service: g.out_of_service || false,
          out_of_service_reason: g.out_of_service_reason || null,
          serial_numbers: g.serial_numbers || null,
          description: g.description || null,
          battery_change_date: g.battery_change_date || null,
          maintenance_date: g.maintenance_date || null,
          maintenance_note: g.maintenance_note || null,
          next_checkup: g.next_checkup || null,
        }))
      );
    }
    setLoading(false);
  }, [activitySlug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load shopping note
  useEffect(() => {
    supabase.from('gear_shopping_notes').select('note').eq('activity_slug', activitySlug).single()
      .then(({ data }) => { if (data) setShoppingNote(data.note || ''); });
  }, [activitySlug]);

  const saveShoppingNote = async () => {
    setShoppingSaving(true);
    // Try update first; if no row, insert
    const { data } = await supabase.from('gear_shopping_notes').select('activity_slug').eq('activity_slug', activitySlug).single();
    if (data) {
      await supabase.from('gear_shopping_notes').update({ note: shoppingNote, updated_at: new Date().toISOString() }).eq('activity_slug', activitySlug);
    } else {
      await supabase.from('gear_shopping_notes').insert({ activity_slug: activitySlug, note: shoppingNote });
    }
    setShoppingSaving(false);
  };

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
    if (sortKey === 'status') { aVal = a.out_of_service; bVal = b.out_of_service; }
    else { aVal = (a[sortKey] || '').toLowerCase(); bVal = (b[sortKey] || '').toLowerCase(); }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredGear = sortedGear.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'oos') return item.out_of_service;
    return true;
  });

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
      battery_change_date: item.battery_change_date || '',
      maintenance_date: item.maintenance_date || '',
      maintenance_note: item.maintenance_note || '',
      next_checkup: item.next_checkup || '',
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const updates = {
      name: editForm.name,
      location: editForm.location || null,
      color_code: editForm.color_code || null,
      frequency: editForm.frequency || null,
      out_of_service: editForm.out_of_service,
      out_of_service_reason: editForm.out_of_service ? editForm.out_of_service_reason || null : null,
      serial_numbers: editForm.serial_numbers || null,
      description: editForm.description || null,
      battery_change_date: editForm.battery_change_date || null,
      maintenance_date: editForm.maintenance_date || null,
      maintenance_note: editForm.maintenance_note || null,
      next_checkup: editForm.next_checkup || null,
    };
    await supabase.from('gear').update(updates).eq('id', editingId);
    setGear(prev => prev.map(g => g.id === editingId ? { ...g, ...updates, type: g.type } : g));
    setEditingId(null);
    setSaving(false);
  };

  const toggleOOS = async (item: GearItem) => {
    const newVal = !item.out_of_service;
    await supabase.from('gear').update({ out_of_service: newVal, out_of_service_reason: newVal ? item.out_of_service_reason : null }).eq('id', item.id);
    setGear(prev => prev.map(g => g.id === item.id ? { ...g, out_of_service: newVal } : g));
  };

  // Stat counts
  const totalCount = gear.length;
  const oosCount = gear.filter(g => g.out_of_service).length;
  const types = [...new Set(gear.map(g => g.type))];

  // Print PDF
  const sortLabels: Record<SortKey, string> = {
    name: 'Navn', type: 'Type', status: 'Status', location: 'Sted',
    color_code: 'Farve', frequency: 'Frekvens', serial_numbers: 'Serienr.',
    maintenance_date: 'Vedligehold',
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

    const colorDotHtml = (c: string | null) => {
      if (!c) return '';
      const colors: Record<string, string> = { lilla: '#a855f7', orange: '#f97316', 'blå': '#3b82f6', 'rød': '#ef4444', 'grøn': '#22c55e', pink: '#f472b6', sort: '#374151' };
      return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[c.toLowerCase()] || '#6b7280'};margin-right:5px;vertical-align:middle"></span>`;
    };

    const rows = sorted.map(item => {
      return `<tr>
        <td>${item.name}</td>
        <td>${item.type}</td>
        <td style="color:${item.out_of_service ? '#ef4444' : '#22c55e'}">${item.out_of_service ? 'Ude af drift' : 'I drift'}</td>
        <td>${item.location || '–'}</td>
        <td>${colorDotHtml(item.color_code)}${item.color_code || '–'}</td>
        <td>${item.frequency || '–'}</td>
        <td>${item.serial_numbers || '–'}</td>
        <td>${formatDate(item.maintenance_date)}${item.maintenance_note ? '<br><small style="color:#888">' + item.maintenance_note + '</small>' : ''}${item.next_checkup ? '<br><small style="color:#3b82f6">Checkup: ' + formatDate(item.next_checkup) + '</small>' : ''}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>${activityName} Gear Oversigt</title>
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
<h1>${activityName} Gear Oversigt</h1>
<div class="meta">Sorteret efter: ${sortLabels[pSortKey]} (${pSortDir === 'asc' ? 'stigende' : 'faldende'}) &bull; Udskrevet: ${new Date().toLocaleDateString('da-DK')} &bull; ${totalCount} enheder, ${oosCount} ude af drift</div>
<table>
  <thead><tr><th>Navn</th><th>Type</th><th>Status</th><th>Sted</th><th>Farve</th><th>Freq</th><th>Serie#</th><th>Vedligehold</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.setTimeout(() => w.print(), 400); }
    setShowPrintMenu(false);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="text-gray-500 ml-1 inline" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-orange-400 ml-1 inline" />
      : <ArrowDown size={12} className="text-orange-400 ml-1 inline" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-orange-500" size={32} />
        <span className="ml-3 text-gray-400">Henter {activityName} gear...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-white">{activityName} – Gear Oversigt</h1>
        <div className="flex gap-2">
          {/* Print */}
          <div className="relative">
            <button
              onClick={() => setShowPrintMenu(!showPrintMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" /> Print som PDF
            </button>
            {showPrintMenu && (
              <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-2 min-w-[180px]">
                <p className="text-[10px] text-gray-400 px-2 mb-1">Sortér efter:</p>
                {(Object.keys(sortLabels) as SortKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => printPdf(key, 'asc')}
                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 rounded"
                  >
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Shopping */}
          <button
            onClick={() => setShowShoppingNote(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 text-xs font-bold"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Indkøb
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => setActiveFilter(activeFilter === 'all' ? 'all' : 'all')}
          className={`p-3 rounded-lg border text-center transition-colors ${activeFilter === 'all' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'}`}
        >
          <div className="text-2xl font-bold text-white">{totalCount}</div>
          <div className="text-xs text-gray-400">Total</div>
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'oos' ? 'all' : 'oos')}
          className={`p-3 rounded-lg border text-center transition-colors ${activeFilter === 'oos' ? 'border-red-500 bg-red-500/10' : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'}`}
        >
          <div className="text-2xl font-bold text-red-400">{oosCount}</div>
          <div className="text-xs text-gray-400">Ude af drift</div>
        </button>
        <div className="p-3 rounded-lg border border-gray-700 bg-gray-800/50 text-center">
          <div className="text-2xl font-bold text-green-400">{totalCount - oosCount}</div>
          <div className="text-xs text-gray-400">I drift</div>
        </div>
      </div>

      {/* Filter indicator */}
      {activeFilter !== 'all' && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="text-orange-400 font-bold">Filtreret:</span>
          <span className="text-gray-300">Ude af drift ({oosCount})</span>
          <button onClick={() => setActiveFilter('all')} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Gear count by type */}
      {types.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {types.map(t => (
            <span key={t} className="px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 text-xs">
              {t}: {gear.filter(g => g.type === t).length}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      {filteredGear.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={40} />
          <p className="text-gray-400">Ingen gear fundet for {activityName}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>Navn <SortIcon k="name" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('type')}>Type <SortIcon k="type" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('status')}>Status <SortIcon k="status" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('location')}>Sted <SortIcon k="location" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('color_code')}>Farve <SortIcon k="color_code" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('frequency')}>Freq <SortIcon k="frequency" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('serial_numbers')}>Serie# <SortIcon k="serial_numbers" /></th>
                <th className="px-3 py-2 text-left cursor-pointer" onClick={() => handleSort('maintenance_date')}>Vedligehold <SortIcon k="maintenance_date" /></th>
                <th className="px-3 py-2 text-right">Handling</th>
              </tr>
            </thead>
            <tbody>
              {filteredGear.map(item => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <tr key={item.id} className="border-b border-gray-700 bg-gray-800/80">
                      <td colSpan={9} className="px-3 py-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Navn</label>
                            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Sted</label>
                            <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Farve</label>
                            <input value={editForm.color_code} onChange={e => setEditForm(f => ({ ...f, color_code: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Frekvens</label>
                            <input value={editForm.frequency} onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Serienummer</label>
                            <input value={editForm.serial_numbers} onChange={e => setEditForm(f => ({ ...f, serial_numbers: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Beskrivelse</label>
                            <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Senest vedligeholdt</label>
                            <input type="date" value={editForm.maintenance_date} onChange={e => setEditForm(f => ({ ...f, maintenance_date: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Næste checkup</label>
                            <input type="date" value={editForm.next_checkup} onChange={e => setEditForm(f => ({ ...f, next_checkup: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Vedligehold note</label>
                            <input value={editForm.maintenance_note} onChange={e => setEditForm(f => ({ ...f, maintenance_note: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Batteri skiftet</label>
                            <input type="date" value={editForm.battery_change_date} onChange={e => setEditForm(f => ({ ...f, battery_change_date: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                          </div>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input type="checkbox" checked={editForm.out_of_service} onChange={e => setEditForm(f => ({ ...f, out_of_service: e.target.checked }))}
                                className="rounded bg-gray-700 border-gray-600" />
                              <span className="text-red-400">Ude af drift</span>
                            </label>
                          </div>
                          {editForm.out_of_service && (
                            <div>
                              <label className="text-gray-400 text-[10px] uppercase block mb-0.5">Årsag</label>
                              <input value={editForm.out_of_service_reason} onChange={e => setEditForm(f => ({ ...f, out_of_service_reason: e.target.value }))}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={saveEdit} disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 disabled:opacity-50">
                            {saving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />} Gem
                          </button>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-gray-700 text-gray-300 text-xs hover:bg-gray-600">
                            <X size={12} /> Annuller
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${item.out_of_service ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-2 text-white font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-gray-300">{item.type}</td>
                    <td className="px-3 py-2">
                      {item.out_of_service ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                          <AlertCircle size={12} /> Ude af drift
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle2 size={12} /> I drift
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-white">
                      {item.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-orange-400" /> {item.location}
                        </span>
                      ) : '–'}
                    </td>
                    <td className="px-3 py-2 text-white">
                      {item.color_code ? (
                        <span className="flex items-center">{getColorDot(item.color_code)} {item.color_code}</span>
                      ) : '–'}
                    </td>
                    <td className="px-3 py-2 text-white">{item.frequency || '–'}</td>
                    <td className="px-3 py-2 text-white">{item.serial_numbers || '–'}</td>
                    <td className="px-3 py-2">
                      <div className="text-white text-xs">
                        {item.maintenance_date ? formatDate(item.maintenance_date) : '–'}
                      </div>
                      {item.next_checkup && (
                        <div className={`text-[10px] ${
                          new Date(item.next_checkup) < new Date() ? 'text-red-400' :
                          (new Date(item.next_checkup).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000 ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          Checkup: {formatDate(item.next_checkup)}
                        </div>
                      )}
                      {item.maintenance_note && (
                        <div className="text-[10px] text-gray-500 italic truncate max-w-[150px]">{item.maintenance_note}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => startEdit(item)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400 transition-colors"
                        title="Rediger"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Shopping Note Modal */}
      {showShoppingNote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowShoppingNote(false)}>
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-yellow-400" />
                Indkøbsliste – {activityName}
              </h2>
              <button onClick={() => setShowShoppingNote(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <textarea
              value={shoppingNote}
              onChange={e => setShoppingNote(e.target.value)}
              rows={10}
              placeholder="Skriv hvad der skal indkøbes..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowShoppingNote(false)} className="px-4 py-2 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">Luk</button>
              <button onClick={saveShoppingNote} disabled={shoppingSaving}
                className="px-4 py-2 rounded bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1">
                {shoppingSaving ? <Loader className="animate-spin" size={14} /> : <Save size={14} />} Gem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGearList;
