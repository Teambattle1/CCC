import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, Loader, ChevronDown, ChevronRight, Save, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ACTIVITY_SLUGS, getActivityName } from '../lib/activityNames';

interface MaintItem {
  id: string;
  name: string;
  activity_slug: string;
  geartype_name: string;
  color_code: string | null;
  maintenance_date: string | null;
  next_checkup: string | null;
  maintenance_note: string | null;
  out_of_service: boolean;
}

const AdminMaintenance: React.FC = () => {
  const [items, setItems] = useState<MaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ maintenance_date: '', next_checkup: '', maintenance_note: '' });
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gear')
      .select('id, name, activity_slug, color_code, maintenance_date, next_checkup, maintenance_note, out_of_service, geartype_id, geartypes(name)')
      .order('activity_slug')
      .order('name');

    if (!error && data) {
      const mapped: MaintItem[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        activity_slug: d.activity_slug,
        geartype_name: d.geartypes?.name || '?',
        color_code: d.color_code,
        maintenance_date: d.maintenance_date,
        next_checkup: d.next_checkup,
        maintenance_note: d.maintenance_note,
        out_of_service: d.out_of_service,
      }));
      setItems(mapped);
      // Auto-expand all
      const slugs = new Set(mapped.map(i => i.activity_slug));
      setExpandedSlugs(slugs);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleSlug = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const startEdit = (item: MaintItem) => {
    setEditingId(item.id);
    setEditForm({
      maintenance_date: item.maintenance_date || '',
      next_checkup: item.next_checkup || '',
      maintenance_note: item.maintenance_note || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await supabase
      .from('gear')
      .update({
        maintenance_date: editForm.maintenance_date || null,
        next_checkup: editForm.next_checkup || null,
        maintenance_note: editForm.maintenance_note || null,
      })
      .eq('id', editingId);

    setItems(prev => prev.map(i =>
      i.id === editingId
        ? { ...i, maintenance_date: editForm.maintenance_date || null, next_checkup: editForm.next_checkup || null, maintenance_note: editForm.maintenance_note || null }
        : i
    ));
    setEditingId(null);
    setSaving(false);
  };

  /** Determine row urgency color based on next_checkup */
  const getCheckupStatus = (next_checkup: string | null): 'overdue' | 'soon' | 'ok' | 'none' => {
    if (!next_checkup) return 'none';
    const now = new Date();
    const checkDate = new Date(next_checkup);
    const diffDays = (checkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'overdue';
    if (diffDays < 30) return 'soon';
    return 'ok';
  };

  const statusBorder: Record<string, string> = {
    overdue: 'border-l-4 border-l-red-500 bg-red-500/5',
    soon: 'border-l-4 border-l-yellow-500 bg-yellow-500/5',
    ok: '',
    none: '',
  };

  // Group items by activity_slug
  const grouped: Record<string, MaintItem[]> = {};
  for (const item of items) {
    if (!grouped[item.activity_slug]) grouped[item.activity_slug] = [];
    grouped[item.activity_slug].push(item);
  }

  // Sort items in each group: overdue first, then soon, then by next_checkup date
  for (const slug of Object.keys(grouped)) {
    grouped[slug].sort((a, b) => {
      const sa = getCheckupStatus(a.next_checkup);
      const sb = getCheckupStatus(b.next_checkup);
      const priority: Record<string, number> = { overdue: 0, soon: 1, ok: 2, none: 3 };
      if (priority[sa] !== priority[sb]) return priority[sa] - priority[sb];
      if (a.next_checkup && b.next_checkup) return a.next_checkup.localeCompare(b.next_checkup);
      if (a.next_checkup) return -1;
      if (b.next_checkup) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const orderedSlugs = ACTIVITY_SLUGS.filter(s => grouped[s]);
  const extraSlugs = Object.keys(grouped).filter(s => !ACTIVITY_SLUGS.includes(s as any));
  const allSlugs = [...orderedSlugs, ...extraSlugs];

  // Counts
  const overdueCount = items.filter(i => getCheckupStatus(i.next_checkup) === 'overdue').length;
  const soonCount = items.filter(i => getCheckupStatus(i.next_checkup) === 'soon').length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Wrench className="text-yellow-500" size={28} />
        <h1 className="text-2xl font-bold text-white">Vedligeholdelse</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{items.length}</div>
          <div className="text-xs text-gray-400">Total gear</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{overdueCount}</div>
          <div className="text-xs text-red-400">Overskredet</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{soonCount}</div>
          <div className="text-xs text-yellow-400">Inden 30 dage</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{items.filter(i => getCheckupStatus(i.next_checkup) === 'ok').length}</div>
          <div className="text-xs text-green-400">OK</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-orange-500" size={32} />
          <span className="ml-3 text-gray-400">Henter gear...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {allSlugs.map(slug => {
            const groupItems = grouped[slug];
            const isExpanded = expandedSlugs.has(slug);
            const groupOverdue = groupItems.filter(i => getCheckupStatus(i.next_checkup) === 'overdue').length;
            return (
              <div key={slug} className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleSlug(slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  <span className="font-bold text-orange-400">{getActivityName(slug)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-600/50 text-gray-300 text-xs font-bold">
                    {groupItems.length}
                  </span>
                  {groupOverdue > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={10} /> {groupOverdue} overskredet
                    </span>
                  )}
                </button>

                {/* Items table */}
                {isExpanded && (
                  <div className="border-t border-gray-700 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs uppercase">
                          <th className="px-4 py-2 text-left">Navn</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Farve</th>
                          <th className="px-4 py-2 text-left">Senest vedligeholdt</th>
                          <th className="px-4 py-2 text-left">Næste checkup</th>
                          <th className="px-4 py-2 text-left">Note</th>
                          <th className="px-4 py-2 text-right">Handling</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupItems.map(item => {
                          const status = getCheckupStatus(item.next_checkup);
                          const isEditing = editingId === item.id;

                          return (
                            <tr key={item.id} className={`border-t border-gray-700/50 hover:bg-gray-700/30 ${statusBorder[status]}`}>
                              <td className="px-4 py-2 text-white font-medium">
                                {item.name}
                                {item.out_of_service && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold">UDE AF DRIFT</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-300">{item.geartype_name}</td>
                              <td className="px-4 py-2 text-gray-300">{item.color_code || '–'}</td>

                              {isEditing ? (
                                <>
                                  <td className="px-4 py-1">
                                    <input
                                      type="date"
                                      value={editForm.maintenance_date}
                                      onChange={e => setEditForm(f => ({ ...f, maintenance_date: e.target.value }))}
                                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-1">
                                    <input
                                      type="date"
                                      value={editForm.next_checkup}
                                      onChange={e => setEditForm(f => ({ ...f, next_checkup: e.target.value }))}
                                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-1">
                                    <input
                                      type="text"
                                      value={editForm.maintenance_note}
                                      onChange={e => setEditForm(f => ({ ...f, maintenance_note: e.target.value }))}
                                      placeholder="Note..."
                                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-1 text-right whitespace-nowrap">
                                    <button
                                      onClick={saveEdit}
                                      disabled={saving}
                                      className="px-2 py-1 rounded bg-orange-600/20 text-orange-400 hover:bg-orange-600/40 text-xs font-bold mr-1"
                                    >
                                      {saving ? <Loader className="animate-spin inline" size={12} /> : <Save size={12} className="inline" />} Gem
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="px-2 py-1 rounded bg-gray-600/20 text-gray-400 hover:bg-gray-600/40 text-xs"
                                    >
                                      Annuller
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-gray-300">
                                    {item.maintenance_date ? (
                                      <span className="flex items-center gap-1">
                                        <Calendar size={12} className="text-gray-500" />
                                        {item.maintenance_date}
                                      </span>
                                    ) : (
                                      <span className="text-gray-600">–</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {item.next_checkup ? (
                                      <span className={`flex items-center gap-1 font-medium ${
                                        status === 'overdue' ? 'text-red-400' :
                                        status === 'soon' ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {status === 'overdue' && <AlertTriangle size={12} />}
                                        {status === 'ok' && <CheckCircle2 size={12} />}
                                        {item.next_checkup}
                                      </span>
                                    ) : (
                                      <span className="text-gray-600">–</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-gray-400 italic max-w-[200px] truncate">
                                    {item.maintenance_note || '–'}
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="px-3 py-1 rounded bg-orange-600/20 text-orange-400 hover:bg-orange-600/40 text-xs font-bold transition-colors"
                                    >
                                      Rediger
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMaintenance;
