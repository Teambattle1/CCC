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
  Car,
  Flag,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  uploadGuideImage,
  GuideSection
} from '../lib/supabase';

// Default sections for TeamRace instructor manual (MARTS 2024)
const DEFAULT_SECTIONS = [
  {
    section_key: 'maalsaetning',
    title: 'MÅLSÆTNING & TEAMS',
    content: `Team Race - Byg din egen sæbekassebil og kør om kap!

TEAMOPDELING: 3-4 deltagere pr. team

Holdene skal bygge en sæbekassebil fra bunden og derefter konkurrere i et spændende race.`,
    order_index: 0,
    icon: Target,
    color: 'red'
  },
  {
    section_key: 'musik',
    title: 'MUSIK TIL OPGAVEN',
    content: `Connect JBL 5 musikafspiller med bluetooth - og enten en tablet på WIFI eller din egen telefon.

Start TeamBattle Play QR playliste:
https://tinyurl.com/2ynxb3zg

QR kode til start findes også inde i alle tablet kassernes låg.

REGLER:
• Der forventes at der spiller musik NÅR GÆSTERNE KOMMER - tilpas højt til at der er et godt "lydtæppe"
• SLUK under velkomst og alle fællesinstruktioner
• HAV ALTID musikken kørende, på nær når du instruerer alle samlet

Er I flere instruktører, skal en af jer tage ansvaret for at slukke og tænde.
(Har du Apple Watch, kan Spotify justeres derfra)`,
    order_index: 1,
    icon: Music,
    color: 'green'
  },
  {
    section_key: 'tidsplan',
    title: 'TIDSPLAN',
    content: `TIDSPLAN (tentativ):

1. Før opgaven                    10 min
   • Tjekliste AFGANG
2. Ankomst location
3. Opsætning af gear & bane       15 min
4. Velkomst og TEAMS              05 min
5. Byggetid og Konkurrence        75 min
6. Kåring af vinder og afslutning 05 min
7. Oprydning og korrekt nedpakning 10 min
8. Tjekliste HJEMKOMST (Lager)    10 min`,
    order_index: 2,
    icon: Clock,
    color: 'blue'
  },
  {
    section_key: 'foer_opgaven',
    title: 'FØR OPGAVEN',
    content: `INDEN DER KØRES AFSTED:
Bilen pakkes med alt udstyr:
• Færdigpakkede tasker (se pakkeliste)
• Borde
• Værktøj-kasse
• Udsmyknings-kasse
• Skrue-kasse

VIGTIGT: Sikr at batterier til boremaskiner er FULDT OPLADET!

TEAMRACE – Pakkeliste ved AFGANG:
• Sorte tasker med brædder til at bygge sæbekassebiler
• Kasser med hjelme
• En gearkasse med:
  - Pointskemaer
  - Kuglepen
  - Kegler
  - Regnslag
• 1 stk. højt cafébord til point
• 2 stk. sorte borde til at stille udstyr på
• En gul kasse med værktøj
• En gul kasse med skruemaskiner + opladte batterier
• En gul kasse med tape til at pynte sæbekassebilen
• (I tilfælde af regn - 1 stk. telt + Jernklodser)`,
    order_index: 3,
    icon: ClipboardList,
    color: 'yellow',
    link: 'https://check.eventday.dk/pakkeliste/teamrace/afgang',
    linkText: 'PAKKELISTE AFGANG',
    isInternal: false
  },
  {
    section_key: 'ankomst',
    title: 'ANKOMST & OPSÆTNING',
    content: `2. ANKOMST LOCATION
Find konferencecrew, eller kontaktperson hvis på firma. Få anvist område, se gerne i APP hvad der er aftalt, og fortæl dette til konferencecrew, da de ikke altid ved hvad der er aftalt af deres kollegaer.

Smid en SMS til kunden når du er ankommet, og hvor de kan finde dig, og går derefter i gang med at sætte op.

Tænd musikken svagt som det første.

3. OPSÆTNING GEAR & BANE(R)
OPSÆTNING AF TEAMS:
• Hvert team skal have: 1 bord + færdigpakket taske + værktøj

BANEOPBYGNING:
• Lav en forholdsvis kort bane med:
  - 1 fuld omkørsel om 2 kegler
  - Slalom om 5-6 kegler
  - Evt. en større slalom
• Lav et pit-område med ind- og udkørsel

VIGTIGT: Lad være med at gøre SYNLIGT klar til race delen / konkurrencen før de har åbnet taskerne og er gået i gang med at bygge sæbekassebilen.`,
    order_index: 4,
    icon: MapPin,
    color: 'purple'
  },
  {
    section_key: 'velkomst',
    title: 'VELKOMST & TEAMS',
    content: `4. VELKOMST og TEAMS

Byd initialt velkommen, fortæl hvem du er, og at du glæder dig.

VIGTIGT: Fortæl IKKE så meget om hvad de skal - men hvor de finder de ting der skal bruges.

De finder selv hurtigt ud af at de skal bygge en sæbekassebil.`,
    order_index: 5,
    icon: Users,
    color: 'orange'
  },
  {
    section_key: 'sikkerhed',
    title: 'SIKKERHED',
    content: `LIDT SIKKERHED VED TEAMRACE

BED gæsterne vente med at køre til du har tjekket at der ikke stikker nogle skruer ud på sæbekassebilen.

TJEK ALTID:
• Tjek også UNDER sæbekassebilen for udstikkende skruer
• Sørg for at den der sidder i sæbekassebilen HAR EN HJELM PÅ
• Tjek at alle samlinger er sikre før kørsel`,
    order_index: 6,
    icon: AlertTriangle,
    color: 'red'
  },
  {
    section_key: 'afvikling',
    title: 'BYGGETID & KONKURRENCE',
    content: `5. BYGGETID OG KONKURRENCE

BYGGE + BIL-GENNEMGANG:
• Kunderne deles op i grupper af 4-5 mand
• Grupperne har 45 minutter til at bygge deres sæbekassebiler – inklusiv at pynte dem
• Når tiden er gået, skal hver gruppe stå klar med en bil

BIL-GENNEMGANG:
• Hvert hold udpeger en fair dommer fra et andet hold
• Dommeren gennemgår deres bil i forhold til manualen
• Hvert hold starter med 5 point – for hver fejl trækkes 1 point fra
• Instruktøren tjekker bilerne for sikkerhed (fx skruer der stikker ud, svage konstruktioner)

RACE REGLER:
• Hvert hold vælger 1 kører – køreren må IKKE udskiftes undervejs
• Hvert hold vælger de to første skubbere – skubbere MÅ udskiftes ved pit-stop
• Hvert hold får først en træningsrunde på banen

DER KØRES 2 LØB:
1. Kvalifikationsløb – afgør startrækkefølge til finalen
2. Finaleløb

I BEGGE LØB:
• Holdene sendes afsted med 15 sekunders forsinkelse
• HUSK at skrive 0, -15, -30, -45 osv. på scoreboardet
• Der køres 3 omgange på banen
• Vinderen er holdet med hurtigste tid FRATRUKKET deres starttid

HVIS BILER GÅR I STYKKER:
• Holdene må reparere bilerne MELLEM løbene
• I selve løbet udgår de`,
    order_index: 7,
    icon: Flag,
    color: 'blue'
  },
  {
    section_key: 'kaaring',
    title: 'KÅRING & AFSLUTNING',
    content: `6. KÅRING AF VINDER OG AFSLUTNING

EFTER RACE:
• Hvert hold skal nu nulstille bilerne igen og lægge alt tilbage i taskerne

VIGTIGT: Holdene får FØRST den endelige afgørelse NÅR ALLE BILER er pakket ned!

POINTBEREGNING:
• Husk at medregne point fra bil-gennemgang
• Samlet score = Racetid + bil-gennemgangs point

AFSLUTNING:
• Saml alle deltagere
• Annoncér placeringer
• Skab god stemning
• Anerkend ALLE holds indsats`,
    order_index: 8,
    icon: Trophy,
    color: 'yellow'
  },
  {
    section_key: 'oprydning',
    title: 'OPRYDNING & HJEMKOMST',
    content: `7. OPRYDNING og korrekt nedpakning af gear

8. Tjekliste HJEMKOMST (Lager)

EFTER ALLE OPGAVER SKAL DU SOM INSTRUKTØR GØRE FØLGENDE:

Gearet skal virke og være klar til den næste der skal bruge det.

1. Alle brædder og andet udstyr der er gået i stykker skal udskiftes
2. Har du oplevet fejl/mangler skal det skrives i evalueringen
3. Virker noget af gearet ikke, så kommende opgave ikke er mulig, SKAL DER RINGES så snart det er muligt, så vi kan få det fixet.`,
    order_index: 9,
    icon: Home,
    color: 'green'
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

interface TeamRaceGuideProps {
  onNavigate?: (view: string) => void;
}

const TeamRaceGuide: React.FC<TeamRaceGuideProps> = ({ onNavigate }) => {
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
    const result = await getGuideSections('teamrace');

    if (result.success && result.data && result.data.length > 0) {
      // Merge saved data with default metadata
      const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
        const savedSection = result.data?.find(s => s.section_key === defaultSection.section_key);
        return {
          ...defaultSection,
          ...savedSection,
          activity: 'teamrace',
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
        activity: 'teamrace'
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
    const result = await uploadGuideImage(file, 'teamrace', sectionKey);

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

export default TeamRaceGuide;
