import React, { useState, useEffect } from 'react';

// App version - update this when deploying new versions
export const APP_VERSION = '2.5.0';

interface ClockProps {
  showDate?: boolean;
  showVersion?: boolean;
}

const Clock: React.FC<ClockProps> = ({ showDate = false, showVersion = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = new Intl.DateTimeFormat('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(time);

  const dateString = new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(time);

  return (
    <div className="flex flex-col items-center font-mono z-50">
      <div className="text-sm mobile-landscape:text-sm tablet-portrait:text-lg tablet-landscape:text-base desktop:text-xl font-bold text-battle-orange tracking-widest drop-shadow-[0_0_8px_rgba(255,102,0,0.6)]">
        {timeString}
      </div>
      {showVersion && (
        <div className="text-[8px] mobile-landscape:text-[7px] tablet-portrait:text-[9px] tablet-landscape:text-[8px] desktop:text-[10px] text-gray-500 uppercase tracking-widest">
          v{APP_VERSION}
        </div>
      )}
      {showDate && (
        <div className="text-[8px] mobile-landscape:text-[8px] tablet-portrait:text-[10px] tablet-landscape:text-[9px] desktop:text-xs text-battle-white/70 uppercase tracking-widest mt-0.5">
          {dateString}
        </div>
      )}
    </div>
  );
};

export const DateDisplay: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000); // Update every minute for date
    return () => clearInterval(timer);
  }, []);

  const dateString = new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(time);

  return (
    <div className="text-[9px] mobile-landscape:text-[8px] tablet-portrait:text-xs tablet-landscape:text-[10px] desktop:text-sm text-battle-white/70 uppercase tracking-widest">
      {dateString}
    </div>
  );
};

export default Clock;