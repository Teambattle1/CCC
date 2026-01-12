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

const TeamLazerPackingList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'afgang' | 'x2' | 'hjemkomst'>('afgang');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('teamlazer_packing');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    localStorage.setItem('teamlazer_packing', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const afgangItems: ItemsByCategory = {
    gevaerer: {
      title: "GEVAERER",
      icon: "🔫",
      items: [
        { id: 'ag1', text: '1 saet = 5 gevaerer (ALTID)', important: true },
        { id: 'ag2', text: 'Tjek at ALLE 5 gevaerer fungerer inden afgang', important: true },
        { id: 'ag3', text: '24 stk. genopladelige batterier', important: true },
        { id: 'ag4', text: 'Batterier skal IKKE sidde i gevaer under koersel!', warning: true },
      ]
    },
    duer: {
      title: "DUER",
      icon: "🎯",
      items: [
        { id: 'ad1', text: '1 stk. duekaster (tjek on/off knap virker)' },
        { id: 'ad2', text: 'Ploekker til kaster' },
        { id: 'ad3', text: '1 kasse med duer' },
        { id: 'ad4', text: 'Knaepude' },
        { id: 'ad5', text: 'Fjeder til duekaster - TJEK i duekasse!!!', important: true },
        { id: 'ad6', text: 'Taarn til duer inkl. alle 3 vingemoetrikker' },
      ]
    },
    display: {
      title: "DISPLAY",
      icon: "📺",
      items: [
        { id: 'adis1', text: 'Display - Taend og TEST (gul TEST knap bagpaa)', important: true },
      ]
    },
    gearkasse: {
      title: "GEARKASSE (sort med orange haandtag)",
      icon: "🧰",
      items: [
        { id: 'ak1', text: '3 blaa kabelruller' },
        { id: 'ak2', text: '1 Controller' },
        { id: 'ak3', text: '1 kabel til kaster' },
        { id: 'ak4', text: '1 kabel til 12V (Bilstik)' },
        { id: 'ak5', text: '1 ekstra lader til anlaeg' },
        { id: 'ak6', text: '2 stk. hoejtalere til display' },
        { id: 'ak7', text: '1 scoreboard i blaa lukket clipboard' },
        { id: 'ak8', text: 'Pointskemaer paa blok + skrivevaerktoej (tjek de virker!)' },
      ]
    },
    andet: {
      title: "ANDET",
      icon: "📦",
      items: [
        { id: 'aa1', text: '5 stk. nummermaatter' },
        { id: 'aa2', text: '1 stk. hoejt cafebord til pointboard og controller' },
        { id: 'aa3', text: 'JBL Extreme musikafspiller (hentes paa reolen)', important: true },
        { id: 'aa4', text: 'Musik: l.ead.me/musik1' },
      ]
    },
    overvej: {
      title: "OVERVEJ OGSAA",
      icon: "🤔",
      items: [
        { id: 'ao1', text: 'Koblingssaet til 2 SETUP?' },
        { id: 'ao2', text: 'NATSKYDNING udstyr?' },
        { id: 'ao3', text: 'Afspaerringspinde/baand' },
        { id: 'ao4', text: 'Telt ved daarligt vejr + jernklodser', warning: true },
      ]
    }
  };

  const x2Items: ItemsByCategory = {
    gevaerer: {
      title: "GEVAERER (x2 SETUP)",
      icon: "🔫",
      items: [
        { id: 'xg1', text: '2 saet = 10 gevaerer total', important: true },
        { id: 'xg2', text: 'Tjek at ALLE 10 gevaerer fungerer inden afgang', important: true },
        { id: 'xg3', text: '48 stk. genopladelige batterier (24 pr. saet)', important: true },
        { id: 'xg4', text: 'Batterier skal IKKE sidde i gevaer under koersel!', warning: true },
      ]
    },
    duer: {
      title: "DUER (x2 SETUP)",
      icon: "🎯",
      items: [
        { id: 'xd1', text: '2 stk. duekastere (tjek on/off knap virker)' },
        { id: 'xd2', text: 'Ploekker til begge kastere' },
        { id: 'xd3', text: '2 kasser med duer' },
        { id: 'xd4', text: '2 knaepuder' },
        { id: 'xd5', text: 'Fjeder til duekastere - TJEK i begge duekasser!!!', important: true },
        { id: 'xd6', text: '2 taarne til duer inkl. alle 6 vingemoetrikker' },
      ]
    },
    display: {
      title: "DISPLAY (x2 SETUP)",
      icon: "📺",
      items: [
        { id: 'xdis1', text: '2 displays - Taend og TEST begge (gul TEST knap bagpaa)', important: true },
      ]
    },
    gearkasse: {
      title: "GEARKASSER (x2 SETUP)",
      icon: "🧰",
      items: [
        { id: 'xk1', text: '6 blaa kabelruller (3 pr. saet)' },
        { id: 'xk2', text: '2 Controllers' },
        { id: 'xk3', text: '2 kabler til kastere' },
        { id: 'xk4', text: '2 kabler til 12V (Bilstik)' },
        { id: 'xk5', text: '2 ekstra ladere til anlaeg' },
        { id: 'xk6', text: '4 stk. hoejtalere til displays' },
        { id: 'xk7', text: '2 scoreboards i blaa lukket clipboard' },
        { id: 'xk8', text: 'Ekstra pointskemaer + skrivevaerktoej' },
      ]
    },
    andet: {
      title: "ANDET (x2 SETUP)",
      icon: "📦",
      items: [
        { id: 'xa1', text: '10 stk. nummermaatter (5 pr. saet)' },
        { id: 'xa2', text: '2 stk. hoeje cafeborde til pointboards og controllers' },
        { id: 'xa3', text: 'JBL Extreme musikafspiller (hentes paa reolen)', important: true },
        { id: 'xa4', text: 'Koblingssaet til 2 SETUP', important: true },
      ]
    },
    overvej: {
      title: "OVERVEJ OGSAA",
      icon: "🤔",
      items: [
        { id: 'xo1', text: 'NATSKYDNING udstyr?' },
        { id: 'xo2', text: 'Afspaerringspinde/baand (ekstra ved 2 setup)' },
        { id: 'xo3', text: 'Telt ved daarligt vejr + jernklodser', warning: true },
      ]
    }
  };

  const hjemkomstItems: ItemsByCategory = {
    vaadtGear: {
      title: "VAADT GEAR (ordnes MED DET SAMME!)",
      icon: "💧",
      items: [
        { id: 'hv1', text: 'Fjern batterier fra gevaerer', important: true },
        { id: 'hv2', text: 'Saet batterier til opladning', important: true },
        { id: 'hv3', text: 'Alt gear toerres af med viskestykke' },
        { id: 'hv4', text: 'Har det regnet: Duer toemmes ud og lufttoerres' },
        { id: 'hv5', text: 'Alle vaade kabler og stik/controller haenges op' },
        { id: 'hv6', text: 'Alle brugte pointskemaer smides ud' },
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
      case 'x2': return x2Items;
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
      case 'x2': return 'from-blue-500 to-indigo-600';
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
            onClick={() => setActiveTab('x2')}
            className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
              activeTab === 'x2'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-battle-black/50 text-gray-400 hover:bg-battle-grey/50 hover:text-white'
            }`}
          >
            ✖️ X2
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
            <p className="text-gray-300 text-sm">📦 Standard pakkeliste til ét setup</p>
          )}
          {activeTab === 'x2' && (
            <p className="text-indigo-300 text-sm">✖️ Dobbelt setup - 2 stationer</p>
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

        {/* X2 Special Note */}
        {activeTab === 'x2' && (
          <div className="mt-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="text-indigo-400 font-semibold mb-1 text-sm">Dobbelt Setup</p>
                <p className="text-gray-300 text-sm">
                  Denne liste er til opgaver med 2 stationer. Husk koblingssaet og tjek at ALT udstyr er dobbelt.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLazerPackingList;
