import React, { useEffect, useState } from 'react';
import {
  X, Check, Users, LifeBuoy, Sparkles, Shirt, Wallet, Target, GraduationCap,
  CalendarClock, Smartphone, RefreshCw, Mail, Car, CheckCircle2, Utensils,
  Receipt, Rocket, ClipboardCheck, ArrowRight, Info, LucideIcon,
} from 'lucide-react';
import { fetchWelcomeGuideButtons, WelcomeGuideButton } from '../lib/supabase';

// Fjern ledende emoji/symboler så kun teksten står tilbage — vi viser et hvidt
// Lucide-ikon i stedet (jf. husreglen: ingen emojis som UI-ikoner).
const cleanTitle = (t: string) => t.replace(/^[^A-Za-zÆØÅæøå]+/, '').trim();

// Vælg et hvidt ikon ud fra titlen (nøgleord). Samme idé som WELCOME's StepButtons;
// faldback er Info, så en ny/ukendt håndbogs-knap stadig får et rent ikon.
function iconFor(title: string): LucideIcon {
  const t = cleanTitle(title).toLowerCase();
  if (/kontakt|team/.test(t)) return Users;
  if (/hjælp/.test(t)) return LifeBuoy;
  if (/adfærd|fremtoning/.test(t)) return Sparkles;
  if (/påklædning|tøj|uniform/.test(t)) return Shirt;
  if (/honorar|løn|regler/.test(t)) return Wallet;
  if (/arbejdsflow|forløb/.test(t)) return CalendarClock;
  if (/roller|ansvar/.test(t)) return Target;
  if (/app/.test(t)) return Smartphone;
  if (/aflysning|byt/.test(t)) return RefreshCw;
  if (/når du får|modtag/.test(t)) return Mail;
  if (/transport|kørsel|bil/.test(t)) return Car;
  if (/efter/.test(t)) return CheckCircle2;
  if (/mad|overnatning/.test(t)) return Utensils;
  if (/udlæg|kvittering/.test(t)) return Receipt;
  if (/i gang|kommer du|start/.test(t)) return Rocket;
  if (/oplæring|træning/.test(t)) return GraduationCap;
  if (/krav/.test(t)) return ClipboardCheck;
  if (/next|næste/.test(t)) return ArrowRight;
  return Info;
}

// CREW GUIDE — medarbejderhåndbogen. Viser de samme runde knapper som WELCOME's
// "Du er klar"-trin, hentet fra samme tabel (welcome_step_buttons, step_id='klar').
const CrewGuide: React.FC = () => {
  const [buttons, setButtons] = useState<WelcomeGuideButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<WelcomeGuideButton | null>(null);
  const [read, setRead] = useState<Set<number>>(new Set()); // læste sektioner (pr. session)

  useEffect(() => {
    let on = true;
    fetchWelcomeGuideButtons().then((rows) => {
      if (on) {
        setButtons(rows);
        setLoading(false);
      }
    });
    return () => {
      on = false;
    };
  }, []);

  // Åbn en sektion = markér den som læst
  const open = (b: WelcomeGuideButton) => {
    setActive(b);
    setRead((prev) => new Set(prev).add(b.position));
  };

  if (loading) {
    return <p className="text-center text-gray-400 py-10">Henter håndbog…</p>;
  }
  if (!buttons.length) {
    return <p className="text-center text-gray-400 py-10">Håndbogen er tom endnu.</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 tablet-portrait:px-4">
      <div className="grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-4 tablet-portrait:gap-6 desktop:gap-8 justify-items-center">
        {buttons.map((b) => {
          const Icon = iconFor(b.title);
          const label = cleanTitle(b.title);
          const isRead = read.has(b.position);
          return (
            <button
              key={b.position}
              onClick={() => open(b)}
              className="group flex flex-col items-center gap-2 tablet-portrait:gap-3 outline-none focus:outline-none touch-manipulation select-none"
            >
              {/* relativ wrapper uden overflow, så OK-badget ikke klippes af cirklen */}
              <div className="relative w-20 h-20 tablet-portrait:w-28 tablet-portrait:h-28 desktop:w-32 desktop:h-32">
                <div className="w-full h-full rounded-full bg-battle-orange flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:border-battle-orange shadow-neon group-hover:shadow-neon-hover transition-all duration-200 group-hover:scale-105 group-hover:-translate-y-1 group-active:scale-95">
                  {b.image ? (
                    <img src={b.image} alt="" className="w-full h-full object-cover" draggable={false} />
                  ) : (
                    <Icon className="w-8 h-8 tablet-portrait:w-11 tablet-portrait:h-11 desktop:w-12 desktop:h-12 text-white" strokeWidth={1.6} />
                  )}
                </div>
                {/* Grønt OK-badge når sektionen er læst */}
                {isRead && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-7 h-7 tablet-portrait:w-8 tablet-portrait:h-8 rounded-full bg-green-500 border-2 border-battle-black flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tablet-portrait:text-sm desktop:text-base font-bold uppercase tracking-wider text-center leading-tight max-w-[6rem] tablet-portrait:max-w-[8rem] transition-colors ${
                  isRead ? 'text-green-400' : 'text-gray-300 group-hover:text-battle-orange'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* pop-up med titel + tekst (+ billede hvis et er uploadet) */}
      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-battle-grey border border-white/10 rounded-2xl shadow-neon"
          >
            <div
              className="relative flex items-center justify-center bg-battle-orange rounded-t-2xl overflow-hidden"
              style={{ height: active.image ? 180 : 84 }}
            >
              {active.image ? (
                <img src={active.image} alt="" className="w-full h-full object-cover" />
              ) : (
                (() => {
                  const Icon = iconFor(active.title);
                  return <Icon className="w-9 h-9 text-white" strokeWidth={1.6} />;
                })()
              )}
              <button
                onClick={() => setActive(null)}
                aria-label="Luk"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 tablet-portrait:p-6">
              <h3 className="text-xl font-bold text-white mb-3">{cleanTitle(active.title)}</h3>
              <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                {active.body || 'Ingen beskrivelse endnu.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewGuide;
