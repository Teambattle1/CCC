import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, CheckCheck, Eye, EyeOff } from 'lucide-react';

interface PackingItem {
  id: string;
  text: string;
  important?: boolean;
  warning?: boolean;
}

interface Category {
  title: string;
  icon: string;
  items: PackingItem[];
}

interface ItemsByCategory {
  [key: string]: Category;
}

const TeamSegwayPackingList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'afgang' | 'hjemkomst'>('afgang');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('teamsegway_packing');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    localStorage.setItem('teamsegway_packing', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const afgangItems: ItemsByCategory = {
    segways: {
      title: "SEGWAYS",
      icon: "🛴",
      items: [
        { id: 'sa1', text: 'X stk. Segway jf. App - tjek hvilken model (I2 eller X2)', important: true },
        { id: 'sa2', text: 'Tag en reserve med hvis ledigt', important: true },
        { id: 'sa3', text: 'Check alle kan starte', important: true },
        { id: 'sa4', text: 'Tjek batteri i noeglerne paa styret - ellers giv besked', warning: true },
      ]
    },
    hjelme: {
      title: "HJELME",
      icon: "⛑️",
      items: [
        { id: 'sh1', text: 'Hjelmkasser (en farve pr. hold)' },
      ]
    },
    clipboard: {
      title: "ROEDT CLIPBOARD",
      icon: "📋",
      items: [
        { id: 'sc1', text: 'Pointskemaer - fyld op hvis der mangler' },
        { id: 'sc2', text: 'Kuglepen' },
        { id: 'sc3', text: 'Keglesaet' },
        { id: 'sc4', text: '+5 stk. laminerede A5 kort med "The Sequenze"' },
      ]
    },
    andet: {
      title: "ANDET",
      icon: "📦",
      items: [
        { id: 'so1', text: '1 stk. hoejt cafebord til point' },
        { id: 'so2', text: '1 stk. MUSIKAFSPILLER' },
      ]
    },
    overvej: {
      title: "OVERVEJ OGSAA",
      icon: "🤔",
      items: [
        { id: 'sov1', text: 'I tilfaelde af regn - 1 stk. Telt', warning: true },
      ]
    }
  };

  const hjemkomstItems: ItemsByCategory = {
    segways: {
      title: "SEGWAYS",
      icon: "🛴",
      items: [
        { id: 'hs1', text: 'Segway SKAL toerres af', important: true },
        { id: 'hs2', text: 'Alle Segway skal saettes til opladning', important: true },
        { id: 'hs3', text: 'Tjek begge dioder paa basen lyser konstant groent', important: true },
        { id: 'hs4', text: 'Blinker de roedt - giv besked!', warning: true },
        { id: 'hs5', text: 'Blinker de 2 groenne = opladt (OK)' },
        { id: 'hs6', text: 'Lad dem altid blive paa stroem' },
      ]
    },
    hjelme: {
      title: "HJELME",
      icon: "⛑️",
      items: [
        { id: 'hh1', text: 'Alle spaender paa hjelme saettes sammen', important: true },
        { id: 'hh2', text: 'Mangler nogen spaender - giv besked', warning: true },
        { id: 'hh3', text: 'Indmad i hjelmene desinficeres med hjelmspray (gult laag)' },
        { id: 'hh4', text: 'Laag til hjelme holdes aaben paa lageret' },
      ]
    },
    andet: {
      title: "ANDET",
      icon: "📦",
      items: [
        { id: 'ha1', text: 'Evt. vaade kegler skal bredes ud' },
        { id: 'ha2', text: 'Alle brugte pointskemaer smides ud - nye saettes i!' },
      ]
    },
    fejl: {
      title: "FEJL & MANGLER",
      icon: "⚠️",
      items: [
        { id: 'hf1', text: 'Fejl/mangler skrives i evalueringen', important: true },
        { id: 'hf2', text: 'Ved kritisk defekt gear: Ring ASAP saa det kan fixes', important: true },
      ]
    }
  };

  const getItems = (): ItemsByCategory => {
    switch(activeTab) {
      case 'afgang': return afgangItems;
      case 'hjemkomst': return hjemkomstItems;
      default: return afgangItems;
    }
  };

  const currentItems = getItems();

  const getAllItemIds = (items: ItemsByCategory): string[] => {
    return Object.values(items).flatMap(category => category.items.map(item => item.id));
  };

  const getProgress = () => {
    const allIds = getAllItemIds(currentItems);
    const checkedCount = allIds.filter(id => checkedItems[id]).length;
    return { checked: checkedCount, total: allIds.length };
  };

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetList = () => {
    const allIds = getAllItemIds(currentItems);
    const resetItems: Record<string, boolean> = {};
    allIds.forEach(id => resetItems[id] = false);
    setCheckedItems(prev => ({ ...prev, ...resetItems }));
  };

  const markAllComplete = () => {
    const allIds = getAllItemIds(currentItems);
    const completeItems: Record<string, boolean> = {};
    allIds.forEach(id => completeItems[id] = true);
    setCheckedItems(prev => ({ ...prev, ...completeItems }));
  };

  const progress = getProgress();
  const progressPercent = progress.total > 0 ? (progress.checked / progress.total) * 100 : 0;

  const getTabColor = () => {
    switch(activeTab) {
      case 'afgang': return 'from-green-500 to-emerald-600';
      case 'hjemkomst': return 'from-orange-500 to-amber-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-battle-grey/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('afgang')}
            className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === 'afgang'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-battle-black/50 text-gray-400 hover:bg-battle-grey/50 hover:text-white'
            }`}
          >
            📦 AFGANG
          </button>
          <button
            onClick={() => setActiveTab('hjemkomst')}
            className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === 'hjemkomst'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-battle-black/50 text-gray-400 hover:bg-battle-grey/50 hover:text-white'
            }`}
          >
            🏠 HJEMKOMST
          </button>
        </div>

        {/* Tab Description */}
        <div className="bg-battle-black/30 rounded-xl p-3 mb-4 text-center border border-white/5">
          {activeTab === 'afgang' && (
            <p className="text-gray-300 text-sm">📦 Pakkeliste foer opgaven</p>
          )}
          {activeTab === 'hjemkomst' && (
            <p className="text-orange-300 text-sm">🏠 Tjekliste efter endt opgave</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{progress.checked} af {progress.total} tjekket</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 bg-battle-black rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressPercent === 100 ? 'from-green-500 to-emerald-500' : getTabColor()} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <div className="mt-2 text-center">
              <span className="text-green-400 font-semibold text-sm">✅ Alt er tjekket!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={resetList}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-battle-black/50 hover:bg-battle-grey/50 text-gray-400 hover:text-white rounded-lg transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Nulstil
          </button>
          <button
            onClick={markAllComplete}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-battle-black/50 hover:bg-battle-grey/50 text-gray-400 hover:text-white rounded-lg transition-colors text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Marker alle
          </button>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-battle-black/50 hover:bg-battle-grey/50 text-gray-400 hover:text-white rounded-lg transition-colors text-sm"
          >
            {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCompleted ? 'Skjul' : 'Vis alle'}
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(currentItems).map(([key, category]) => {
            const visibleItems = showCompleted
              ? category.items
              : category.items.filter(item => !checkedItems[item.id]);

            if (visibleItems.length === 0 && !showCompleted) return null;

            const categoryChecked = category.items.filter(item => checkedItems[item.id]).length;
            const categoryTotal = category.items.length;

            return (
              <div key={key} className="bg-battle-black/30 rounded-xl overflow-hidden border border-white/5">
                <div className="px-4 py-3 bg-battle-grey/20 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">{category.title}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    categoryChecked === categoryTotal
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-battle-grey/50 text-gray-400'
                  }`}>
                    {categoryChecked}/{categoryTotal}
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all duration-200 ${
                        checkedItems[item.id]
                          ? 'bg-green-900/20'
                          : 'hover:bg-battle-grey/20'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 ${
                        checkedItems[item.id]
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-600 hover:border-gray-500'
                      }`}>
                        {checkedItems[item.id] && <Check className="w-4 h-4" />}
                      </div>
                      <span className={`flex-1 transition-all duration-200 text-sm ${
                        checkedItems[item.id]
                          ? 'text-gray-500 line-through'
                          : item.important
                          ? 'text-amber-300 font-medium'
                          : item.warning
                          ? 'text-orange-400'
                          : 'text-white'
                      }`}>
                        {item.text}
                        {item.important && !checkedItems[item.id] && (
                          <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Vigtigt
                          </span>
                        )}
                        {item.warning && !checkedItems[item.id] && (
                          <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                            OBS
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note for Hjemkomst */}
        {activeTab === 'hjemkomst' && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-red-400 font-semibold mb-1 text-sm">VIGTIGT ved defekt gear:</p>
                <p className="text-gray-300 text-sm">
                  Virker noget af gearet ikke, saa kommende opgave ikke er mulig at gennemfoere,
                  <strong className="text-red-400"> skal der ringes saa snart det er muligt</strong> saa det kan fixes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Segway Charging Note */}
        {activeTab === 'hjemkomst' && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔋</span>
              <div>
                <p className="text-green-400 font-semibold mb-1 text-sm">Opladning af Segways</p>
                <p className="text-gray-300 text-sm">
                  Tjek at begge dioder paa basen lyser <strong className="text-green-400">konstant groent</strong>.
                  Blinker de <strong className="text-red-400">roedt</strong> = problem (giv besked).
                  Blinker de <strong className="text-green-400">2 groenne</strong> = opladt (OK).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSegwayPackingList;
