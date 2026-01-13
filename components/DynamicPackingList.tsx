import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Circle, RotateCcw, Plane, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PackingItem {
  id: string;
  text: string;
  subtext?: string;
  imageUrl?: string;
  indent?: boolean;
}

// Default packing lists - fallback if no custom data in Supabase
const DEFAULT_LISTS: Record<string, Record<string, PackingItem[]>> = {
  teamconstruct: {
    afgang: [
      { id: 'a1', text: 'Rør (2,5 til hver gruppe)' },
      { id: 'a2', text: 'Rundpinde (3 pinde til hvert hold)' },
      { id: 'a3', text: 'Sorte/gule Construct kasser (en til hvert hold) med:' },
      { id: 'a4', text: 'En golfbold', indent: true },
      { id: 'a5', text: 'Et skærebræt', indent: true },
      { id: 'a6', text: 'En sav', indent: true },
      { id: 'a7', text: 'Skærehandsker', indent: true },
      { id: 'a8', text: 'Målebånd', indent: true },
      { id: 'a9', text: 'Gaffatape', indent: true },
      { id: 'a10', text: 'Manual til hvad de skal konstruere', indent: true },
      { id: 'a11', text: 'Gul gearkasse med:' },
      { id: 'a12', text: 'Skemaer', indent: true },
      { id: 'a13', text: 'Kuglepen', indent: true },
      { id: 'a14', text: 'Ekstra golfbolde', indent: true },
      { id: 'a15', text: 'Ekstra gaffa', indent: true },
      { id: 'a16', text: 'Ekstra målebånd', indent: true },
      { id: 'a17', text: 'Ekstra skærehandsker', indent: true },
      { id: 'a18', text: 'Sorte borde (en til hvert hold)' },
      { id: 'a19', text: 'Højtaler' },
    ],
    hjemkomst: [
      { id: 'h1', text: 'Gearet skal virke og være klar til næste bruger' },
      { id: 'h2', text: 'Vådt gear ordnes med det samme ved retur' },
      { id: 'h3', text: 'Brugte pointskemaer smides ud – nye sættes i' },
      { id: 'h4', text: 'Skrald og "stumper" smides ud' },
      { id: 'h5', text: 'Rør og brugbare "afskæringer" gemmes' },
      { id: 'h6', text: 'Gearkasser fyldes op efter behov' },
      { id: 'h7', text: 'Fejl/mangler skrives i evalueringen' },
      { id: 'h8', text: 'Ring ved defekt gear der påvirker næste opgave' },
    ]
  },
  teamcontrol: {
    afgang: [
      { id: 'tca1', text: 'BOX med kasser med Lego droner' },
      { id: 'tca2', text: 'Husk kasse med ekstra legoklodser "FLYBRIX EXTRA"', indent: true },
      { id: 'tca3', text: 'Tablets med "FlyBrix" app (Orange F ikon)' },
      { id: 'tca4', text: 'Kasse med de hvide droner' },
      { id: 'tca5', text: 'Kasse med controllere til hvide droner' },
      { id: 'tca6', text: '2 kasser med RC biler (8 stk.)' },
      { id: 'tca7', text: '1 kasse med RC GEAR + kegler' },
      { id: 'tca8', text: 'Batterier til gear (VIGTIGT!)' },
      { id: 'tca9', text: 'Batterier til Lego droner (med velcro)', indent: true },
      { id: 'tca10', text: 'Batterier til droner (uden velcro)', indent: true },
      { id: 'tca11', text: 'Batterier til controllere (AA)', indent: true },
      { id: 'tca12', text: 'Batterier til RC biler (specielle)', indent: true },
      { id: 'tca13', text: 'Orange helipad ring (i GEARBOX til droner)' },
      { id: 'tca14', text: 'JBL Extreme 5 Højtaler' },
    ],
    hjemkomst: [
      { id: 'tch1', text: 'Gearet skal virke og være klar til næste bruger' },
      { id: 'tch2', text: 'Alle batterier skal oplades' },
      { id: 'tch3', text: 'Tjek at de små DRONE batterier lader', indent: true },
      { id: 'tch4', text: 'Tjek at Controller batterier til RC biler lader', indent: true },
      { id: 'tch5', text: 'Tjek at RC batterier til biler lader', indent: true },
      { id: 'tch6', text: 'Alle brugte/tændte tablets til opladning' },
      { id: 'tch7', text: 'Fejl/mangler skrives i evalueringen' },
      { id: 'tch8', text: 'Ring ved defekt gear der påvirker næste opgave' },
    ]
  },
  teamrobin: {
    before: [
      { id: 'rb1', text: 'Buer (antal efter behov)' },
      { id: 'rb2', text: 'Pile (min. 6 per bue)' },
      { id: 'rb3', text: 'Skydeskiver med stativer' },
      { id: 'rb4', text: 'Sikkerhedsnet' },
      { id: 'rb5', text: 'Afspærringsbånd' },
      { id: 'rb6', text: 'Højtaler' },
    ],
    after: [
      { id: 'ra1', text: 'Alle buer pakket korrekt' },
      { id: 'ra2', text: 'Pile tjekket for skader' },
      { id: 'ra3', text: 'Skydeskiver rengjort' },
      { id: 'ra4', text: 'Alt gear talt op' },
    ]
  },
  teamlazer: {
    before: [
      { id: 'lb1', text: 'Geværer (antal efter behov)' },
      { id: 'lb2', text: 'Kastere' },
      { id: 'lb3', text: 'Pointtavler' },
      { id: 'lb4', text: 'Controller' },
      { id: 'lb5', text: 'Batterier (fuldt opladet)' },
      { id: 'lb6', text: 'Ledninger og kabler' },
      { id: 'lb7', text: 'Højtaler' },
    ],
    after: [
      { id: 'la1', text: 'Alle geværer slukket' },
      { id: 'la2', text: 'Batterier til opladning' },
      { id: 'la3', text: 'Gear tjekket for skader' },
      { id: 'la4', text: 'Alt pakket i kasser' },
    ]
  },
  teamsegway: {
    before: [
      { id: 'sb1', text: 'Segways (antal efter behov)' },
      { id: 'sb2', text: 'Hjelme til alle' },
      { id: 'sb3', text: 'Kegler til bane' },
      { id: 'sb4', text: 'Ladere' },
      { id: 'sb5', text: 'Førstehjælpskasse' },
    ],
    after: [
      { id: 'sa1', text: 'Segways til opladning' },
      { id: 'sa2', text: 'Hjelme rengjort' },
      { id: 'sa3', text: 'Tjek for skader' },
      { id: 'sa4', text: 'Rapport om eventuelle uheld' },
    ]
  }
};

const ACTIVITY_NAMES: Record<string, string> = {
  teamconstruct: 'TeamConstruct',
  teamcontrol: 'TeamControl',
  teamrobin: 'TeamRobin',
  teamlazer: 'TeamLazer',
  teamsegway: 'TeamSegway',
  teambox: 'TeamBox',
  teamconnect: 'TeamConnect',
  teamaction: 'TeamAction',
  teamchallenge: 'TeamChallenge',
};

interface DynamicPackingListProps {
  activity: string;
  listType: string;
  title?: string;
}

const DynamicPackingList: React.FC<DynamicPackingListProps> = ({ activity, listType, title }) => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const storageKey = `${activity}_packing_${listType}`;
  const activityName = ACTIVITY_NAMES[activity] || activity;
  const isAfgang = listType === 'afgang' || listType === 'before';
  const Icon = isAfgang ? Plane : Home;
  const displayTitle = title || (isAfgang ? 'PAKKELISTE AFGANG' : 'HUSKELISTE HJEMKOMST');

  // Load items from Supabase or use defaults
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('packing_lists')
          .select('items')
          .eq('activity', activity)
          .eq('list_type', listType)
          .single();

        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else {
          // Use default list
          const defaultItems = DEFAULT_LISTS[activity]?.[listType] || [];
          setItems(defaultItems);
        }
      } catch (err) {
        console.error('Error loading packing list:', err);
        // Use default list on error
        const defaultItems = DEFAULT_LISTS[activity]?.[listType] || [];
        setItems(defaultItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [activity, listType]);

  // Load checked state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCheckedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load checked state:', e);
      }
    }
  }, [storageKey]);

  // Save checked state to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
    }
  }, [checkedItems, storageKey, items.length]);

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
    if (confirm('Nulstil alle checkmarks?')) {
      setCheckedItems(new Set());
    }
  };

  const checkAll = () => {
    setCheckedItems(new Set(items.map(i => i.id)));
  };

  const progress = items.length > 0 ? (checkedItems.size / items.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <div className="w-8 h-8 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Indlæser pakkeliste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 tablet:mb-6">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 tablet:w-8 tablet:h-8 text-battle-orange" />
            <div>
              <h2 className="text-base tablet:text-xl font-bold text-white uppercase tracking-wider">
                {displayTitle}
              </h2>
              <p className="text-[10px] tablet:text-xs text-gray-500 uppercase">{activityName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-xs uppercase hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2 tablet:px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs uppercase hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3 tablet:w-4 tablet:h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 tablet:mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{checkedItems.size} / {items.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-battle-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-battle-orange'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  item.indent ? 'ml-4 tablet:ml-6' : ''
                } ${
                  isChecked
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-battle-black/30 border border-white/5 hover:border-white/20'
                }`}
              >
                {/* Checkbox */}
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}

                {/* Text content - left side */}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm tablet:text-base block ${
                    isChecked ? 'text-green-400 line-through' : 'text-white'
                  }`}>
                    {item.text}
                  </span>
                  {item.subtext && (
                    <span className={`text-xs block mt-0.5 ${
                      isChecked ? 'text-green-400/60' : 'text-gray-500'
                    }`}>
                      {item.subtext}
                    </span>
                  )}
                </div>

                {/* Image - right side, fixed size */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-16 h-16 tablet:w-20 tablet:h-20 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Completion message */}
        {progress === 100 && (
          <div className="mt-4 tablet:mt-6 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-400 uppercase">
              {isAfgang ? 'KLAR TIL AFGANG!' : 'FÆRDIG!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPackingList;
