import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Calendar, User, Wrench, CheckCircle2, XCircle, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FejlReport {
  id: string;
  activity: string;
  activity_name: string;
  date: string;
  gear: string;
  description: string;
  image_url: string | null;
  reported_by: string;
  reported_by_name: string;
  created_at: string;
  resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

const ACTIVITY_COLORS: Record<string, string> = {
  teamlazer: 'blue',
  teamrobin: 'green',
  teamsegway: 'red',
  teamcontrol: 'purple',
  teamconstruct: 'orange',
  teamconnect: 'cyan',
  teambox: 'gray',
  teamaction: 'pink',
  teamchallenge: 'yellow',
  loquiz: 'lightblue',
  teamplay: 'indigo',
  teamtaste: 'gold'
};

const AdminReports: React.FC = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<FejlReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'activity'>('date');

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('fejlsogning_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Kunne ikke hente rapporter: ' + fetchError.message);
        return;
      }

      setReports(data || []);
    } catch (err) {
      setError('Fejl ved hentning af rapporter');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const toggleResolved = async (report: FejlReport) => {
    try {
      const newResolved = !report.resolved;
      const { error: updateError } = await supabase
        .from('fejlsogning_reports')
        .update({
          resolved: newResolved,
          resolved_by: newResolved ? profile?.name || profile?.email : null,
          resolved_at: newResolved ? new Date().toISOString() : null
        })
        .eq('id', report.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }

      setReports(prev => prev.map(r =>
        r.id === report.id
          ? {
              ...r,
              resolved: newResolved,
              resolved_by: newResolved ? profile?.name || profile?.email || undefined : undefined,
              resolved_at: newResolved ? new Date().toISOString() : undefined
            }
          : r
      ));
    } catch (err) {
      console.error('Error toggling resolved:', err);
    }
  };

  const deleteReport = async (report: FejlReport) => {
    if (!confirm('Er du sikker på at du vil slette denne rapport?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('fejlsogning_reports')
        .delete()
        .eq('id', report.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return;
      }

      setReports(prev => prev.filter(r => r.id !== report.id));
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const filteredReports = reports
    .filter(r => filterActivity === 'all' || r.activity === filterActivity)
    .filter(r => {
      if (filterStatus === 'open') return !r.resolved;
      if (filterStatus === 'resolved') return r.resolved;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.activity.localeCompare(b.activity);
    });

  const uniqueActivities = [...new Set(reports.map(r => r.activity))];
  const openCount = reports.filter(r => !r.resolved).length;
  const resolvedCount = reports.filter(r => r.resolved).length;

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      lightblue: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      gold: 'bg-amber-500/20 border-amber-500/30 text-amber-400'
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <div className="w-12 h-12 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Henter rapporter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
              <AlertTriangle className="w-6 h-6 tablet:w-8 tablet:h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg tablet:text-xl font-bold text-white uppercase tracking-wider">
                Fejlrapporter
              </h2>
              <p className="text-xs tablet:text-sm text-yellow-400">
                {openCount} åbne | {resolvedCount} løste
              </p>
            </div>
          </div>
          <button
            onClick={loadReports}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value)}
            className="bg-battle-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
          >
            <option value="all">Alle aktiviteter</option>
            {uniqueActivities.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'open' | 'resolved')}
            className="bg-battle-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
          >
            <option value="all">Alle status</option>
            <option value="open">Åbne</option>
            <option value="resolved">Løste</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'activity')}
            className="bg-battle-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
          >
            <option value="date">Sortér efter dato</option>
            <option value="activity">Sortér efter aktivitet</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ingen rapporter fundet</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isExpanded = expandedId === report.id;
              const colorClasses = getColorClasses(ACTIVITY_COLORS[report.activity] || 'gray');

              return (
                <div
                  key={report.id}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    report.resolved
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-battle-black/30 border-white/10'
                  }`}
                >
                  {/* Report Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${colorClasses}`}>
                        {report.activity_name || report.activity}
                      </span>
                      <span className="text-sm text-white">{report.gear}</span>
                      {report.resolved && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString('da-DK')}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-white/10 pt-3">
                      <div className="space-y-3">
                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(report.date).toLocaleDateString('da-DK')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{report.reported_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            <span>{report.gear}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 bg-battle-black/30 rounded-lg">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">
                            {report.description}
                          </p>
                        </div>

                        {/* Image */}
                        {report.image_url && (
                          <a
                            href={report.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={report.image_url}
                              alt="Attached"
                              loading="lazy"
                              className="w-full max-h-48 object-cover rounded-lg border border-white/10"
                            />
                          </a>
                        )}

                        {/* Resolved info */}
                        {report.resolved && report.resolved_by && (
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              Løst af {report.resolved_by} den{' '}
                              {report.resolved_at && new Date(report.resolved_at).toLocaleDateString('da-DK')}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => toggleResolved(report)}
                            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm uppercase transition-colors ${
                              report.resolved
                                ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {report.resolved ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                Genåbn
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Markér Løst
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteReport(report)}
                            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
