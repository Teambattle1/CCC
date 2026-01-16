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
  FileText,
  CheckSquare,
  Square,
  Zap,
  Navigation,
  Gamepad2,
  Package,
  Swords,
  Car,
  Utensils,
  LucideIcon,
  Bell,
  AlertCircle
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

// Activity icons and colors
const ACTIVITY_CONFIG: Record<string, { icon: LucideIcon; color: string; title: string }> = {
  teamlazer: { icon: Zap, color: 'blue', title: 'TeamLazer' },
  teamrobin: { icon: Target, color: 'green', title: 'TeamRobin' },
  teamsegway: { icon: Navigation, color: 'red', title: 'TeamSegway' },
  teamcontrol: { icon: Gamepad2, color: 'purple', title: 'TeamControl' },
  teamconnect: { icon: Users, color: 'purple', title: 'TeamConnect' },
  teambox: { icon: Package, color: 'gray', title: 'TeamBox' },
  teamaction: { icon: Swords, color: 'lightblue', title: 'TeamAction' },
  teamchallenge: { icon: Trophy, color: 'pink', title: 'TeamChallenge' },
  teamconstruct: { icon: Settings, color: 'yellow', title: 'TeamConstruct' },
  teamrace: { icon: Car, color: 'orange', title: 'TeamRace' },
  teamplay: { icon: Users, color: 'blue', title: 'TeamPlay' },
  teamtaste: { icon: Utensils, color: 'gold', title: 'TeamTaste' }
};

// Color classes
const COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-400' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', icon: 'text-pink-400' },
  gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', icon: 'text-gray-400' },
  lightblue: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  gold: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' }
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
  updated_at?: string;
}

// Helper to format relative time in Danish
const formatRelativeTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Lige nu';
  if (diffMins < 60) return `${diffMins} min. siden`;
  if (diffHours < 24) return `${diffHours} time${diffHours > 1 ? 'r' : ''} siden`;
  if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? 'e' : ''} siden`;
  return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: diffDays > 365 ? 'numeric' : undefined });
};

// Helper to get last viewed sections from localStorage
const getViewedSections = (userId: string, activity: string): Record<string, string> => {
  try {
    const key = `guide_viewed_${userId}_${activity}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Helper to mark section as viewed
const markSectionViewed = (userId: string, activity: string, sectionKey: string) => {
  try {
    const key = `guide_viewed_${userId}_${activity}`;
    const viewed = getViewedSections(userId, activity);
    viewed[sectionKey] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(viewed));
  } catch {
    // Ignore localStorage errors
  }
};

// Helper to check if section is new (updated since last view)
const isSectionNew = (section: SectionWithMeta, viewedSections: Record<string, string>): boolean => {
  if (!section.updated_at) return false;
  const lastViewed = viewedSections[section.section_key];
  if (!lastViewed) return true; // Never viewed = new
  return new Date(section.updated_at) > new Date(lastViewed);
};

// Helper to get/set last login time for activity guide
const getLastGuideVisit = (userId: string, activity: string): string | null => {
  try {
    return localStorage.getItem(`guide_lastvisit_${userId}_${activity}`);
  } catch {
    return null;
  }
};

const setLastGuideVisit = (userId: string, activity: string) => {
  try {
    localStorage.setItem(`guide_lastvisit_${userId}_${activity}`, new Date().toISOString());
  } catch {
    // Ignore localStorage errors
  }
};

interface ActivityGuideProps {
  activity: string;
  onNavigate?: (view: string) => void;
}

// Default empty sections for new activities
const getDefaultSections = (activity: string): SectionWithMeta[] => {
  return [
    {
      activity,
      section_key: 'velkommen',
      title: 'VELKOMMEN',
      content: 'Tilføj information om velkomst og introduktion her.',
      order_index: 0,
      icon: Users,
      iconKey: 'users',
      color: 'blue',
      category: 'before',
      isDefault: true
    },
    {
      activity,
      section_key: 'forberedelse',
      title: 'FORBEREDELSE',
      content: 'Tilføj information om forberedelse her.',
      order_index: 1,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity,
      section_key: 'afvikling',
      title: 'AFVIKLING',
      content: 'Tilføj information om afvikling af aktiviteten her.',
      order_index: 2,
      icon: Play,
      iconKey: 'play',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity,
      section_key: 'oprydning',
      title: 'OPRYDNING',
      content: 'Tilføj information om oprydning her.',
      order_index: 3,
      icon: CheckCircle2,
      iconKey: 'check',
      color: 'red',
      category: 'after',
      isDefault: true
    }
  ];
};

const ActivityGuide: React.FC<ActivityGuideProps> = ({ activity, onNavigate }) => {
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
  const [newSectionChecklist, setNewSectionChecklist] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Viewed sections tracking
  const [viewedSections, setViewedSections] = useState<Record<string, string>>({});
  const [showChangesPopup, setShowChangesPopup] = useState(false);
  const [changedSections, setChangedSections] = useState<SectionWithMeta[]>([]);

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER';
  const activityConfig = ACTIVITY_CONFIG[activity] || { icon: Settings, color: 'blue', title: activity };

  useEffect(() => {
    loadSections();
  }, [activity]);

  // Load viewed sections when profile or activity changes
  useEffect(() => {
    if (profile?.id) {
      const viewed = getViewedSections(profile.id, activity);
      setViewedSections(viewed);
    }
  }, [profile?.id, activity]);

  const loadSections = async () => {
    setIsLoading(true);
    const result = await getGuideSections(activity);

    // Start with defaults
    let allSections: SectionWithMeta[] = getDefaultSections(activity);

    if (result.success && result.data) {
      // Merge with database sections
      result.data.forEach((dbSection: GuideSection) => {
        const existingIndex = allSections.findIndex(s => s.section_key === dbSection.section_key);
        if (existingIndex >= 0) {
          // Update existing section
          allSections[existingIndex] = {
            ...allSections[existingIndex],
            ...dbSection,
            icon: allSections[existingIndex].icon,
            iconKey: allSections[existingIndex].iconKey,
            color: allSections[existingIndex].color,
            category: (dbSection.category as CategoryKey) || allSections[existingIndex].category,
            updated_at: dbSection.updated_at
          };
        } else {
          // Add new custom section
          allSections.push({
            ...dbSection,
            icon: getIconByKey(dbSection.section_key.split('_')[0] || 'file'),
            iconKey: dbSection.section_key.split('_')[0] || 'file',
            color: 'blue',
            category: (dbSection.category as CategoryKey) || 'before',
            isDefault: false,
            updated_at: dbSection.updated_at
          });
        }
      });
    }

    // Sort by order_index
    allSections.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    setSections(allSections);
    setIsLoading(false);

    // Check for changes since last visit (for non-admins)
    if (profile?.id && profile.role === 'INSTRUCTOR') {
      const lastVisit = getLastGuideVisit(profile.id, activity);
      if (lastVisit) {
        const changedSince = allSections.filter(s => {
          if (!s.updated_at) return false;
          return new Date(s.updated_at) > new Date(lastVisit);
        });
        if (changedSince.length > 0) {
          setChangedSections(changedSince);
          setShowChangesPopup(true);
        }
      }
      // Update last visit time
      setLastGuideVisit(profile.id, activity);
    }
  };

  const handleToggleSection = (sectionKey: string) => {
    const isExpanding = expandedSection !== sectionKey;
    setExpandedSection(isExpanding ? sectionKey : null);

    // Mark section as viewed when expanded (removes NEW badge)
    if (isExpanding && profile?.id) {
      markSectionViewed(profile.id, activity, sectionKey);
      setViewedSections(prev => ({
        ...prev,
        [sectionKey]: new Date().toISOString()
      }));
    }
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
    const result = await uploadGuideImage(file, activity, sectionKey);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerImageUpload = (sectionKey: string) => {
    setUploadingSectionKey(sectionKey);
    fileInputRef.current?.click();
  };

  const moveSection = async (sectionKey: string, direction: 'up' | 'down') => {
    const currentSection = sections.find(s => s.section_key === sectionKey);
    if (!currentSection) return;

    const sameCategorySections = sections
      .filter(s => s.category === currentSection.category)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const currentIndex = sameCategorySections.findIndex(s => s.section_key === sectionKey);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= sameCategorySections.length) return;

    const swapSection = sameCategorySections[swapIndex];
    const tempOrder = currentSection.order_index;
    currentSection.order_index = swapSection.order_index;
    swapSection.order_index = tempOrder;

    await saveGuideSection(currentSection);
    await saveGuideSection(swapSection);

    setSections(prev => {
      const updated = prev.map(s => {
        if (s.section_key === currentSection.section_key) return { ...s, order_index: currentSection.order_index };
        if (s.section_key === swapSection.section_key) return { ...s, order_index: swapSection.order_index };
        return s;
      });
      return updated.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });
  };

  const handleDeleteSection = async (section: SectionWithMeta) => {
    if (!section.id || section.isDefault) return;
    if (!confirm('Er du sikker på at du vil slette denne sektion?')) return;

    const result = await deleteGuideSection(section.id);
    if (result.success) {
      setSections(prev => prev.filter(s => s.section_key !== section.section_key));
    }
  };

  const handleNewSectionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSectionImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setNewSectionImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) {
      alert('Indtast en titel til sektionen');
      return;
    }

    setIsSaving(true);
    try {
      const sectionKey = `${newSectionIcon}_custom_${Date.now()}`;
      const categorySections = sections.filter(s => s.category === newSectionCategory);
      const maxOrder = Math.max(...categorySections.map(s => s.order_index || 0), -1);

      let imageUrl: string | undefined;
      if (newSectionImage) {
        const uploadResult = await uploadGuideImage(newSectionImage, activity, sectionKey);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          console.error('Image upload failed:', uploadResult.error);
        }
      }

      // Combine content with checklist
      let fullContent = newSectionContent || '';
      if (newSectionChecklist.length > 0) {
        const checklistJson = JSON.stringify(newSectionChecklist);
        fullContent = fullContent + '\n<!--CHECKLIST:' + checklistJson + '-->';
      }

      const newSection: GuideSection = {
        activity,
        section_key: sectionKey,
        title: newSectionTitle.toUpperCase(),
        content: fullContent,
        image_url: imageUrl,
        order_index: maxOrder + 1,
        category: newSectionCategory
      };

      console.log('Creating section:', newSection);
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
          isDefault: false,
          updated_at: new Date().toISOString()
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
        alert('Kunne ikke oprette sektion: ' + (result.error || 'Ukendt fejl'));
      }
    } catch (err) {
      console.error('Error creating section:', err);
      alert('Fejl ved oprettelse af sektion');
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
    const isNew = isSectionNew(section, viewedSections);

    return (
      <div
        key={section.section_key}
        className={`${colorClasses.bg} border ${colorClasses.border} rounded-xl tablet:rounded-2xl overflow-hidden transition-all duration-300 ${isNew ? 'ring-2 ring-battle-orange/50' : ''}`}
      >
        {/* Section Header */}
        <button
          onClick={() => handleToggleSection(section.section_key)}
          className="w-full flex items-center justify-between p-4 tablet:p-5 text-left"
        >
          <div className="flex items-center gap-3 tablet:gap-4">
            <div className={`p-2 tablet:p-3 ${colorClasses.bg} rounded-lg tablet:rounded-xl border ${colorClasses.border} relative`}>
              <Icon className={`w-5 h-5 tablet:w-6 tablet:h-6 ${colorClasses.icon}`} />
              {/* NEW Badge */}
              {isNew && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-battle-orange text-white text-[9px] font-bold rounded-full uppercase">
                  NY
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className={`text-sm tablet:text-base font-bold ${colorClasses.text} uppercase tracking-wider`}>
                {section.title}
              </h3>
              {/* Last edit timestamp */}
              {section.updated_at && (
                <span className="text-[10px] text-gray-500">
                  Sidst redigeret: {formatRelativeTime(section.updated_at)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex gap-1 mr-2">
                <button
                  onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'up'); }}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'down'); }}
                  disabled={index === totalInCategory - 1}
                  className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${colorClasses.icon}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${colorClasses.icon}`} />
            )}
          </div>
        </button>

        {/* Section Content */}
        {isExpanded && (
          <div className="px-4 tablet:px-5 pb-4 tablet:pb-5 border-t border-white/10">
            <div className="pt-4 flex flex-col tablet:flex-row gap-4">
              {/* Image Section */}
              <div className="tablet:w-1/3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => uploadingSectionKey && handleImageUpload(e, uploadingSectionKey)}
                  accept="image/*"
                  className="hidden"
                />
                {section.image_url ? (
                  <div
                    className={`relative rounded-lg tablet:rounded-xl overflow-hidden border-2 border-dashed ${colorClasses.border} cursor-pointer group`}
                    onClick={() => isAdmin && triggerImageUpload(section.section_key)}
                  >
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-48 tablet:h-64 object-cover"
                    />
                    {isAdmin && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`h-48 tablet:h-64 rounded-lg tablet:rounded-xl border-2 border-dashed ${colorClasses.border} flex flex-col items-center justify-center gap-2 ${
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
                                  <input type="checkbox" className="sr-only peer" />
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

                      {/* Admin edit button */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleStartEdit(section)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs uppercase tracking-wider hover:bg-blue-500/30 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            REDIGER
                          </button>
                          {!section.isDefault && section.id && (
                            <button
                              onClick={() => handleDeleteSection(section)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              SLET
                            </button>
                          )}
                        </>
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

  const renderCategory = (categoryKey: CategoryKey) => {
    const category = CATEGORIES[categoryKey];
    const categorySections = sectionsByCategory[categoryKey];
    const CategoryIcon = category.icon;
    const colorClasses = COLORS[category.color];

    return (
      <div key={categoryKey} className="space-y-3">
        {/* Category Header */}
        <div className={`flex items-center justify-between gap-3 px-2 py-3 ${colorClasses.bg} rounded-xl border ${colorClasses.border}`}>
          <div className="flex items-center gap-3">
            <CategoryIcon className={`w-6 h-6 ${colorClasses.icon}`} />
            <h2 className={`text-lg font-bold ${colorClasses.text} uppercase tracking-wider`}>
              {category.title}
            </h2>
            <span className={`text-xs ${colorClasses.text} opacity-60`}>
              ({categorySections.length})
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setNewSectionCategory(categoryKey);
                setShowNewSectionModal(true);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
            >
              <Plus className="w-4 h-4" />
              NY
            </button>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {categorySections.map((section, index) => renderSection(section, category.color, index, categorySections.length))}
        </div>
      </div>
    );
  };

  const ActivityIcon = activityConfig.icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-2 tablet:px-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ActivityIcon className={`w-8 h-8 ${COLORS[activityConfig.color]?.icon || 'text-battle-orange'}`} />
          <h1 className="text-2xl tablet:text-3xl font-bold text-white uppercase tracking-wider">
            {activityConfig.title} Guide
          </h1>
        </div>
        <p className="text-gray-400 text-sm">Crew instruktioner og vejledning</p>
      </div>

      {/* Categories */}
      {renderCategory('before')}
      {renderCategory('during')}
      {renderCategory('after')}

      {/* Changes Popup Modal */}
      {showChangesPopup && changedSections.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-battle-grey border border-battle-orange/30 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-battle-orange/20 rounded-full">
                <Bell className="w-6 h-6 text-battle-orange" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Ændringer siden sidst
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Følgende afsnit er blevet opdateret siden dit sidste besøg:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {changedSections.map(section => {
                const categoryInfo = CATEGORIES[section.category];
                const colorClasses = COLORS[categoryInfo?.color || 'blue'];
                return (
                  <div
                    key={section.section_key}
                    className={`flex items-center gap-3 p-3 ${colorClasses.bg} border ${colorClasses.border} rounded-lg`}
                  >
                    <span className="px-1.5 py-0.5 bg-battle-orange text-white text-[9px] font-bold rounded uppercase">
                      NY
                    </span>
                    <div className="flex-1">
                      <div className={`font-semibold ${colorClasses.text} text-sm`}>{section.title}</div>
                      <div className="text-xs text-gray-500">
                        {categoryInfo?.title} · {formatRelativeTime(section.updated_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowChangesPopup(false)}
              className="w-full py-3 bg-battle-orange hover:bg-battle-orangeLight text-white font-bold rounded-xl uppercase tracking-wider transition-colors"
            >
              Forstået
            </button>
          </div>
        </div>
      )}

      {/* New Section Modal */}
      {showNewSectionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-battle-grey border border-white/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                Ny Sektion - {CATEGORIES[newSectionCategory].title}
              </h3>
              <button
                onClick={() => setShowNewSectionModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
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
                  {ICON_OPTIONS.map((opt) => {
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

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateSection}
                  disabled={!newSectionTitle.trim() || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'OPRETTER...' : 'OPRET SEKTION'}
                </button>
                <button
                  onClick={() => setShowNewSectionModal(false)}
                  className="px-6 py-3 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 uppercase tracking-wider hover:bg-gray-500/30 transition-colors"
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

export default ActivityGuide;
