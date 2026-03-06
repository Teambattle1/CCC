import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { fetchMyJobs, resolveActivities, TaskJob, ResolvedActivity } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MyJobsProps {
  onJobSelected: (job: TaskJob, activities: ResolvedActivity[]) => void;
}

const ACTIVITY_COLORS: Record<string, string> = {
  'TeamChallenge': '#ec4899',
  'TeamLazer': '#3b82f6',
  'TeamRobin': '#86efac',
  'TeamBox': '#9ca3af',
  'TeamConnect': '#a855f7',
  'TeamPlay': '#f97316',
  'TeamTaste': '#eab308',
  'TeamSegway': '#ef4444',
  'TeamControl': '#ffffff',
  'TeamConstruct': '#facc15',
  'TeamAction': '#67e8f9',
  'TeamRace': '#f97316',
};

const MyJobs: React.FC<MyJobsProps> = ({ onJobSelected }) => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<TaskJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile?.email) {
        setError('Ikke logget ind');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const data = await fetchMyJobs(profile.email);
      setJobs(data);
      setLoading(false);
    };
    load();
  }, [profile?.email]);

  const handleJobClick = async (job: TaskJob) => {
    let activities: ResolvedActivity[] = [];
    if (job.activities && job.activities.length > 0) {
      activities = await resolveActivities(job.activities);
    }
    onJobSelected(job, activities);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    if (isToday) return 'I dag';
    if (isTomorrow) return 'I morgen';
    return d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-battle-orange animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-2">
        <AlertCircle size={24} />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
        <Calendar size={32} className="text-gray-600" />
        <p className="text-sm">Ingen opgaver fundet for dig</p>
        <p className="text-xs text-gray-600">Du har ingen tildelte sessioner endnu</p>
      </div>
    );
  }

  // Split into upcoming and past
  const now = new Date();
  const upcoming = jobs.filter(j => j.event_date && new Date(j.event_date) >= now);
  const past = jobs.filter(j => j.event_date && new Date(j.event_date) < now);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Kommende ({upcoming.length})
          </h3>
          <div className="space-y-2">
            {upcoming.map(job => (
              <JobCard key={job.id} job={job} formatDate={formatDate} formatTime={formatTime} onClick={handleJobClick} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Tidligere ({past.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {past.slice(0, 10).map(job => (
              <JobCard key={job.id} job={job} formatDate={formatDate} formatTime={formatTime} onClick={handleJobClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual job card
const JobCard: React.FC<{
  job: TaskJob;
  formatDate: (d: string | null) => string;
  formatTime: (d: string | null) => string;
  onClick: (job: TaskJob) => void;
}> = ({ job, formatDate, formatTime, onClick }) => {
  const statusColor = job.status === 'completed' ? 'border-green-500/30' :
    job.status === 'cancelled' ? 'border-red-500/30' :
    'border-battle-orange/30';

  return (
    <button
      onClick={() => onClick(job)}
      className={`w-full text-left bg-battle-grey/50 border ${statusColor} rounded-xl p-4 hover:bg-battle-grey/70 transition-colors group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-battle-orange font-mono font-bold text-sm">
              #{job.short_code || '????'}
            </span>
            <span className="text-white font-medium text-sm truncate">
              {job.client_name || 'Ukendt'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(job.event_date)}
            </span>
            {job.event_date && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatTime(job.event_date)}
              </span>
            )}
            {job.guests_count && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {job.guests_count}
              </span>
            )}
          </div>

          {/* Activity pills */}
          {job.activities && job.activities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.activities.map((actId, i) => {
                const name = actId.replace(/^A\d+$/, actId);
                return (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10"
                  >
                    {actId}
                  </span>
                );
              })}
            </div>
          )}

          {job.location_name && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
              <MapPin size={10} />
              <span className="truncate">{job.location_name}</span>
            </div>
          )}
        </div>

        <ChevronRight size={18} className="text-gray-600 group-hover:text-battle-orange transition-colors mt-1 flex-shrink-0" />
      </div>
    </button>
  );
};

export default MyJobs;
