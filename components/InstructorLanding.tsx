import React, { useEffect, useState } from 'react';
import { DoorOpen, BookOpen } from 'lucide-react';
import { fetchLandingSites, LandingSite } from '../lib/supabase';

interface InstructorLandingProps {
  // Åbner den interne CREW-hub (de eksisterende aktivitets-knapper)
  onOpenHub: () => void;
  // Åbner CREW GUIDE (medarbejderhåndbogen)
  onOpenGuide: () => void;
}

// Én app-genvej på instruktør-forsiden.
interface AppTile {
  key: string;        // landing_sites.key — bruges til at slå logoet op
  label: string;      // synligt label under cirklen
  href?: string;      // ekstern URL (åbnes i ny fane)
  internal?: boolean; // true = åbn CREW-hub i stedet for ekstern URL
  guide?: boolean;    // true = åbn CREW GUIDE
}

// Apps i den faste rækkefølge instruktører skal se dem i.
// 'crew' og 'crew_guide' er interne. 'welcome'/'crew_guide' findes ikke i
// landing_sites, så de får et fallback-ikon.
const APP_TILES: AppTile[] = [
  { key: 'welcome', label: 'WELCOME', href: 'https://welcome.eventday.dk' },
  { key: 'media', label: 'MEDIA', href: 'https://media.eventday.dk' },
  { key: 'learn', label: 'LEARN', href: 'https://learn.eventday.dk' },
  { key: 'crew', label: 'CREWCONTROLCENTER', internal: true },
  { key: 'crew_guide', label: 'CREW GUIDE', guide: true },
  { key: 'my', label: 'MY', href: 'https://my.eventday.dk' },
  { key: 'gear', label: 'GEAR', href: 'https://gear.eventday.dk' },
  { key: 'games', label: 'GAMES', href: 'https://games.eventday.dk' },
];

// Keys vi henter logoer for (welcome + crew_guide har ingen katalog-række).
const NO_CATALOG = ['welcome', 'crew_guide'];
const CATALOG_KEYS = APP_TILES.map((t) => t.key).filter((k) => !NO_CATALOG.includes(k));

const InstructorLanding: React.FC<InstructorLandingProps> = ({ onOpenHub, onOpenGuide }) => {
  const [sites, setSites] = useState<Record<string, LandingSite>>({});

  // Hent app-ikoner live fra det delte katalog (landing_sites).
  useEffect(() => {
    let active = true;
    fetchLandingSites(CATALOG_KEYS).then((map) => {
      if (active) setSites(map);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleTileClick = (tile: AppTile) => {
    if (tile.guide) {
      onOpenGuide();
    } else if (tile.internal) {
      onOpenHub();
    } else if (tile.href) {
      window.open(tile.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 tablet-portrait:px-4">
      <div className="grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-4 mobile-landscape:gap-3 tablet-portrait:gap-6 tablet-landscape:gap-5 desktop:gap-8 justify-items-center">
        {APP_TILES.map((tile) => {
          const site = sites[tile.key];
          const icon = site?.icon || null;
          const tint = site?.color || '#d4640a';
          return (
            <button
              key={tile.key}
              onClick={() => handleTileClick(tile)}
              className="group flex flex-col items-center justify-start gap-2 tablet-portrait:gap-3 outline-none focus:outline-none touch-manipulation select-none"
            >
              {/* Logo-cirkel — samme visuelle sprog som app.eventday.dk */}
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white/10 group-hover:border-battle-orange shadow-neon group-hover:shadow-neon-hover transition-all duration-200 group-hover:scale-105 group-hover:-translate-y-1 group-active:scale-95 touch-target w-20 h-20 mobile-landscape:w-[4.5rem] mobile-landscape:h-[4.5rem] tablet-portrait:w-28 tablet-portrait:h-28 tablet-landscape:w-24 tablet-landscape:h-24 desktop:w-32 desktop:h-32"
                style={icon ? { backgroundColor: tint } : undefined}
              >
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  // Fallback-ikon (WELCOME / CREW GUIDE har ingen katalog-logo)
                  <div className="w-full h-full flex items-center justify-center bg-battle-orange">
                    {tile.guide ? (
                      <BookOpen
                        className="w-8 h-8 tablet-portrait:w-11 tablet-portrait:h-11 desktop:w-14 desktop:h-14 text-white"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <DoorOpen
                        className="w-8 h-8 tablet-portrait:w-11 tablet-portrait:h-11 desktop:w-14 desktop:h-14 text-white"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-base font-bold uppercase tracking-wider text-gray-300 group-hover:text-battle-orange transition-colors text-center leading-tight max-w-[6rem] tablet-portrait:max-w-[8rem]">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorLanding;
