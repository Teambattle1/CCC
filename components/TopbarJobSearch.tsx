import React, { useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { fetchTaskJobByCode, resolveActivities, TaskJob, ResolvedActivity } from '../lib/supabase';

interface TopbarJobSearchProps {
  onJobLoaded: (job: TaskJob, activities: ResolvedActivity[]) => void;
}

const TopbarJobSearch: React.FC<TopbarJobSearchProps> = ({ onJobLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;

    const val = input.value.replace(/\D/g, '').trim();
    if (!val) return;

    const padded = val.padStart(4, '0');
    setIsLoading(true);
    setHasError(false);

    const result = await fetchTaskJobByCode(padded);
    if (!result.success || !result.data) {
      setIsLoading(false);
      setHasError(true);
      input.value = '';
      input.placeholder = `#${padded} ?`;
      setTimeout(() => {
        input.placeholder = 'Job #';
        setHasError(false);
      }, 2000);
      return;
    }

    const job = result.data;
    let acts: ResolvedActivity[] = [];
    if (job.activities && job.activities.length > 0) {
      acts = await resolveActivities(job.activities);
    }

    localStorage.setItem('ccc_last_job_code', val);
    setIsLoading(false);
    input.value = '';
    onJobLoaded(job, acts);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-1.5 bg-battle-grey/50 border ${hasError ? 'border-red-500/60' : 'border-white/10'} rounded-full px-2.5 py-1 mobile-landscape:px-2 tablet-portrait:px-3 focus-within:border-battle-orange/50 transition-all`}
    >
      {isLoading ? (
        <Loader2 size={14} className="text-battle-orange animate-spin shrink-0" />
      ) : (
        <Search size={14} className="text-gray-500 shrink-0" />
      )}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="Job #"
        className="bg-transparent text-white text-xs mobile-landscape:text-xs tablet-portrait:text-sm font-mono tracking-wider w-12 mobile-landscape:w-12 tablet-portrait:w-14 tablet-landscape:w-16 desktop:w-20 outline-none placeholder-gray-600"
        onChange={(e) => {
          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
          setHasError(false);
        }}
        disabled={isLoading}
      />
    </form>
  );
};

export default TopbarJobSearch;
