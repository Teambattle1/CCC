import React, { useState, useEffect } from 'react';
import { Check, Package, RotateCcw } from 'lucide-react';

interface PackingItem {
  id: string;
  text: string;
  category: string;
}

interface PackingListProps {
  title: string;
  storageKey: string;
  items: PackingItem[];
}

const PackingList: React.FC<PackingListProps> = ({ title, storageKey, items }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, storageKey]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetAll = () => {
    setCheckedItems(new Set());
  };

  const categories = [...new Set(items.map(item => item.category))];
  const totalChecked = checkedItems.size;
  const totalItems = items.length;
  const progress = Math.round((totalChecked / totalItems) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-battle-grey/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-battle-orange" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Nulstil alle"
          >
            <RotateCcw className="w-4 h-4" />
            Nulstil
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{totalChecked} af {totalItems} pakket</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-battle-black rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-battle-orange to-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        {categories.map(category => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-bold text-battle-orange uppercase tracking-wider mb-3 border-b border-white/10 pb-2">
              {category}
            </h3>
            <div className="space-y-2">
              {items
                .filter(item => item.category === category)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      checkedItems.has(item.id)
                        ? 'bg-green-900/30 border border-green-500/30'
                        : 'bg-battle-black/30 border border-white/10 hover:border-battle-orange/50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        checkedItems.has(item.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-battle-grey border border-white/20'
                      }`}
                    >
                      {checkedItems.has(item.id) && <Check className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-sm ${
                        checkedItems.has(item.id) ? 'text-gray-400 line-through' : 'text-white'
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {progress === 100 && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-xl text-center">
            <p className="text-green-400 font-bold">✅ Alt er pakket!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// TeamRobin Packing List - Before Task
export const TEAMROBIN_PACKING_BEFORE: PackingItem[] = [
  // I TRAILER
  { id: 'tr1', text: '3 store træstativer', category: 'I TRAILER' },
  { id: 'tr2', text: '3 mindre metal stativer inkl. 3 løse skiver', category: 'I TRAILER' },
  { id: 'tr3', text: '5 rundstokke', category: 'I TRAILER' },
  { id: 'tr4', text: 'Taske med 9 meter pilefang', category: 'I TRAILER' },
  { id: 'tr5', text: '7 Sorte foldeborde – et til hvert team samt til instruktør', category: 'I TRAILER' },
  { id: 'tr6', text: '1 geværkasse med pile (tjek der minimum er 30 der er 100% i orden + 6 gule)', category: 'I TRAILER' },
  { id: 'tr7', text: '1 kasse med armbind/pileudtager', category: 'I TRAILER' },
  { id: 'tr8', text: 'Afspærringspinde (hvide til græs)', category: 'I TRAILER' },
  { id: 'tr9', text: 'Gearkasse med: Pointboard, skema og kuglepen', category: 'I TRAILER' },
  { id: 'tr10', text: 'Ekstra SØM til ansigter til skiver', category: 'I TRAILER' },
  { id: 'tr11', text: 'Strips/bidtang', category: 'I TRAILER' },
  { id: 'tr12', text: 'Førstehjælpstaske', category: 'I TRAILER' },
  { id: 'tr13', text: 'Afspærringsbånd', category: 'I TRAILER' },

  // SKAL HENTES INDENFOR
  { id: 'ind1', text: '3 buetasker (1 herre BLÅT bånd, 1 dame RØDT bånd, 1 venstre GULT bånd) – tjek buerne er opstrenget', category: 'SKAL HENTES INDENFOR' },
  { id: 'ind2', text: '1 stk. højt cafebord til pointgiving - husk orange dug!', category: 'SKAL HENTES INDENFOR' },
  { id: 'ind3', text: 'Minimum 10 Ansigter (opbevares ikke i trailer - hentes på lager)', category: 'SKAL HENTES INDENFOR' },
  { id: 'ind4', text: 'I tilfælde af regn: 1 stk. telt + evt. jernklodser ved vind', category: 'SKAL HENTES INDENFOR' },
];

// TeamRobin Packing List - After Task (Hjemkomst)
export const TEAMROBIN_PACKING_AFTER: PackingItem[] = [
  { id: 'af1', text: 'Alle "ansigter" afmonteres skydeskiverne og lægges på lageret til udsmidning', category: 'VED HJEMKOMST' },
  { id: 'af2', text: 'Søm til ansigterne samles - 4 søm på hver skive', category: 'VED HJEMKOMST' },
  { id: 'af3', text: 'Alle buer leveres opstrenget (se videomanual)', category: 'VED HJEMKOMST' },
  { id: 'af4', text: 'Alle brugte pointskemaer smides ud - gør klar til næste opgave', category: 'VED HJEMKOMST' },

  { id: 'vaad1', text: 'Alt VÅDT GEAR ordnes med det samme - pak ud i det store lager', category: 'VÅDT GEAR' },
  { id: 'vaad2', text: 'Våde buer/pile tørres af med viskestykke', category: 'VÅDT GEAR' },
  { id: 'vaad3', text: 'Lad taskerne stå åbne hvis de er våde', category: 'VÅDT GEAR' },
  { id: 'vaad4', text: 'Vådt pilefang bredes ud/hænges op (evt. i LazerLerdue rum)', category: 'VÅDT GEAR' },
  { id: 'vaad5', text: 'Våde armbind hænges op', category: 'VÅDT GEAR' },

  { id: 'fejl1', text: 'Tjek om noget gear ikke virker korrekt', category: 'FEJLRAPPORTERING' },
  { id: 'fejl2', text: 'Ring/SMS til Maria hvis gear er defekt', category: 'FEJLRAPPORTERING' },
  { id: 'fejl3', text: 'Marker defekt gear med besked om hvad der er galt', category: 'FEJLRAPPORTERING' },
  { id: 'fejl4', text: 'Noter under fejl/mangler i appen', category: 'FEJLRAPPORTERING' },
];

// TeamLazer Packing List - Before Task (1 Setup)
export const TEAMLAZER_PACKING_BEFORE: PackingItem[] = [
  // GEVÆRER
  { id: 'tl_g1', text: '1 Sæt = 5 geværer - ALTID - Tjek at ALLE 5 geværer fungerer inden afgang', category: 'GEVÆRER' },
  { id: 'tl_g2', text: '24 stk. genopladelige batterier – Disse skal IKKE sidde i gevær under kørslen!', category: 'GEVÆRER' },

  // DUER
  { id: 'tl_d1', text: '1 stk. duekaster – tjek det virker på "on/off knappen"', category: 'DUER' },
  { id: 'tl_d2', text: 'Pløkker til kaster', category: 'DUER' },
  { id: 'tl_d3', text: '1 kasse med due+', category: 'DUER' },
  { id: 'tl_d4', text: 'Knæpude', category: 'DUER' },
  { id: 'tl_d5', text: 'Fjeder til duekaster – TJEK i duekasse!!!', category: 'DUER' },
  { id: 'tl_d6', text: 'Tårn til duer inkl. alle 3 vingemøtrikker', category: 'DUER' },

  // DISPLAY
  { id: 'tl_di1', text: 'Tænd og TEST ved at trykke på den gule TEST knap bagpå', category: 'DISPLAY' },

  // GEARKASSE
  { id: 'tl_gk1', text: 'Husk den store sorte gearkasse (med orange håndtag)', category: 'GEARKASSE' },
  { id: 'tl_gk2', text: '3 blå kabelruller', category: 'GEARKASSE' },
  { id: 'tl_gk3', text: '1 Controller', category: 'GEARKASSE' },
  { id: 'tl_gk4', text: '1 kabel til kaster', category: 'GEARKASSE' },
  { id: 'tl_gk5', text: '1 kabel til 12 V (Bilstik)', category: 'GEARKASSE' },
  { id: 'tl_gk6', text: '1 ekstra lader til anlæg', category: 'GEARKASSE' },
  { id: 'tl_gk7', text: '2 stk. højtalere til display', category: 'GEARKASSE' },
  { id: 'tl_gk8', text: '1 scoreboard i blå lukket clipboard', category: 'GEARKASSE' },
  { id: 'tl_gk9', text: 'Pointskemaer på blok/skriveværktøj – Tjek de kan skrive på pointboard!', category: 'GEARKASSE' },

  // ANDET
  { id: 'tl_a1', text: '5 stk. nummermåtter', category: 'ANDET' },
  { id: 'tl_a2', text: '1 stk. højt cafébord til pointboard og controller', category: 'ANDET' },
  { id: 'tl_a3', text: 'JBL Extreme musikafspiller – skal hentes på reolen', category: 'ANDET' },

  // OVERVEJ OGSÅ
  { id: 'tl_o1', text: 'Koblingssæt til 2 SETUP?', category: 'OVERVEJ OGSÅ' },
  { id: 'tl_o2', text: 'NATSKYDNING?', category: 'OVERVEJ OGSÅ' },
  { id: 'tl_o3', text: 'Afspærringspinde/bånd', category: 'OVERVEJ OGSÅ' },
  { id: 'tl_o4', text: 'Telt i tilfælde af dårligt vejr – husk jernklodser', category: 'OVERVEJ OGSÅ' },
];

// TeamLazer Packing List - Before Task (x2 Setup)
export const TEAMLAZER_PACKING_BEFORE_X2: PackingItem[] = [
  // GEVÆRER
  { id: 'tl2_g1', text: '2 Sæt = 10 geværer - Tjek at ALLE 10 geværer fungerer inden afgang', category: 'GEVÆRER (x2)' },
  { id: 'tl2_g2', text: '48 stk. genopladelige batterier – Disse skal IKKE sidde i gevær under kørslen!', category: 'GEVÆRER (x2)' },

  // DUER
  { id: 'tl2_d1', text: '2 stk. duekastere – tjek de virker på "on/off knappen"', category: 'DUER (x2)' },
  { id: 'tl2_d2', text: 'Pløkker til begge kastere', category: 'DUER (x2)' },
  { id: 'tl2_d3', text: '2 kasser med due+', category: 'DUER (x2)' },
  { id: 'tl2_d4', text: '2 Knæpuder', category: 'DUER (x2)' },
  { id: 'tl2_d5', text: 'Fjedre til duekastere – TJEK i duekasser!!!', category: 'DUER (x2)' },
  { id: 'tl2_d6', text: '2 Tårne til duer inkl. alle vingemøtrikker', category: 'DUER (x2)' },

  // DISPLAY
  { id: 'tl2_di1', text: '2 Displays - Tænd og TEST ved at trykke på den gule TEST knap bagpå', category: 'DISPLAY (x2)' },

  // GEARKASSE
  { id: 'tl2_gk1', text: '2 store sorte gearkasser (med orange håndtag)', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk2', text: '6 blå kabelruller', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk3', text: '2 Controllers', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk4', text: '2 kabler til kastere', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk5', text: '2 kabler til 12 V (Bilstik)', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk6', text: '2 ekstra ladere til anlæg', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk7', text: '4 stk. højtalere til displays', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk8', text: '2 scoreboards i blå lukket clipboard', category: 'GEARKASSE (x2)' },
  { id: 'tl2_gk9', text: 'Pointskemaer på blok/skriveværktøj – Tjek de kan skrive på pointboards!', category: 'GEARKASSE (x2)' },

  // ANDET
  { id: 'tl2_a1', text: '10 stk. nummermåtter', category: 'ANDET (x2)' },
  { id: 'tl2_a2', text: '2 stk. høje caféborde til pointboard og controller', category: 'ANDET (x2)' },
  { id: 'tl2_a3', text: 'JBL Extreme musikafspiller – skal hentes på reolen', category: 'ANDET (x2)' },
  { id: 'tl2_a4', text: 'Koblingssæt til 2 SETUP', category: 'ANDET (x2)' },

  // OVERVEJ OGSÅ
  { id: 'tl2_o1', text: 'NATSKYDNING?', category: 'OVERVEJ OGSÅ' },
  { id: 'tl2_o2', text: 'Afspærringspinde/bånd', category: 'OVERVEJ OGSÅ' },
  { id: 'tl2_o3', text: 'Telt i tilfælde af dårligt vejr – husk jernklodser', category: 'OVERVEJ OGSÅ' },
];

// TeamLazer Packing List - After Task (Hjemkomst)
export const TEAMLAZER_PACKING_AFTER: PackingItem[] = [
  // VED HJEMKOMST
  { id: 'tla_h1', text: 'Gevær skal have fjernet batterier – Batterier til opladning', category: 'VED HJEMKOMST' },
  { id: 'tla_h2', text: 'Alt gear tørres af med viskestykke', category: 'VED HJEMKOMST' },
  { id: 'tla_h3', text: 'Alle brugte pointskemaer m.m. smides ud', category: 'VED HJEMKOMST' },

  // VÅDT GEAR
  { id: 'tla_v1', text: 'Alt VÅDT GEAR skal ordnes med det samme ved retur på lageret', category: 'VÅDT GEAR' },
  { id: 'tla_v2', text: 'Har det regnet skal duer tømmes ud og lufttørres', category: 'VÅDT GEAR' },
  { id: 'tla_v3', text: 'Alle våde kabler og især stik/controller skal hænges op', category: 'VÅDT GEAR' },

  // FEJLRAPPORTERING
  { id: 'tla_f1', text: 'Har du oplevet fejl/mangler skal det skrives i evalueringen', category: 'FEJLRAPPORTERING' },
  { id: 'tla_f2', text: 'Virker noget af gearet ikke, så kommende opgave ikke er mulig, skal der ringes så snart det er muligt', category: 'FEJLRAPPORTERING' },
];

export default PackingList;
