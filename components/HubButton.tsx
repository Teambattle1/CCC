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
      className={`group relative flex flex-col items-center justify-center p-1 mobile-landscape:p-1.5 tablet-portrait:p-2 tablet-landscape:p-2 desktop:p-3 outline-none focus:outline-none touch-manipulation select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
      {/* The Glowing Orb Container - Responsive for all 5 modes */}
      <div
        className={`
          relative flex items-center justify-center
          ${compact
            ? 'w-11 h-11 mobile-landscape:w-10 mobile-landscape:h-10 tablet-portrait:w-14 tablet-portrait:h-14 tablet-landscape:w-12 tablet-landscape:h-12 desktop:w-16 desktop:h-16'
            : 'w-[4.5rem] h-[4.5rem] mobile-landscape:w-16 mobile-landscape:h-16 tablet-portrait:w-24 tablet-portrait:h-24 tablet-landscape:w-[5.5rem] tablet-landscape:h-[5.5rem] desktop:w-32 desktop:h-32'
          }
          rounded-full border-2
          bg-battle-grey bg-opacity-40 backdrop-blur-sm
          transition-all duration-200 ease-out
          active:scale-90 active:shadow-inner
          touch-target
          ${isActive
            ? 'border-battle-orange shadow-neon-hover scale-105 tablet-landscape:scale-108 desktop:scale-110 -translate-y-1 desktop:-translate-y-2'
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

        {/* Icon - Responsive for all 5 modes */}
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
            className={compact
              ? "w-5 h-5 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-6 tablet-portrait:h-6 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-6 desktop:h-6"
              : "w-7 h-7 mobile-landscape:w-6 mobile-landscape:h-6 tablet-portrait:w-9 tablet-portrait:h-9 tablet-landscape:w-8 tablet-landscape:h-8 desktop:w-10 desktop:h-10"}
          />
        </div>
      </div>

      {/* Label - Responsive for all 5 modes */}
      <div className={`
        ${compact ? 'mt-0.5 mobile-landscape:mt-0.5 tablet-portrait:mt-1' : 'mt-1 mobile-landscape:mt-1 tablet-portrait:mt-2 tablet-landscape:mt-1.5 desktop:mt-3'} text-center transition-all duration-200 transform
        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-80 tablet-portrait:opacity-90 translate-y-1'}
      `}>
        <h3 className={`
          ${compact
            ? 'text-[8px] mobile-landscape:text-[7px] tablet-portrait:text-[10px] tablet-landscape:text-[9px] desktop:text-xs'
            : 'text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-base'
          } font-bold uppercase tracking-wider
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
            text-[8px] mobile-landscape:text-[7px] tablet-portrait:text-[10px] tablet-landscape:text-[9px] desktop:text-xs text-gray-500 mt-0.5 h-3 tablet-portrait:h-4 transition-opacity duration-200
            ${isActive ? 'opacity-100' : 'opacity-0 tablet-portrait:opacity-60'}
          `}>
            {link.description}
          </p>
        )}
      </div>
    </a>
  );
};

export default HubButton;