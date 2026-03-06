import React, { useState, useRef } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { fetchTaskJobByCode, resolveActivities, TaskJob, ResolvedActivity } from '../lib/supabase';

interface TopbarJobSearchProps {
  onJobLoaded: (job: TaskJob, activities: ResolvedActivity[]) => void;
}

const TopbarJobSearch: React.FC<TopbarJobSearchProps> = ({ onJobLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasValue, setHasValue] = useState(false);
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
      setHasValue(false);
      input.placeholder = `#${padded} ?`;
      setTimeout(() => {
        input.placeholder = 'SESSION ID';
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
    setHasValue(false);
    onJobLoaded(job, acts);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center h-10 mobile-landscape:h-9 tablet-portrait:h-12 tablet-landscape:h-11 desktop:h-14 rounded-xl overflow-hidden border-2 ${
        hasError
          ? 'border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.3)]'
          : 'border-battle-orange/60 focus-within:border-battle-orange shadow-[0_0_10px_rgba(255,102,0,0.15)] focus-within:shadow-[0_0_18px_rgba(255,102,0,0.3)]'
      } transition-all duration-200`}
    >
      {/* Input area */}
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 mobile-landscape:px-2.5 tablet-portrait:px-4 h-full flex-1">
        <span className="text-battle-orange font-mono font-bold text-sm mobile-landscape:text-sm tablet-portrait:text-base desktop:text-lg select-none">#</span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="SESSION ID"
          className="bg-transparent text-white text-sm mobile-landscape:text-sm tablet-portrait:text-base desktop:text-lg font-mono font-bold tracking-widest w-20 mobile-landscape:w-16 tablet-portrait:w-24 tablet-landscape:w-24 desktop:w-32 outline-none placeholder-gray-600"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
            setHasError(false);
            setHasValue(e.target.value.length > 0);
          }}
          disabled={isLoading}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading || !hasValue}
        className={`flex items-center justify-center h-full w-10 mobile-landscape:w-9 tablet-portrait:w-12 tablet-landscape:w-11 desktop:w-14 transition-all duration-200 touch-manipulation ${
          isLoading
            ? 'bg-battle-orange/30'
            : hasValue
              ? 'bg-battle-orange hover:bg-battle-orangeLight active:bg-battle-orange/80'
              : 'bg-battle-orange/20'
        }`}
      >
        {isLoading ? (
          <Loader2 size={18} className="text-white animate-spin" />
        ) : (
          <ArrowRight size={18} className={`transition-colors ${hasValue ? 'text-black' : 'text-gray-600'}`} />
        )}
      </button>
    </form>
  );
};

export default TopbarJobSearch;
