import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ACTIVITY_SLUGS, getActivityName } from '../lib/activityNames';

interface OOSItem {
  id: string;
  name: string;
  activity_slug: string;
  geartype_name: string;
  color_code: string | null;
  location: string | null;
  out_of_service_reason: string | null;
  serial_numbers: string | null;
}

const AdminGearOutOfService: React.FC = () => {
  const [items, setItems] = useState<OOSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchOOS = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gear')
      .select('id, name, activity_slug, color_code, location, out_of_service_reason, serial_numbers, geartype_id, geartypes(name)')
      .eq('out_of_service', true)
      .order('activity_slug')
      .order('name');

    if (!error && data) {
      const mapped: OOSItem[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        activity_slug: d.activity_slug,
        geartype_name: d.geartypes?.name || '?',
        color_code: d.color_code,
        location: d.location,
        out_of_service_reason: d.out_of_service_reason,
        serial_numbers: d.serial_numbers,
      }));
      setItems(mapped);
      // Auto-expand all groups
      const slugs = new Set(mapped.map(i => i.activity_slug));
      setExpandedSlugs(slugs);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOOS(); }, []);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    await supabase
      .from('gear')
      .update({ out_of_service: false, out_of_service_reason: null })
      .eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setRestoringId(null);
  };

  const toggleSlug = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Group items by activity_slug
  const grouped: Record<string, OOSItem[]> = {};
  for (const item of items) {
    if (!grouped[item.activity_slug]) grouped[item.activity_slug] = [];
    grouped[item.activity_slug].push(item);
  }

  // Order by ACTIVITY_SLUGS, then any remaining
  const orderedSlugs = ACTIVITY_SLUGS.filter(s => grouped[s]);
  const extraSlugs = Object.keys(grouped).filter(s => !ACTIVITY_SLUGS.includes(s as any));
  const allSlugs = [...orderedSlugs, ...extraSlugs];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="text-red-500" size={28} />
        <h1 className="text-2xl font-bold text-white">Gear ude af drift</h1>
        <span className="ml-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
          {items.length} enheder
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-orange-500" size={32} />
          <span className="ml-3 text-gray-400">Henter gear...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
          <p className="text-green-400 text-lg font-semibold">Alt gear er i drift!</p>
          <p className="text-gray-500 mt-1">Ingen enheder er markeret ude af drift.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allSlugs.map(slug => {
            const groupItems = grouped[slug];
            const isExpanded = expandedSlugs.has(slug);
            return (
              <div key={slug} className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleSlug(slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                  <span className="font-bold text-orange-400">{getActivityName(slug)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                    {groupItems.length}
                  </span>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="border-t border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs uppercase">
                          <th className="px-4 py-2 text-left">Navn</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Farve</th>
                          <th className="px-4 py-2 text-left">Sted</th>
                          <th className="px-4 py-2 text-left">Årsag</th>
                          <th className="px-4 py-2 text-right">Handling</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupItems.map(item => (
                          <tr key={item.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                            <td className="px-4 py-2 text-white font-medium">{item.name}</td>
                            <td className="px-4 py-2 text-gray-300">{item.geartype_name}</td>
                            <td className="px-4 py-2 text-gray-300">{item.color_code || '–'}</td>
                            <td className="px-4 py-2 text-gray-300">
                              {item.location ? (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-orange-400" />
                                  {item.location}
                                </span>
                              ) : '–'}
                            </td>
                            <td className="px-4 py-2 text-red-400 italic max-w-[200px] truncate">
                              {item.out_of_service_reason || '–'}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleRestore(item.id)}
                                disabled={restoringId === item.id}
                                className="px-3 py-1 rounded bg-green-600/20 text-green-400 hover:bg-green-600/40 text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {restoringId === item.id ? (
                                  <Loader className="animate-spin inline" size={12} />
                                ) : (
                                  'Genaktiver'
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
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

export default AdminGearOutOfService;
