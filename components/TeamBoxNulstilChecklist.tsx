import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Circle, RotateCcw, ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PackingItem {
  id: string;
  text: string;
  subtext?: string;
  imageUrl?: string;
  indent?: boolean;
  isDivider?: boolean;
}

interface Section {
  id: string;
  title: string;
  items: PackingItem[];
}

// Default items - loaded from Supabase or fallback
const DEFAULT_ITEMS: PackingItem[] = [
  // ESCAPEBOX section
  { id: 'n-box', text: 'ESCAPEBOX', isDivider: true },
  { id: 'n-b1', text: 'Brief', subtext: 'Tjek der ikke er skrevet på det' },
  { id: 'n-b2', text: 'Blok', subtext: 'Tjek der ikke er skrevet på siderne' },
  { id: 'n-b3', text: 'Kuglepen' },
  { id: 'n-b4', text: 'Rød Kuvert', subtext: 'Tjek den er TOM før start' },
  { id: 'n-b5', text: 'Kodelås 3593', subtext: 'Tjek den er nulstillet' },
  { id: 'n-b6', text: 'Kodelås 4 cifre - 1375', subtext: 'Tjek den er nulstillet' },
  // RUM 1 section
  { id: 'n-r1', text: 'RUM 1', isDivider: true },
  { id: 'n-r1-1', text: 'Kortmåler', subtext: 'Tjek den er nulstillet' },
  { id: 'n-r1-2', text: 'Vandflaske (kode 130)', subtext: 'Tjek den åbner + der er vand i' },
  { id: 'n-r1-3', text: 'Sæt koden til "random"' },
  { id: 'n-r1-4', text: 'Pensel' },
  { id: 'n-r1-5', text: 'Papir med "missil etc."', subtext: 'Tjek der ikke er skrevet på' },
  { id: 'n-r1-6', text: 'Kodehjul', subtext: 'Drej det til tilfældig position' },
  { id: 'n-r1-7', text: 'Kuvert med "frimærke"', subtext: 'Tjek den er tom ved start' },
  { id: 'n-r1-8', text: 'Papirsflyver' },
  { id: 'n-r1-9', text: 'Ledere med flag' },
  { id: 'n-r1-10', text: 'Tank' },
  { id: 'n-r1-11', text: 'Sænke slagskib' },
  { id: 'n-r1-12', text: 'Filmstrimmel' },
  // RUM 2 section
  { id: 'n-r2', text: 'RUM 2', isDivider: true },
  { id: 'n-r2-1', text: 'Kode "retning"', subtext: 'Ned/Venstre/Op' },
  { id: 'n-r2-2', text: 'Hvide låse', subtext: 'Pres 2 gange på "bøjle" for nulstilling' },
  { id: 'n-r2-3', text: 'Bogstaver med huller', subtext: 'Tjek der IKKE er skrevet på' },
  { id: 'n-r2-4', text: 'Google Translate', subtext: 'Tjek der IKKE er skrevet på' },
  { id: 'n-r2-5', text: 'Puzzle', subtext: 'Find evt. manglende brikker' },
  // RUM 3 section
  { id: 'n-r3', text: 'RUM 3', isDivider: true },
  { id: 'n-r3-1', text: 'Højtaler', subtext: 'Sæt frekvens til ca. 92.0' },
  { id: 'n-r3-2', text: 'Tjek højtaler MORSER' },
  { id: 'n-r3-3', text: 'Drej frekvens helt til venstre igen' },
  { id: 'n-r3-4', text: 'FJERN BATTERIER/SLUK POWERBANK', subtext: 'Skal den lades?' },
  { id: 'n-r3-5', text: 'Kort med MORSE', subtext: 'Tjek der IKKE er skrevet på' },
  { id: 'n-r3-6', text: 'Kæden', subtext: 'Tjek låst i nederste + yderste led' },
  { id: 'n-r3-7', text: 'Hængelås kode 555' },
  // RUM 4 section
  { id: 'n-r4', text: 'RUM 4', isDivider: true },
  { id: 'n-r4-1', text: 'Penge', subtext: '9 sedler (8 er OK): 5,10,50,100,200,500,1000,2000,5000' },
  { id: 'n-r4-2', text: 'Labyrint', subtext: 'Tjek der IKKE er skrevet på papir' },
  { id: 'n-r4-3', text: 'Overhead', subtext: 'Tjek der ikke er skrevet på + placer print BAG' },
  { id: 'n-r4-4', text: 'Tjek at låg er låst foran i hullet' },
  { id: 'n-r4-5', text: 'Morselås – Kode MORSE', subtext: '"random" ved låsning' },
  { id: 'n-r4-6', text: 'HJULLÅS – LÅS DENNE' },
  { id: 'n-r4-7', text: 'Hvid Kuvert' },
];

interface TeamBoxNulstilChecklistProps {
  onBack: () => void;
}

const TeamBoxNulstilChecklist: React.FC<TeamBoxNulstilChecklistProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const storageKey = 'teambox_nulstil_checklist';

  // Load items from Supabase
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('packing_lists')
          .select('items')
          .eq('activity', 'teambox')
          .eq('list_type', 'nulstil')
          .single();

        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch (err) {
        console.error('Error loading checklist:', err);
        setItems(DEFAULT_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  // Parse items into sections based on dividers
  useEffect(() => {
    if (items.length === 0) return;

    const parsedSections: Section[] = [];
    let currentSectionItems: PackingItem[] = [];
    let currentSectionTitle = 'ITEMS';
    let currentSectionId = 'default';

    items.forEach((item) => {
      if (item.isDivider) {
        // Save previous section if it has items
        if (currentSectionItems.length > 0) {
          parsedSections.push({
            id: currentSectionId,
            title: currentSectionTitle,
            items: currentSectionItems
          });
        }
        // Start new section
        currentSectionTitle = item.text;
        currentSectionId = item.id;
        currentSectionItems = [];
      } else {
        currentSectionItems.push(item);
      }
    });

    // Add last section
    if (currentSectionItems.length > 0) {
      parsedSections.push({
        id: currentSectionId,
        title: currentSectionTitle,
        items: currentSectionItems
      });
    }

    setSections(parsedSections);
  }, [items]);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCheckedItems(new Set(parsed.checked || []));
        if (parsed.startTime) {
          setStartTime(new Date(parsed.startTime));
        }
      } catch (e) {
        console.error('Failed to load checklist:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (items.length > 0 && checkedItems.size > 0) {
      const toSave = {
        checked: [...checkedItems],
        startTime: startTime?.toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    }
  }, [checkedItems, startTime, items.length]);

  // Start timer on first check
  const handleFirstCheck = () => {
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  const toggleItem = (itemId: string) => {
    handleFirstCheck();
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const checkAllSection = () => {
    handleFirstCheck();
    const currentItems = sections[currentSection]?.items || [];
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      currentItems.forEach(item => newSet.add(item.id));
      return newSet;
    });
  };

  const resetSection = () => {
    if (confirm('Nulstil alle i denne sektion?')) {
      const currentItems = sections[currentSection]?.items || [];
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        currentItems.forEach(item => newSet.delete(item.id));
        return newSet;
      });
    }
  };

  const resetAll = () => {
    if (confirm('Nulstil HELE tjeklisten?')) {
      setCheckedItems(new Set());
      setStartTime(null);
      setCurrentSection(0);
      localStorage.removeItem(storageKey);
    }
  };

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goPrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Calculate progress
  const allCheckableItems = sections.flatMap(s => s.items);
  const totalItems = allCheckableItems.length;
  const totalChecked = checkedItems.size;
  const overallProgress = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;

  const section = sections[currentSection];
  const sectionChecked = section?.items.filter(i => checkedItems.has(i.id)).length || 0;
  const sectionTotal = section?.items.length || 0;
  const sectionProgress = sectionTotal > 0 ? (sectionChecked / sectionTotal) * 100 : 0;

  // Calculate duration
  const getDuration = () => {
    if (!startTime) return '0 min';
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}t ${mins}m`;
  };

  // Complete and save
  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const endTime = new Date();
      const duration = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      // Save completion to Supabase
      const { error } = await supabase
        .from('packing_list_completions')
        .insert({
          activity: 'teambox',
          list_type: 'nulstil',
          completed_by: profile?.email || 'unknown',
          completed_by_name: profile?.name || profile?.email || 'unknown',
          started_at: startTime?.toISOString(),
          completed_at: endTime.toISOString(),
          duration_seconds: duration,
          items_checked: totalChecked,
          items_total: totalItems
        });

      if (error) {
        console.error('Error saving completion:', error);
      }

      // Clear localStorage
      localStorage.removeItem(storageKey);
      setCompleted(true);
    } catch (err) {
      console.error('Error completing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (completed) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-green-500/30 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-400 uppercase tracking-wider mb-2">
            Tjekliste Fuldført!
          </h2>
          <p className="text-gray-400 mb-2">
            Boxen er klar til næste bruger.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tid brugt: {getDuration()}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCompleted(false);
                setCheckedItems(new Set());
                setStartTime(null);
                setCurrentSection(0);
              }}
              className="px-6 py-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange uppercase tracking-wider hover:bg-battle-orange/30 transition-colors"
            >
              Start Forfra
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white uppercase tracking-wider hover:bg-white/20 transition-colors"
            >
              Tilbage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
        <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm text-center">
          <div className="w-8 h-8 border-2 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Indlæser tjekliste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
      <div className="bg-battle-grey/20 border border-white/10 rounded-xl tablet:rounded-2xl p-4 tablet:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-base tablet:text-xl font-bold text-white uppercase tracking-wider">
                {section?.title || 'NULSTIL BOX'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] tablet:text-xs text-orange-400 uppercase">
                <Clock className="w-3 h-3" />
                <span>{getDuration()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkAllSection}
              className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={resetSection}
              className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {sections.map((s, idx) => {
            const sChecked = s.items.filter(i => checkedItems.has(i.id)).length;
            const sTotal = s.items.length;
            const isComplete = sChecked === sTotal;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentSection(idx)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                  idx === currentSection
                    ? 'bg-battle-orange text-white'
                    : isComplete
                    ? 'bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {s.title === 'ESCAPEBOX' ? 'BOX' : s.title}
              </button>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Total: {totalChecked}/{totalItems}</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-1.5 bg-battle-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                overallProgress === 100 ? 'bg-green-500' : 'bg-battle-orange/50'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Section Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{sectionChecked} / {sectionTotal}</span>
            <span>{Math.round(sectionProgress)}%</span>
          </div>
          <div className="h-2 bg-battle-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                sectionProgress === 100 ? 'bg-green-500' : 'bg-battle-orange'
              }`}
              style={{ width: `${sectionProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4 max-h-[40vh] overflow-y-auto">
          {section?.items.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                  isChecked
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-battle-black/30 border border-white/5 hover:border-white/20'
                }`}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm tablet:text-base block uppercase ${
                    isChecked ? 'text-green-400 line-through' : 'text-white'
                  }`}>
                    {item.text}
                  </span>
                  {item.subtext && (
                    <span className={`text-xs uppercase ${isChecked ? 'text-green-400/60' : 'text-gray-500'}`}>
                      {item.subtext}
                    </span>
                  )}
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={goPrev}
            disabled={currentSection === 0}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Forrige
          </button>
          {currentSection === sections.length - 1 && overallProgress === 100 ? (
            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Fuldfør
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={currentSection === sections.length - 1}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange hover:bg-battle-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Næste
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Reset All Button */}
        <button
          onClick={resetAll}
          className="w-full mt-3 p-2 text-xs text-gray-500 hover:text-red-400 transition-colors uppercase"
        >
          Nulstil Hele Tjeklisten
        </button>
      </div>
    </div>
  );
};

export default TeamBoxNulstilChecklist;
