import React, { useState, useEffect } from 'react';
import { Package, Clock, User, Calendar, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Completion {
  id: string;
  activity: string;
  list_type: string;
  completed_by: string;
  completed_by_name: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  items_checked: number;
  items_total: number;
}

const ACTIVITY_NAMES: Record<string, string> = {
  teambox: 'TeamBox',
  teamcontrol: 'TeamControl',
  teamconstruct: 'TeamConstruct',
  teamlazer: 'TeamLazer',
  teamrobin: 'TeamRobin',
  teamsegway: 'TeamSegway',
  teamconnect: 'TeamConnect',
  teamaction: 'TeamAction',
  teamchallenge: 'TeamChallenge',
};

const LIST_TYPE_NAMES: Record<string, string> = {
  afgang: 'Afgang',
  hjemkomst: 'Hjemkomst',
  before: 'Før Opgaven',
  after: 'Efter Opgaven',
  nulstil: 'Nulstil Box',
};

const AdminPackingCompletions: React.FC = () => {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterActivity, setFilterActivity] = useState<string>('all');

  useEffect(() => {
    loadCompletions();
  }, []);

  const loadCompletions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('packing_list_completions')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading completions:', error);
        return;
      }

      setCompletions(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCompletion = async (id: string) => {
    if (!confirm('Slet denne registrering?')) return;

    try {
      const { error } = await supabase
        .from('packing_list_completions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting:', error);
        return;
      }

      setCompletions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}t ${remainingMins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCompletions = filterActivity === 'all'
    ? completions
    : completions.filter(c => c.activity === filterActivity);

  // Get unique activities for filter
  const uniqueActivities = [...new Set(completions.map(c => c.activity))];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 tablet:w-8 tablet:h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg tablet:text-xl font-bold text-white uppercase tracking-wider">
                Udfyldte Pakkelister
              </h2>
              <p className="text-xs tablet:text-sm text-green-400 uppercase">Admin Oversigt</p>
            </div>
          </div>
          <button
            onClick={loadCompletions}
            className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value)}
            className="w-full tablet:w-auto bg-battle-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
          >
            <option value="all">Alle Aktiviteter</option>
            {uniqueActivities.map(activity => (
              <option key={activity} value={activity}>
                {ACTIVITY_NAMES[activity] || activity}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-battle-black/30 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{filteredCompletions.length}</div>
            <div className="text-xs text-gray-500 uppercase">Total</div>
          </div>
          <div className="bg-battle-black/30 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-battle-orange">
              {filteredCompletions.length > 0
                ? formatDuration(Math.round(filteredCompletions.reduce((sum, c) => sum + c.duration_seconds, 0) / filteredCompletions.length))
                : '-'}
            </div>
            <div className="text-xs text-gray-500 uppercase">Gns. Tid</div>
          </div>
          <div className="bg-battle-black/30 border border-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {filteredCompletions.filter(c => {
                const today = new Date().toDateString();
                return new Date(c.completed_at).toDateString() === today;
              }).length}
            </div>
            <div className="text-xs text-gray-500 uppercase">I Dag</div>
          </div>
        </div>

        {/* Completions List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Indlæser...</p>
          </div>
        ) : filteredCompletions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Ingen udfyldte pakkelister</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {filteredCompletions.map((completion) => (
              <div
                key={completion.id}
                className="bg-battle-black/30 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 uppercase">
                        {ACTIVITY_NAMES[completion.activity] || completion.activity}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 uppercase">
                        {LIST_TYPE_NAMES[completion.list_type] || completion.list_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 tablet:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User className="w-4 h-4" />
                        <span className="truncate">{completion.completed_by_name || completion.completed_by}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(completion.completed_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-battle-orange">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(completion.duration_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{completion.items_checked}/{completion.items_total}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCompletion(completion.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPackingCompletions;
