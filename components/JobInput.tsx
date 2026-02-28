import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { fetchTaskJobByCode, resolveActivities, TaskJob, ResolvedActivity } from '../lib/supabase';

interface JobInputProps {
  onJobLoaded: (job: TaskJob, activities: ResolvedActivity[]) => void;
}

const JobInput: React.FC<JobInputProps> = ({ onJobLoaded }) => {
  const [jobCode, setJobCode] = useState(() => localStorage.getItem('ccc_last_job_code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = jobCode.trim();
    if (!trimmed) {
      setError('Indtast et Opgave ID');
      return;
    }
    if (!/^\d{1,4}$/.test(trimmed)) {
      setError('Opgave ID skal være 1-4 cifre');
      return;
    }

    // Pad to 4 digits (e.g. "1" → "0001")
    const padded = trimmed.padStart(4, '0');

    setLoading(true);
    setError(null);

    const result = await fetchTaskJobByCode(padded);
    if (!result.success || !result.data) {
      setLoading(false);
      setError(`Opgave #${padded} ikke fundet`);
      return;
    }

    const job = result.data;
    let activities: ResolvedActivity[] = [];
    if (job.activities && job.activities.length > 0) {
      activities = await resolveActivities(job.activities);
    }

    localStorage.setItem('ccc_last_job_code', trimmed);
    setLoading(false);
    onJobLoaded(job, activities);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 4
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setJobCode(val);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <div className="w-full max-w-sm bg-battle-grey/50 rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="text-white text-lg font-bold text-center">Indtast Opgave ID</h2>
        <p className="text-gray-400 text-xs text-center">
          Skriv det 4-cifrede opgave-nummer fra OCC
        </p>

        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={jobCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="0001"
            maxLength={4}
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-4 text-white text-3xl font-mono text-center tracking-[0.3em] placeholder-gray-600 focus:outline-none focus:border-battle-orange/60 focus:ring-1 focus:ring-battle-orange/30 transition-colors"
            disabled={loading}
            autoFocus
          />
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-xs">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !jobCode.trim()}
          className="w-full flex items-center justify-center gap-2 bg-battle-orange/90 hover:bg-battle-orange text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {loading ? 'Henter...' : 'Hent opgave'}
        </button>
      </div>
    </div>
  );
};

export default JobInput;
