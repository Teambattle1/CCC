import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { fetchTodayJobs, resolveActivities, TaskJob, ResolvedActivity } from '../lib/supabase';

interface TodayJobsButtonProps {
  onSelectJob: (job: TaskJob, activities: ResolvedActivity[]) => void;
}

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
};

const TodayJobsButton: React.FC<TodayJobsButtonProps> = ({ onSelectJob }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState<TaskJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchTodayJobs();
    setJobs(result);
    setIsLoading(false);
  }, []);

  // Load on mount + refresh every 5 min
  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleSelectJob = async (job: TaskJob) => {
    setSelectingId(job.id);
    let acts: ResolvedActivity[] = [];
    if (job.activities && job.activities.length > 0) {
      acts = await resolveActivities(job.activities);
    }
    setSelectingId(null);
    setIsOpen(false);
    onSelectJob(job, acts);
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadJobs(); // Refresh when opening
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={handleToggle}
        className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation touch-target relative"
        title="Opgaver idag"
      >
        <CalendarDays className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-battle-orange group-active:text-battle-orangeLight transition-colors" />
        {/* Badge */}
        {jobs.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-battle-orange text-black text-[10px] font-bold rounded-full px-1">
            {jobs.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-battle-orange/30 rounded-xl shadow-[0_0_30px_rgba(255,102,0,0.15)] overflow-hidden z-[60]">
          <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Opgaver i dag
            </h3>
            <span className="text-[10px] text-gray-500">
              {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 flex justify-center">
                <Loader2 size={20} className="text-battle-orange animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Ingen opgaver idag
              </div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  disabled={selectingId === job.id}
                  className="w-full text-left px-3 py-2.5 hover:bg-battle-orange/10 border-b border-white/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-xs text-battle-orange font-bold">
                      #{job.short_code}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatTime(job.event_date)}
                      {job.event_end ? ` — ${formatTime(job.event_end)}` : ''}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium truncate">
                    {job.client_name || 'Ingen kunde'}
                  </div>
                  {job.activities && job.activities.length > 0 && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {job.activities.length} aktivitet{job.activities.length !== 1 ? 'er' : ''}
                    </div>
                  )}
                  {selectingId === job.id && (
                    <Loader2 size={12} className="text-battle-orange animate-spin inline ml-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayJobsButton;
