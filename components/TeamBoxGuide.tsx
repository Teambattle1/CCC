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
  Briefcase,
  Play,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  uploadGuideImage,
  GuideSection
} from '../lib/supabase';

// Default sections from the TeamBox instructor manual
const DEFAULT_SECTIONS = [
  {
    section_key: 'maalsaetning',
    title: 'MÅLSÆTNING & TEAMS',
    content: `TeamBox er en mobil "Escaperoom Experience", bare som en "BREAK-IN" version, så vi kan have op til 18 hold samtidig til at "bryde" ind i samme "escaperoom".

Det handler om at løse ca 20 mindre opgaver i den rigtige rækkefølge, for at stoppe tiden inden der er gået 60 minutter.

TEAMOPDELING: 3-4 deltagere pr. team`,
    order_index: 0,
    icon: Target,
    color: 'red'
  },
  {
    section_key: 'tidsplan',
    title: 'TIDSPLAN',
    content: `FØR OPGAVEN:
• 15 min - Forberedelse, gense video, tjekliste afgang
• 15 min - Ankomst location, opsætning af boxe (2 min pr box)

AFVIKLING:
• 05 min - Velkomst og TEAMS
• 60 min - Afvikling
• 02 min - Kåring af vinder og afslutning

EFTER:
• 20 min - Oprydning og korrekt nedpakning
• 15-30 min - Nulstilling af boxe (ca. 3-4 min pr. box)
• 05 min - Tjekliste HJEMKOMST (Lager)`,
    order_index: 1,
    icon: Clock,
    color: 'blue'
  },
  {
    section_key: 'musik',
    title: 'MUSIK TIL OPGAVEN',
    content: `Connect JBL 5 musikafspiller med bluetooth – en tablet på WIFI eller din egen telefon.

BRUG denne playliste "MUSIK 1" generelt.

REGLER:
• Musik skal spille når gæsterne kommer - tilpas højt til et godt "lydtæppe"
• Sluk under velkomst og alle fællesinstruktioner
• Start igen når de går i gang med boxene
• Afspil også musik når der pakkes sammen til de sidste er gået

Er I flere instruktører, skal én tage ansvaret for musikken.
Har du smartwatch, kan Spotify justeres derfra.`,
    order_index: 2,
    icon: Music,
    color: 'green'
  },
  {
    section_key: 'foer_opgaven',
    title: 'FØR OPGAVEN',
    content: `Tjek at du har alt nedenstående med før du kører fra lageret...

PAKKELISTE:
• X grønne bokse (1 til hvert hold - tjek i app)
• 1-2 ekstrabokse – just in case
• Sorte filtmåtter til skrøbelige borde (1 til hver boks)
• 1 x powerbank til hver boks + extra
• 1 stk JBL musikafspiller
• 1 stk sækkevogn – hvis du skal slæbe dem

INSTRUKTØRKASSE:
• Lamineret holdnumre (Tal fra hold 1-18)
• Ekstramaterialer`,
    order_index: 3,
    icon: ClipboardList,
    color: 'yellow',
    link: '#teambox_packing_afgang',
    linkText: 'PAKKELISTE AFGANG',
    isInternal: true
  },
  {
    section_key: 'ankomst',
    title: 'ANKOMST & OPSÆTNING',
    content: `1. Find konferencecrew eller kontaktperson
2. Se i APP hvad der er aftalt - fortæl dette til konferencecrew
3. Er pladsen for lille? Find løsning FØR kunden kommer
4. SMS til kunden når du er ankommet

OPSÆTNING:
• Placer boksene med afstand - så hold ikke kan høre hinanden
• Sæt stole så alle på holdet kan se ind i boksen
• Placer så teams IKKE kan se hvad der sker i andres boxe
• Placer RØD kuvert + blok + kuglepen ovenpå boxen
• Lås med lille lås: 1-3-7-5 og SIKRER den er låst
• Tænd musikken svagt som det første`,
    order_index: 4,
    icon: MapPin,
    color: 'purple'
  },
  {
    section_key: 'velkomst',
    title: 'VELKOMST & INTRO',
    content: `Fordel teams rundt ved bordene (max 4, gerne 3 pr. hold).

Byd velkommen og fortæl:
• Hvem du er
• At du glæder dig

INTRO:
• De har 60 minutter til at bryde ind i boxen
• Komme igennem rummene og TRYKKE på den røde knap
• ALT hvad de skal bruge er VED og PÅ boksen (IKKE i rummet eller UNDER boxen)
• Boxen må IKKE vendes om!
• Når du siger klar, må de åbne den røde kuvert ovenpå boxen`,
    order_index: 5,
    icon: Users,
    color: 'orange'
  },
  {
    section_key: 'afvikling',
    title: 'AFVIKLING & HINTS',
    content: `Dit job er at sikre alle teams kommer igennem de enkelte rum - med/uden din hjælp.

Når de spørger om "løsninger" - giv HINTS, men IKKE svar!

TIDSFORVENTNINGER:
• Zone 1 - IND I BOX: 5-6 min
• Zone 2 - RUM 1: 15 min (ca. 55 min tilbage)
• Zone 3 - RUM 2: 15 min (ca. 40 min tilbage)
• Zone 4 - RUM 3: 10-12 min (ca. 25 min tilbage)
• Zone 5 - RUM 4: 10-12 min (ca. 10 min tilbage)

Hjælp med hints hvis de trækker over disse tider.
I Zone 5 hjælper du IKKE mere - heller ikke med nulstilling af låsen til den røde knap.`,
    order_index: 6,
    icon: HelpCircle,
    color: 'blue',
    link: 'https://l.ead.me/teambox-videoguide',
    linkText: 'SE VIDEO GUIDE'
  },
  {
    section_key: 'afslutning',
    title: 'AFSLUTNING & KÅRING',
    content: `Når alle er færdige:

1. Fortæl tiderne for TOP 3 teams
2. Kår vinderteamet højtideligt
3. Tak af og sig "håber I har haft en sjov Break-In oplevelse med os fra TeamBattle"

God stemning og anerkendelse til ALLE hold!`,
    order_index: 7,
    icon: Trophy,
    color: 'yellow'
  },
  {
    section_key: 'oprydning',
    title: 'OPRYDNING & HJEMKOMST',
    content: `Gearet skal virke og være klar til næste bruger!

EFTER HVER OPGAVE:
• Alle batterier skal oplades
• Alle boxe skal nulstilles jf. nulstillingsskema
• Skriv fejl/mangler i evalueringen
• Ring STRAKS hvis gear ikke virker til næste opgave

Se nulstillingsskema: https://l.ead.me/teambox-nulstil`,
    order_index: 8,
    icon: Home,
    color: 'green',
    link: '#teambox_packing_hjemkomst',
    linkText: 'TJEKLISTE HJEMKOMST',
    isInternal: true
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
}

interface TeamBoxGuideProps {
  onNavigate?: (view: string) => void;
}

const TeamBoxGuide: React.FC<TeamBoxGuideProps> = ({ onNavigate }) => {
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
    const result = await getGuideSections('teambox');

    if (result.success && result.data && result.data.length > 0) {
      // Merge saved data with default metadata
      const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
        const savedSection = result.data?.find(s => s.section_key === defaultSection.section_key);
        return {
          ...defaultSection,
          ...savedSection,
          activity: 'teambox',
          icon: defaultSection.icon,
          color: defaultSection.color,
          link: defaultSection.link,
          linkText: defaultSection.linkText
        } as SectionWithMeta;
      });
      setSections(mergedSections);
    } else {
      // Use defaults with activity set
      setSections(DEFAULT_SECTIONS.map(s => ({
        ...s,
        activity: 'teambox'
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
    const result = await uploadGuideImage(file, 'teambox', sectionKey);

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

  return (
    <div className="w-full max-w-6xl mx-auto px-2 tablet:px-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => uploadingSectionKey && handleImageUpload(e, uploadingSectionKey)}
      />

      {/* 3x3 Grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-3 tablet:gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const colorClasses = COLORS[section.color] || COLORS.blue;
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
        })}
      </div>
    </div>
  );
};

export default TeamBoxGuide;
