import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Users,
  Music,
  Clock,
  ClipboardList,
  MapPin,
  Settings,
  Trophy,
  Home,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Edit3,
  Save,
  ExternalLink,
  PackageCheck,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  uploadGuideImage,
  GuideSection
} from '../lib/supabase';

// Category definitions
type CategoryKey = 'before' | 'during' | 'after';

const CATEGORIES: Record<CategoryKey, { title: string; icon: React.ElementType; color: string }> = {
  before: { title: 'FØR OPGAVEN', icon: PackageCheck, color: 'green' },
  during: { title: 'UNDER OPGAVEN', icon: Play, color: 'yellow' },
  after: { title: 'EFTER OPGAVEN', icon: CheckCircle2, color: 'red' }
};

// Default sections from the TeamConstruct instructor manual
const DEFAULT_SECTIONS = [
  {
    section_key: 'maalsaetning',
    title: 'MÅLSÆTNING & TEAMS',
    content: `Formålet med TeamConstruct er at alle TEAMS skal løse en 100% ens opgave, med de helt samme materialer, og med et Add-on midtvejs i tiden.

TEAMOPDELING: 3-4 deltagere pr. team

Resultatet bliver, trods samme udgangspunkt – meget forskelligt.`,
    order_index: 0,
    icon: Target,
    color: 'red',
    category: 'before' as CategoryKey
  },
  {
    section_key: 'musik',
    title: 'MUSIK TIL OPGAVEN',
    content: `Connect JBL musikafspiller med bluetooth til din telefon.

Start TeamBattle Play QR playliste - findes i tablet kassernes låg.

REGLER:
• Musik skal spille når gæsterne kommer
• Sluk under velkomst og fællesinstruktioner
• Tænd når holdene bygger
• Tænd altid ved oprydning`,
    order_index: 1,
    icon: Music,
    color: 'green',
    category: 'during' as CategoryKey
  },
  {
    section_key: 'tidsplan',
    title: 'TIDSPLAN',
    content: `FØR OPGAVEN:
• 15 min - Forberedelse lager (Tjekliste AFGANG)
• 10 min - Opsætning af gear

AFVIKLING:
• 30 min - Velkomst og TEAMS
• 05 min - Instruktion
• 60-65 min - Konkurrence

EFTER:
• 15 min - Kåring og afslutning
• 15 min - Oprydning
• 10 min - Tjekliste HJEMKOMST`,
    order_index: 2,
    icon: Clock,
    color: 'blue',
    category: 'before' as CategoryKey
  },
  {
    section_key: 'foer_opgaven',
    title: 'PAKKELISTE & TJEK',
    content: `Tjek de gule/sorte værktøjskasser.

PAKKELISTE:
• Paprør (2,5 til hver gruppe = 4 meter)
• Rundstokke (3 pinde til hvert hold)
• Sorte/gule Construct kasser med:
  - Golfbold, skærebræt, sav
  - Skærehandsker, målebånd
  - Gaffatape, manual DK/UK
• Gul gearkasse med ekstra udstyr
• ADD ON A5 kort
• Sorte borde (et til hvert hold)`,
    order_index: 3,
    icon: ClipboardList,
    color: 'yellow',
    link: '#teamconstruct_packing_afgang',
    linkText: 'PAKKELISTE AFGANG',
    isInternal: true,
    category: 'before' as CategoryKey
  },
  {
    section_key: 'ankomst',
    title: 'ANKOMST & OPSÆTNING',
    content: `1. Find konferencecrew eller kontaktperson
2. Tjek location i app: teambattle.dk/map
3. Er pladsen for lille? Find løsning FØR kunden kommer
4. SMS til kunden når du er ankommet

OPSÆTNING:
• Hvert hold: sort foldebord, 3 rundstokke, 2,5 paprør, gul/sort gearkasse
• Ca. 5 meters afstand mellem bordene
• Tænd musik svagt som det første`,
    order_index: 4,
    icon: MapPin,
    color: 'purple',
    link: 'https://l.ead.me/TeamConstruct-Video',
    linkText: 'SE OPSÆTNING VIDEO',
    category: 'before' as CategoryKey
  },
  {
    section_key: 'velkomst',
    title: 'VELKOMST',
    content: `Byd velkommen og fortæl:
• Hvem du er
• At du glæder dig til at udfordre dem
• Det er en underholdende konstruktionsopgave
• Der kommer lidt overraskelser undervejs

Sørg for at ALLE kan høre dig tydeligt.`,
    order_index: 5,
    icon: Users,
    color: 'orange',
    category: 'during' as CategoryKey
  },
  {
    section_key: 'afvikling',
    title: 'AFVIKLING & SIKKERHED',
    content: `Dit job er at sikre:
• Alle forstår opgaven
• Sikkerhedsregler overholdes
• Tiderne overholdes
• Add-on udleveres på det rigtige tidspunkt

SIKKERHED:
• Skærehandsker SKAL bruges ved savning
• Hold øje med korrekt brug af værktøj
• Grib ind ved farlig adfærd`,
    order_index: 6,
    icon: Settings,
    color: 'red',
    link: 'https://l.ead.me/TeamConstruct-Video',
    linkText: 'SE AFVIKLING VIDEO',
    category: 'during' as CategoryKey
  },
  {
    section_key: 'kaaring',
    title: 'KONKURRENCE & KÅRING',
    content: `AFSLUTNINGEN ER DET VIGTIGSTE!

1. Alle fra alle hold går rundt sammen
2. Et hold tjekker om modstanderen opfylder kriterierne
3. Du noterer pointene ned
4. Annoncér vinderen højtideligt

Sørg for god stemning og anerkendelse til ALLE hold.`,
    order_index: 7,
    icon: Trophy,
    color: 'yellow',
    category: 'during' as CategoryKey
  },
  {
    section_key: 'oprydning',
    title: 'OPRYDNING & HJEMKOMST',
    content: `Gearet skal virke og være klar til næste bruger!

EFTER HVER OPGAVE:
• Smid brugte paprør og gaffatape ud
• OMPAK og tjek alt i de gule værktøjskasser
• Skriv fejl/mangler i evalueringen
• Ring STRAKS hvis gear ikke virker

Tænd musik under oprydning!`,
    order_index: 8,
    icon: Home,
    color: 'green',
    link: '#teamconstruct_packing_hjemkomst',
    linkText: 'TJEKLISTE HJEMKOMST',
    isInternal: true,
    category: 'after' as CategoryKey
  }
];

const COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-500' }
};

interface SectionWithMeta extends GuideSection {
  icon: React.ElementType;
  color: string;
  link?: string;
  linkText?: string;
  isInternal?: boolean;
  category: CategoryKey;
}

interface TeamConstructGuideProps {
  onNavigate?: (view: string) => void;
}

const TeamConstructGuide: React.FC<TeamConstructGuideProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [sections, setSections] = useState<SectionWithMeta[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    const result = await getGuideSections('teamconstruct');

    if (result.success && result.data && result.data.length > 0) {
      // Merge saved data with default metadata
      const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
        const savedSection = result.data?.find(s => s.section_key === defaultSection.section_key);
        return {
          ...defaultSection,
          ...savedSection,
          activity: 'teamconstruct',
          icon: defaultSection.icon,
          color: defaultSection.color,
          link: defaultSection.link,
          linkText: defaultSection.linkText,
          category: defaultSection.category
        } as SectionWithMeta;
      });
      setSections(mergedSections);
    } else {
      // Use defaults with activity set
      setSections(DEFAULT_SECTIONS.map(s => ({
        ...s,
        activity: 'teamconstruct'
      } as SectionWithMeta)));
    }
    setIsLoading(false);
  };

  const handleToggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const handleStartEdit = (section: SectionWithMeta) => {
    setEditingSection(section.section_key);
    setEditContent(section.content);
  };

  const handleSaveEdit = async (section: SectionWithMeta) => {
    setIsSaving(true);
    const updatedSection = {
      ...section,
      content: editContent
    };

    const result = await saveGuideSection(updatedSection);
    if (result.success) {
      setSections(prev => prev.map(s =>
        s.section_key === section.section_key
          ? { ...s, content: editContent, id: result.id || s.id }
          : s
      ));
      setEditingSection(null);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionKey(sectionKey);
    const result = await uploadGuideImage(file, 'teamconstruct', sectionKey);

    if (result.success && result.url) {
      const section = sections.find(s => s.section_key === sectionKey);
      if (section) {
        const updatedSection = { ...section, image_url: result.url };
        const saveResult = await saveGuideSection(updatedSection);
        if (saveResult.success) {
          setSections(prev => prev.map(s =>
            s.section_key === sectionKey
              ? { ...s, image_url: result.url, id: saveResult.id || s.id }
              : s
          ));
        }
      }
    }
    setUploadingSectionKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = (sectionKey: string) => {
    setUploadingSectionKey(sectionKey);
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="text-battle-orange text-lg uppercase tracking-widest">INDLÆSER GUIDE...</div>
      </div>
    );
  }

  // Group sections by category
  const sectionsByCategory = {
    before: sections.filter(s => s.category === 'before'),
    during: sections.filter(s => s.category === 'during'),
    after: sections.filter(s => s.category === 'after')
  };

  const renderSection = (section: SectionWithMeta, categoryColor: string) => {
          const Icon = section.icon;
          const colorClasses = COLORS[categoryColor] || COLORS.blue;
          const isExpanded = expandedSection === section.section_key;
          const isEditing = editingSection === section.section_key;

          return (
            <div
              key={section.section_key}
              className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} overflow-hidden transition-all duration-300 ${
                isExpanded ? 'tablet:col-span-3 tablet:row-span-2' : ''
              }`}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => handleToggleSection(section.section_key)}
                className="w-full p-3 tablet:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                    <Icon className={`w-5 h-5 tablet:w-6 tablet:h-6 ${colorClasses.icon}`} />
                  </div>
                  <h3 className={`text-sm tablet:text-base font-bold uppercase tracking-wider ${colorClasses.text}`}>
                    {section.title}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${colorClasses.text}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${colorClasses.text}`} />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 tablet:p-6 border-t border-white/10">
                  <div className="flex flex-col tablet:flex-row gap-4">
                    {/* Image Section */}
                    <div className="tablet:w-1/3">
                      {section.image_url ? (
                        <div className="relative group">
                          <img
                            src={section.image_url}
                            alt={section.title}
                            className="w-full h-48 tablet:h-64 object-cover rounded-lg"
                          />
                          {isAdmin && (
                            <button
                              onClick={() => triggerImageUpload(section.section_key)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                            >
                              <Upload className="w-8 h-8 text-white" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-full h-48 tablet:h-64 rounded-lg border-2 border-dashed ${colorClasses.border} flex flex-col items-center justify-center gap-2 ${
                            isAdmin ? 'cursor-pointer hover:bg-white/5' : ''
                          }`}
                          onClick={() => isAdmin && triggerImageUpload(section.section_key)}
                        >
                          <Icon className={`w-12 h-12 ${colorClasses.icon} opacity-30`} />
                          {isAdmin && (
                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                              UPLOAD BILLEDE
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="tablet:w-2/3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-64 bg-battle-black/50 border border-white/20 rounded-lg p-4 text-white text-sm leading-relaxed resize-none focus:outline-none focus:border-battle-orange"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(section)}
                              disabled={isSaving}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {isSaving ? 'GEMMER...' : 'GEM'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              ANNULLER
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="text-sm tablet:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                            {section.content}
                          </div>

                          {/* Action buttons */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {section.link && (
                              section.isInternal && onNavigate ? (
                                <button
                                  onClick={() => {
                                    const view = section.link?.replace('#', '') || '';
                                    onNavigate(view);
                                  }}
                                  className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {section.linkText || 'ÅBEN'}
                                </button>
                              ) : (
                                <a
                                  href={section.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {section.linkText || 'ÅBEN LINK'}
                                </a>
                              )
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleStartEdit(section)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-battle-orange/20 border border-battle-orange/30 rounded-lg text-battle-orange text-xs uppercase tracking-wider hover:bg-battle-orange/30 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                REDIGER
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 tablet:px-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => uploadingSectionKey && handleImageUpload(e, uploadingSectionKey)}
      />

      {/* Category-based layout */}
      <div className="space-y-6">
        {/* FØR OPGAVEN - Green */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-3 tablet:p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <PackageCheck className="w-5 h-5 tablet:w-6 tablet:h-6 text-green-500" />
            </div>
            <h2 className="text-base tablet:text-lg font-bold uppercase tracking-wider text-green-400">
              FØR OPGAVEN
            </h2>
            <span className="text-xs text-green-400/50">({sectionsByCategory.before.length} sektioner)</span>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-3">
            {sectionsByCategory.before.map(s => renderSection(s, 'green'))}
          </div>
        </div>

        {/* UNDER OPGAVEN - Yellow */}
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-3 tablet:p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <Play className="w-5 h-5 tablet:w-6 tablet:h-6 text-yellow-500" />
            </div>
            <h2 className="text-base tablet:text-lg font-bold uppercase tracking-wider text-yellow-400">
              UNDER OPGAVEN
            </h2>
            <span className="text-xs text-yellow-400/50">({sectionsByCategory.during.length} sektioner)</span>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-3">
            {sectionsByCategory.during.map(s => renderSection(s, 'yellow'))}
          </div>
        </div>

        {/* EFTER OPGAVEN - Red */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-3 tablet:p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <CheckCircle2 className="w-5 h-5 tablet:w-6 tablet:h-6 text-red-500" />
            </div>
            <h2 className="text-base tablet:text-lg font-bold uppercase tracking-wider text-red-400">
              EFTER OPGAVEN
            </h2>
            <span className="text-xs text-red-400/50">({sectionsByCategory.after.length} sektioner)</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {sectionsByCategory.after.map(s => renderSection(s, 'red'))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamConstructGuide;
