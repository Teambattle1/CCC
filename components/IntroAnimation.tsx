import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

interface Particle {
  size: number;
  delay: number;
  color: string;
  tx: number;
  ty: number;
}

const generateParticles = (): Particle[] =>
  Array.from({ length: 20 }).map((_, i) => {
    const angle = (i / 20) * 360;
    const distance = 150 + Math.random() * 200;
    const rad = (angle * Math.PI) / 180;
    return {
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.3,
      color: `rgba(255, ${80 + Math.floor(Math.random() * 60)}, 0, ${(0.6 + Math.random() * 0.4).toFixed(2)})`,
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
    };
  });

const IntroAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [particles] = useState<Particle[]>(generateParticles);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => setPhase(5), 4200),
      setTimeout(finish, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      role="button"
      tabIndex={0}
      aria-label="Skip intro animation"
      onClick={finish}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          finish();
        }
      }}
      style={{
        background: '#0a0a0a',
        opacity: phase >= 5 ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      {/* Radial glow background */}
      <div
        className="absolute inset-0"
        style={{
          background: phase >= 1
            ? 'radial-gradient(circle at 50% 50%, rgba(255,102,0,0.15) 0%, rgba(255,102,0,0.05) 30%, transparent 60%)'
            : 'transparent',
          transition: 'background 1s ease-out',
        }}
      />

      {/* Animated ring */}
      <div
        className="absolute"
        style={{
          width: phase >= 1 ? '280px' : '0px',
          height: phase >= 1 ? '280px' : '0px',
          border: '2px solid rgba(255,102,0,0.3)',
          borderRadius: '50%',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: phase >= 4 ? 0 : 0.6,
        }}
      />
      <div
        className="absolute"
        style={{
          width: phase >= 2 ? '400px' : '0px',
          height: phase >= 2 ? '400px' : '0px',
          border: '1px solid rgba(255,102,0,0.15)',
          borderRadius: '50%',
          transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: phase >= 4 ? 0 : 0.4,
        }}
      />

      {/* Particle burst */}
      {phase >= 4 && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                left: '50%',
                top: '50%',
                animation: `particle-${i} 1s ${p.delay}s ease-out forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Central content */}
      <div className="relative flex flex-col items-center z-10 pointer-events-none">
        {/* Shield icon */}
        <div
          style={{
            transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: phase >= 2 ? 'drop-shadow(0 0 30px rgba(255,102,0,0.8))' : 'none',
          }}
        >
          <ShieldCheck
            size={phase >= 2 ? 80 : 100}
            className="text-battle-orange"
            style={{ transition: 'all 0.5s ease-out' }}
          />
        </div>

        {/* Title */}
        <h1
          className="font-black tracking-[0.3em] text-white mt-6"
          style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            transform: phase >= 2 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.5)',
            opacity: phase >= 2 ? 1 : 0,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            textShadow: phase >= 3 ? '0 0 40px rgba(255,102,0,0.5), 0 0 80px rgba(255,102,0,0.2)' : 'none',
          }}
        >
          TEAMBATTLE
        </h1>

        {/* Subtitle */}
        <p
          className="text-battle-orange tracking-[0.5em] uppercase mt-3"
          style={{
            fontSize: 'clamp(0.6rem, 2vw, 0.9rem)',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out',
          }}
        >
          Crew Command Center
        </p>

        {/* Animated line */}
        <div
          className="mt-4 h-[2px] bg-gradient-to-r from-transparent via-battle-orange to-transparent"
          style={{
            width: phase >= 3 ? '200px' : '0px',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'all 0.8s ease-out',
          }}
        />
      </div>

      {/* Skip hint */}
      <p
        className="absolute bottom-8 text-gray-600 text-xs tracking-wider"
        style={{
          opacity: phase >= 2 && phase < 5 ? 0.5 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        TAP TO SKIP
      </p>

      <style>{particles.map((p, i) => `
        @keyframes particle-${i} {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + ${p.tx.toFixed(0)}px), calc(-50% + ${p.ty.toFixed(0)}px)) scale(0); }
        }
      `).join('')}</style>
    </div>
  );
};

export default IntroAnimation;
