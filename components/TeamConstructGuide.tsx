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
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Bold,
  Italic,
  Underline,
  AlignCenter,
  AlignLeft,
  List,
  Palette,
  Type,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  deleteGuideSection,
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

// Icon map for custom sections
const ICON_OPTIONS = [
  { key: 'target', icon: Target, label: 'Mål' },
  { key: 'users', icon: Users, label: 'Brugere' },
  { key: 'music', icon: Music, label: 'Musik' },
  { key: 'clock', icon: Clock, label: 'Tid' },
  { key: 'clipboard', icon: ClipboardList, label: 'Liste' },
  { key: 'mappin', icon: MapPin, label: 'Lokation' },
  { key: 'settings', icon: Settings, label: 'Indstillinger' },
  { key: 'trophy', icon: Trophy, label: 'Trofæ' },
  { key: 'home', icon: Home, label: 'Hjem' },
  { key: 'file', icon: FileText, label: 'Dokument' }
];

const getIconByKey = (key: string): React.ElementType => {
  return ICON_OPTIONS.find(i => i.key === key)?.icon || FileText;
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
    iconKey: 'target',
    color: 'red',
    category: 'before' as CategoryKey,
    isDefault: true
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
    iconKey: 'music',
    color: 'green',
    category: 'during' as CategoryKey,
    isDefault: true
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
    iconKey: 'clock',
    color: 'blue',
    category: 'before' as CategoryKey,
    isDefault: true
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
    iconKey: 'clipboard',
    color: 'yellow',
    link: '#teamconstruct_packing_afgang',
    linkText: 'PAKKELISTE AFGANG',
    isInternal: true,
    category: 'before' as CategoryKey,
    isDefault: true
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
    iconKey: 'mappin',
    color: 'purple',
    link: 'https://l.ead.me/TeamConstruct-Video',
    linkText: 'SE OPSÆTNING VIDEO',
    category: 'before' as CategoryKey,
    isDefault: true
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
    iconKey: 'users',
    color: 'orange',
    category: 'during' as CategoryKey,
    isDefault: true
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
    iconKey: 'settings',
    color: 'red',
    link: 'https://l.ead.me/TeamConstruct-Video',
    linkText: 'SE AFVIKLING VIDEO',
    category: 'during' as CategoryKey,
    isDefault: true
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
    iconKey: 'trophy',
    color: 'yellow',
    category: 'during' as CategoryKey,
    isDefault: true
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
    iconKey: 'home',
    color: 'green',
    link: '#teamconstruct_packing_hjemkomst',
    linkText: 'TJEKLISTE HJEMKOMST',
    isInternal: true,
    category: 'after' as CategoryKey,
    isDefault: true
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
  iconKey?: string;
  color: string;
  link?: string;
  linkText?: string;
  isInternal?: boolean;
  category: CategoryKey;
  isDefault?: boolean;
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
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newSectionImageRef = useRef<HTMLInputElement>(null);
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null);

  // New section modal state
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newSectionCategory, setNewSectionCategory] = useState<CategoryKey>('before');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionIcon, setNewSectionIcon] = useState('file');
  const [newSectionImage, setNewSectionImage] = useState<File | null>(null);
  const [newSectionImagePreview, setNewSectionImagePreview] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newSectionChecklist, setNewSectionChecklist] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';

  // Rich text editor formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const EDITOR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#9ca3af'];

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    const result = await getGuideSections('teamconstruct');

    // Start with defaults
    let allSections: SectionWithMeta[] = DEFAULT_SECTIONS.map(s => ({
      ...s,
      activity: 'teamconstruct'
    } as SectionWithMeta));

    if (result.success && result.data && result.data.length > 0) {
      // Merge saved data with defaults and add custom sections
      allSections = DEFAULT_SECTIONS.map(defaultSection => {
        const savedSection = result.data?.find(s => s.section_key === defaultSection.section_key);
        return {
          ...defaultSection,
          ...savedSection,
          activity: 'teamconstruct',
          icon: defaultSection.icon,
          iconKey: defaultSection.iconKey,
          color: defaultSection.color,
          link: defaultSection.link,
          linkText: defaultSection.linkText,
          category: (savedSection?.category as CategoryKey) || defaultSection.category,
          isDefault: true
        } as SectionWithMeta;
      });

      // Add custom sections (not in defaults)
      const customSections = result.data.filter(
        s => !DEFAULT_SECTIONS.find(d => d.section_key === s.section_key)
      );
      customSections.forEach(cs => {
        allSections.push({
          ...cs,
          icon: getIconByKey(cs.section_key.split('_')[0] || 'file'),
          iconKey: cs.section_key.split('_')[0] || 'file',
          color: 'blue',
          category: (cs.category as CategoryKey) || 'before',
          isDefault: false
        } as SectionWithMeta);
      });
    }

    // Sort by order_index within each category
    allSections.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    setSections(allSections);
    setIsLoading(false);
  };

  const handleToggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const handleStartEdit = (section: SectionWithMeta) => {
    setEditingSection(section.section_key);
    setEditContent(section.content);
    setEditTitle(section.title);
  };

  const handleSaveEdit = async (section: SectionWithMeta) => {
    setIsSaving(true);
    const updatedSection = {
      ...section,
      title: editTitle,
      content: editContent
    };

    const result = await saveGuideSection(updatedSection);
    if (result.success) {
      setSections(prev => prev.map(s =>
        s.section_key === section.section_key
          ? { ...s, title: editTitle, content: editContent, id: result.id || s.id }
          : s
      ));
      setEditingSection(null);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
    setEditTitle('');
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

  // Move section up/down within category
  const moveSection = async (sectionKey: string, direction: 'up' | 'down') => {
    const section = sections.find(s => s.section_key === sectionKey);
    if (!section) return;

    const categorySections = sections.filter(s => s.category === section.category);
    const currentIndex = categorySections.findIndex(s => s.section_key === sectionKey);

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categorySections.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapSection = categorySections[swapIndex];

    // Swap order indices
    const tempOrder = section.order_index;
    section.order_index = swapSection.order_index;
    swapSection.order_index = tempOrder;

    // Save both sections
    await Promise.all([
      saveGuideSection({ ...section, category: section.category }),
      saveGuideSection({ ...swapSection, category: swapSection.category })
    ]);

    // Update local state
    setSections(prev => {
      const updated = prev.map(s => {
        if (s.section_key === section.section_key) return { ...s, order_index: section.order_index };
        if (s.section_key === swapSection.section_key) return { ...s, order_index: swapSection.order_index };
        return s;
      });
      return updated.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
  };

  // Delete custom section
  const handleDeleteSection = async (section: SectionWithMeta) => {
    if (section.isDefault) return;
    if (!confirm(`Er du sikker på at du vil slette "${section.title}"?`)) return;

    if (section.id) {
      const result = await deleteGuideSection(section.id);
      if (result.success) {
        setSections(prev => prev.filter(s => s.section_key !== section.section_key));
      }
    }
  };

  // Add new section
  const openNewSectionModal = (category: CategoryKey) => {
    setNewSectionCategory(category);
    setNewSectionTitle('');
    setNewSectionContent('');
    setNewSectionIcon('file');
    setNewSectionImage(null);
    setNewSectionImagePreview(null);
    setShowNewSectionModal(true);
  };

  const handleNewSectionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSectionImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSectionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;

    setIsSaving(true);
    const sectionKey = `${newSectionIcon}_custom_${Date.now()}`;
    const categorySections = sections.filter(s => s.category === newSectionCategory);
    const maxOrder = Math.max(...categorySections.map(s => s.order_index || 0), -1);

    let imageUrl: string | undefined;
    if (newSectionImage) {
      const uploadResult = await uploadGuideImage(newSectionImage, 'teamconstruct', sectionKey);
      if (uploadResult.success) {
        imageUrl = uploadResult.url;
      }
    }

    // Combine content with checklist
    let fullContent = newSectionContent;
    if (newSectionChecklist.length > 0) {
      const checklistJson = JSON.stringify(newSectionChecklist);
      fullContent = fullContent + '\n<!--CHECKLIST:' + checklistJson + '-->';
    }

    const newSection: GuideSection = {
      activity: 'teamconstruct',
      section_key: sectionKey,
      title: newSectionTitle.toUpperCase(),
      content: fullContent,
      image_url: imageUrl,
      order_index: maxOrder + 1,
      category: newSectionCategory
    };

    try {
      const result = await saveGuideSection(newSection);
      console.log('Save result:', result);
      if (result.success) {
        const newSectionWithMeta: SectionWithMeta = {
          ...newSection,
          id: result.id,
          icon: getIconByKey(newSectionIcon),
          iconKey: newSectionIcon,
          color: 'blue',
          category: newSectionCategory,
          isDefault: false
        };
        setSections(prev => [...prev, newSectionWithMeta].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        // Reset modal state
        setShowNewSectionModal(false);
        setNewSectionTitle('');
        setNewSectionContent('');
        setNewSectionIcon('file');
        setNewSectionImage(null);
        setNewSectionImagePreview(null);
        setNewSectionChecklist([]);
        setNewChecklistItem('');
      } else {
        console.error('Failed to save section:', result.error);
        alert('Kunne ikke gemme sektion: ' + (result.error || 'Ukendt fejl'));
      }
    } catch (err) {
      console.error('Error saving section:', err);
      alert('Fejl ved gemning af sektion');
    }
    setIsSaving(false);
  };

  // Checklist helper functions
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setNewSectionChecklist(prev => [...prev, newChecklistItem.trim()]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setNewSectionChecklist(prev => prev.filter((_, i) => i !== index));
  };

  // Parse checklist from content
  const parseChecklist = (content: string): { text: string; checklist: string[] } => {
    const match = content.match(/<!--CHECKLIST:(.+?)-->/);
    if (match) {
      try {
        const checklist = JSON.parse(match[1]);
        const text = content.replace(/\n?<!--CHECKLIST:.+?-->/, '');
        return { text, checklist };
      } catch {
        return { text: content, checklist: [] };
      }
    }
    return { text: content, checklist: [] };
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

  const renderSection = (section: SectionWithMeta, categoryColor: string, index: number, totalInCategory: number) => {
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
        <div className="flex items-center">
          {/* Reorder buttons for admin */}
          {isAdmin && (
            <div className="flex flex-col border-r border-white/10">
              <button
                onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'up'); }}
                disabled={index === 0}
                className="p-1.5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                title="Flyt op"
              >
                <ChevronUp className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'down'); }}
                disabled={index === totalInCategory - 1}
                className="p-1.5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                title="Flyt ned"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
          <div
            onClick={() => handleToggleSection(section.section_key)}
            className="flex-1 p-3 tablet:p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
                <Icon className={`w-5 h-5 tablet:w-6 tablet:h-6 ${colorClasses.icon}`} />
              </div>
              <h3 className={`text-sm tablet:text-base font-bold uppercase tracking-wider ${colorClasses.text}`}>
                {section.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && !section.isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSection(section); }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Slet sektion"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
              {isExpanded ? (
                <ChevronUp className={`w-5 h-5 ${colorClasses.text}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${colorClasses.text}`} />
              )}
            </div>
          </div>
        </div>

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
                    {/* Title Input */}
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Overskrift
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-battle-black/50 border border-white/20 rounded-lg px-4 py-2 text-white font-bold uppercase tracking-wider focus:outline-none focus:border-battle-orange"
                      />
                    </div>
                    {/* Content Textarea */}
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Indhold
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-64 bg-battle-black/50 border border-white/20 rounded-lg p-4 text-white text-sm leading-relaxed resize-none focus:outline-none focus:border-battle-orange"
                      />
                    </div>
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
                    {(() => {
                      const { text, checklist } = parseChecklist(section.content);
                      return (
                        <>
                          <div className="text-sm tablet:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                            {text}
                          </div>
                          {checklist.length > 0 && (
                            <div className="mt-4 bg-battle-black/30 border border-white/10 rounded-lg p-3 space-y-2">
                              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tjekliste</div>
                              {checklist.map((item, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                  />
                                  <div className="w-5 h-5 rounded border border-white/30 flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors">
                                    <CheckSquare className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                                  </div>
                                  <span className="text-sm text-gray-300 peer-checked:line-through peer-checked:text-gray-500 transition-all">
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}

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

  const renderCategory = (categoryKey: CategoryKey, colorName: string, IconComponent: React.ElementType) => {
    const categorySections = sectionsByCategory[categoryKey];
    const colorClasses = COLORS[colorName];
    const categoryInfo = CATEGORIES[categoryKey];

    return (
      <div className={`rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-3 tablet:p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses.bg} border ${colorClasses.border}`}>
              <IconComponent className={`w-5 h-5 tablet:w-6 tablet:h-6 ${colorClasses.icon}`} />
            </div>
            <h2 className={`text-base tablet:text-lg font-bold uppercase tracking-wider ${colorClasses.text}`}>
              {categoryInfo.title}
            </h2>
            <span className={`text-xs ${colorClasses.text}/50`}>({categorySections.length} sektioner)</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => openNewSectionModal(categoryKey)}
              className={`flex items-center gap-2 px-3 py-1.5 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
            >
              <Plus className="w-4 h-4" />
              TILFØJ
            </button>
          )}
        </div>
        <div className={`grid grid-cols-1 ${categoryKey === 'after' ? '' : 'tablet:grid-cols-2 desktop:grid-cols-3'} gap-3`}>
          {categorySections.map((s, idx) => renderSection(s, colorName, idx, categorySections.length))}
        </div>
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
        {renderCategory('before', 'green', PackageCheck)}
        {renderCategory('during', 'yellow', Play)}
        {renderCategory('after', 'red', CheckCircle2)}
      </div>

      {/* New Section Modal */}
      {showNewSectionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-battle-grey rounded-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Ny Sektion - {CATEGORIES[newSectionCategory].title}
              </h3>
              <button
                onClick={() => setShowNewSectionModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Sektion titel..."
                  className="w-full bg-battle-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-battle-orange"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Ikon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const IconOpt = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setNewSectionIcon(opt.key)}
                        className={`p-3 rounded-lg border transition-colors ${
                          newSectionIcon === opt.key
                            ? 'border-battle-orange bg-battle-orange/20'
                            : 'border-white/10 hover:bg-white/5'
                        }`}
                        title={opt.label}
                      >
                        <IconOpt className={`w-5 h-5 mx-auto ${newSectionIcon === opt.key ? 'text-battle-orange' : 'text-gray-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Indhold
                </label>
                <textarea
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder="Skriv indholdet her..."
                  rows={4}
                  className="w-full bg-battle-black/50 border border-white/20 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-battle-orange"
                />
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Tjekliste (valgfrit)
                </label>
                <div className="space-y-2">
                  {/* Add item input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                      placeholder="Tilføj punkt..."
                      className="flex-1 bg-battle-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-battle-orange"
                    />
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Checklist items */}
                  {newSectionChecklist.length > 0 && (
                    <div className="bg-battle-black/30 border border-white/10 rounded-lg p-2 space-y-1">
                      {newSectionChecklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="flex-1 text-sm text-gray-300">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="p-1 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Billede (valgfrit)
                </label>
                <input
                  type="file"
                  ref={newSectionImageRef}
                  accept="image/*"
                  onChange={handleNewSectionImageSelect}
                  className="hidden"
                />
                {newSectionImagePreview ? (
                  <div className="relative">
                    <img
                      src={newSectionImagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setNewSectionImage(null);
                        setNewSectionImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => newSectionImageRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-500" />
                    <span className="text-xs text-gray-500">Klik for at uploade</span>
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateSection}
                  disabled={!newSectionTitle.trim() || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-medium uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'OPRETTER...' : 'OPRET SEKTION'}
                </button>
                <button
                  onClick={() => setShowNewSectionModal(false)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-400 font-medium uppercase tracking-wider hover:bg-white/20 transition-colors"
                >
                  ANNULLER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamConstructGuide;
