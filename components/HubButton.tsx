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
}

const HubButton: React.FC<HubButtonProps> = ({ 
  link, 
  index, 
  onClick,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Notify parent of click (for view switching etc)
    if (onClick) {
      onClick(link);
    }

    // If it is an internal link (starts with #), we prevent the default anchor behavior
    // so the App can handle the view state change without URL hash jumping.
    // If it is an external link (http...), we let the <a> tag handle it (target="_blank").
    if (link.url.startsWith('#')) {
      e.preventDefault();
    }
  };

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
      className={`group relative flex flex-col items-center justify-center p-4 outline-none focus:outline-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* The Glowing Orb Container */}
      <div 
        className={`
          relative flex items-center justify-center 
          w-24 h-24 md:w-32 md:h-32 
          rounded-full border-2 
          bg-battle-grey bg-opacity-40 backdrop-blur-sm
          transition-all duration-300 ease-out
          active:scale-95 active:shadow-inner
          ${isHovered 
            ? 'border-battle-orange shadow-neon-hover scale-110 -translate-y-2' 
            : 'border-white/10 shadow-neon hover:border-battle-orange/50'
          }
        `}
      >
        {/* Active Badge */}
        {link.badge && (
          <div className="absolute -top-1 -right-1 z-30 bg-battle-orange text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-neon animate-pulse-slow">
            {link.badge}
          </div>
        )}

        {/* Inner glow pulse effect */}
        <div className={`
          absolute inset-0 rounded-full opacity-0 transition-opacity duration-500
          ${isHovered ? 'opacity-20 bg-battle-orange blur-md' : ''}
        `} />

        {/* Icon */}
        <div className={`
          relative z-10 transition-all duration-300
          ${isHovered ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' :
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
            size={isHovered ? 48 : 40}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Label - appears/glows on hover */}
      <div className={`
        mt-4 text-center transition-all duration-300 transform
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}
      `}>
        <h3 className={`
          text-sm md:text-base font-bold uppercase tracking-wider
          ${isHovered ? 'text-battle-orange drop-shadow-[0_0_5px_rgba(255,102,0,0.8)]' : 'text-gray-400'}
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
        <p className={`
          text-xs text-gray-500 mt-1 h-4 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          {link.description}
        </p>
      </div>
    </a>
  );
};

export default HubButton;