import React, { useState } from 'react';
import { HubLink } from '../types';

interface HubButtonProps {
  link: HubLink;
  index: number;
  onClick?: (link: HubLink) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  compact?: boolean;
}

const HubButton: React.FC<HubButtonProps> = ({
  link,
  index,
  onClick,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(link);
    }
    if (link.url.startsWith('#')) {
      e.preventDefault();
    }
  };

  const handleTouchStart = () => {
    setIsTouched(true);
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsTouched(false);
      setIsHovered(false);
    }, 150);
  };

  const isActive = isHovered || isTouched;

  return (
    <a
      href={link.url}
      target={link.url.startsWith('#') ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      draggable={draggable}
      onDragStart={(e) => draggable && onDragStart && onDragStart(e, index)}
      onDragOver={(e) => draggable && onDragOver && onDragOver(e, index)}
      onDrop={(e) => draggable && onDrop && onDrop(e, index)}
      className={`group relative flex flex-col items-center justify-center p-2 tablet:p-3 outline-none focus:outline-none touch-manipulation select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        animationDelay: `${index * 50}ms`,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* The Glowing Orb Container - Touch optimized with larger targets */}
      <div
        className={`
          relative flex items-center justify-center
          ${compact
            ? 'w-12 h-12 sm:w-14 sm:h-14 tablet:w-16 tablet:h-16'
            : 'w-20 h-20 sm:w-24 sm:h-24 tablet:w-28 tablet:h-28 md:w-32 md:h-32'
          }
          rounded-full border-2
          bg-battle-grey bg-opacity-40 backdrop-blur-sm
          transition-all duration-200 ease-out
          active:scale-90 active:shadow-inner
          ${!compact ? 'tablet-touch-target' : ''}
          ${isActive
            ? 'border-battle-orange shadow-neon-hover scale-105 tablet:scale-110 -translate-y-1 tablet:-translate-y-2'
            : 'border-white/10 shadow-neon hover:border-battle-orange/50'
          }
        `}
      >
        {/* Active Badge */}
        {link.badge && (
          <div className="absolute -top-1 -right-1 z-30 bg-battle-orange text-black text-[9px] tablet:text-[10px] font-bold px-1.5 tablet:px-2 py-0.5 rounded-full shadow-neon animate-pulse-slow">
            {link.badge}
          </div>
        )}

        {/* Inner glow pulse effect */}
        <div className={`
          absolute inset-0 rounded-full opacity-0 transition-opacity duration-300
          ${isActive ? 'opacity-20 bg-battle-orange blur-md' : ''}
        `} />

        {/* Icon */}
        <div className={`
          relative z-10 transition-all duration-200
          ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' :
            link.color === 'orange' ? 'text-battle-orange' :
            link.color === 'blue' ? 'text-blue-500' :
            link.color === 'lightblue' ? 'text-sky-400' :
            link.color === 'green' ? 'text-green-700' :
            link.color === 'lightgreen' ? 'text-green-400' :
            link.color === 'red' ? 'text-red-800' :
            link.color === 'gold' ? 'text-yellow-500' :
            link.color === 'yellow' ? 'text-yellow-400' :
            link.color === 'purple' ? 'text-purple-500' :
            link.color === 'white' ? 'text-white' :
            link.color === 'darkblue' ? 'text-blue-900' :
            link.color === 'gray' ? 'text-gray-400' :
            link.color === 'hotpink' ? 'text-pink-500' :
            'text-battle-orange'}
        `}>
          <link.icon
            size={compact ? (isActive ? 24 : 20) : (isActive ? 44 : 36)}
            strokeWidth={1.5}
            className={compact ? "tablet:w-6 tablet:h-6" : "tablet:w-10 tablet:h-10"}
          />
        </div>
      </div>

      {/* Label - always visible on tablet for better UX */}
      <div className={`
        ${compact ? 'mt-1' : 'mt-2 tablet:mt-3'} text-center transition-all duration-200 transform
        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-80 tablet:opacity-90 translate-y-1'}
      `}>
        <h3 className={`
          ${compact ? 'text-[9px] tablet:text-[10px]' : 'text-xs sm:text-sm tablet:text-base'} font-bold uppercase tracking-wider
          ${isActive ? 'text-battle-orange drop-shadow-[0_0_5px_rgba(255,102,0,0.8)]' : 'text-gray-400'}
        `}>
          {link.title.startsWith('TEAM') ? (
            <>
              <span className="text-white">TEAM</span>
              <span>{link.title.slice(4)}</span>
            </>
          ) : (
            link.title
          )}
        </h3>
        {!compact && (
          <p className={`
            text-[10px] tablet:text-xs text-gray-500 mt-0.5 h-3 tablet:h-4 transition-opacity duration-200
            ${isActive ? 'opacity-100' : 'opacity-0 tablet:opacity-60'}
          `}>
            {link.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default HubButton;