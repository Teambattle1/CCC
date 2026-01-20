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
  Phone,
  Swords,
  Car,
  Utensils,
  LucideIcon,
  Bell,
  AlertCircle,
  RefreshCw,
  Youtube,
  ImagePlus,
  Image,
  Bold,
  Italic,
  Underline,
  Palette,
  List,
  ListOrdered
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getGuideSections,
  saveGuideSection,
  deleteGuideSection,
  uploadGuideImage,
  GuideSection,
  supabase
} from '../lib/supabase';

// Category definitions
type CategoryKey = 'before' | 'during' | 'after' | 'summary';

const CATEGORIES: Record<CategoryKey, { title: string; icon: React.ElementType; color: string; shortTitle: string }> = {
  before: { title: 'FØR OPGAVEN', shortTitle: 'FØR', icon: PackageCheck, color: 'green' },
  during: { title: 'UNDER OPGAVEN', shortTitle: 'UNDER', icon: Play, color: 'yellow' },
  after: { title: 'EFTER OPGAVEN', shortTitle: 'EFTER', icon: CheckCircle2, color: 'red' },
  summary: { title: 'DE 10 BUD', shortTitle: '10 BUD', icon: ClipboardList, color: 'blue' }
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
  { key: 'file', icon: FileText, label: 'Dokument' },
  { key: 'phone', icon: Phone, label: 'Telefon' },
  { key: 'package', icon: Package, label: 'Pakke' },
  { key: 'play', icon: Play, label: 'Afspil' },
  { key: 'check', icon: CheckCircle2, label: 'Check' }
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

// Helper to extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Handle youtu.be/VIDEO_ID format
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v=VIDEO_ID format
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/embed/VIDEO_ID format
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Handle youtube.com/v/VIDEO_ID format
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  return null;
};

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

// Helper to track deleted default sections
const getDeletedSections = (activity: string): string[] => {
  try {
    const key = `guide_deleted_${activity}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markSectionDeleted = (activity: string, sectionKey: string) => {
  try {
    const key = `guide_deleted_${activity}`;
    const deleted = getDeletedSections(activity);
    if (!deleted.includes(sectionKey)) {
      deleted.push(sectionKey);
      localStorage.setItem(key, JSON.stringify(deleted));
    }
  } catch {
    // Ignore localStorage errors
  }
};

const unmarkSectionDeleted = (activity: string, sectionKey: string) => {
  try {
    const key = `guide_deleted_${activity}`;
    const deleted = getDeletedSections(activity);
    const filtered = deleted.filter(k => k !== sectionKey);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage errors
  }
};

// Text formatting helpers
const FORMAT_COLORS = [
  { name: 'Rød', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gul', value: '#eab308' },
  { name: 'Grøn', value: '#22c55e' },
  { name: 'Blå', value: '#3b82f6' },
  { name: 'Lilla', value: '#a855f7' },
];

// Parse a single text segment for inline formatting (non-recursive for safety)
const parseInlineFormatting = (text: string, keyPrefix: string = ''): React.ReactNode => {
  if (!text) return null;

  // Build result by processing patterns in order of priority
  let result: React.ReactNode[] = [text];
  let keyCounter = 0;

  // Helper to process a pattern on all string segments in result
  const processPattern = (
    regex: RegExp,
    wrapper: (content: string, key: string) => React.ReactNode
  ) => {
    const newResult: React.ReactNode[] = [];
    for (const segment of result) {
      if (typeof segment !== 'string') {
        newResult.push(segment);
        continue;
      }

      regex.lastIndex = 0;
      if (!regex.test(segment)) {
        newResult.push(segment);
        continue;
      }

      regex.lastIndex = 0;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(segment)) !== null) {
        if (match.index > lastIndex) {
          newResult.push(segment.slice(lastIndex, match.index));
        }
        newResult.push(wrapper(match[1], `${keyPrefix}${keyCounter++}`));
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < segment.length) {
        newResult.push(segment.slice(lastIndex));
      }
    }
    result = newResult;
  };

  // Process color: [#hexcode]text[/color] (needs special handling for 2 capture groups)
  {
    const colorRegex = /\[(#[a-fA-F0-9]{6})\]([^\[]*)\[\/color\]/g;
    const newResult: React.ReactNode[] = [];
    for (const segment of result) {
      if (typeof segment !== 'string') {
        newResult.push(segment);
        continue;
      }

      colorRegex.lastIndex = 0;
      if (!colorRegex.test(segment)) {
        newResult.push(segment);
        continue;
      }

      colorRegex.lastIndex = 0;
      let lastIndex = 0;
      let match;

      while ((match = colorRegex.exec(segment)) !== null) {
        if (match.index > lastIndex) {
          newResult.push(segment.slice(lastIndex, match.index));
        }
        newResult.push(
          <span key={`${keyPrefix}c${keyCounter++}`} style={{ color: match[1] }}>{match[2]}</span>
        );
        lastIndex = colorRegex.lastIndex;
      }
      if (lastIndex < segment.length) {
        newResult.push(segment.slice(lastIndex));
      }
    }
    result = newResult;
  }

  // Process bold: **text**
  processPattern(
    /\*\*([^*]+)\*\*/g,
    (content, key) => <strong key={key} className="font-bold">{content}</strong>
  );

  // Process underline: __text__
  processPattern(
    /__([^_]+)__/g,
    (content, key) => <u key={key} className="underline">{content}</u>
  );

  // Process italic: *text*
  processPattern(
    /\*([^*]+)\*/g,
    (content, key) => <em key={key} className="italic">{content}</em>
  );

  return <>{result}</>;
};

// Parse formatted text to JSX
const parseFormattedText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by lines first
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {parseInlineFormatting(line, `l${lineIndex}`)}
      {lineIndex < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

// Formatting Toolbar Component
interface FormattingToolbarProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ value, onChange, textareaRef }) => {
  const [showColors, setShowColors] = useState(false);

  const insertFormat = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertColor = (color: string) => {
    insertFormat(`[${color}]`, '[/color]');
    setShowColors(false);
  };

  const insertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newText = value.substring(0, lineStart) + '• ' + value.substring(lineStart);
    onChange(newText);
  };

  const insertNumber = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textBefore = value.substring(0, start);
    const lines = textBefore.split('\n');
    const currentLineNum = lines.length;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newText = value.substring(0, lineStart) + `${currentLineNum}. ` + value.substring(lineStart);
    onChange(newText);
  };

  const btnClass = "p-2 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white";

  return (
    <div className="flex items-center gap-1 mb-2 p-2 bg-battle-black/30 rounded-lg border border-white/10">
      <button type="button" onClick={() => insertFormat('**', '**')} className={btnClass} title="Fed">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => insertFormat('*', '*')} className={btnClass} title="Kursiv">
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => insertFormat('__', '__')} className={btnClass} title="Understreget">
        <Underline className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-white/20 mx-1" />
      <div className="relative">
        <button type="button" onClick={() => setShowColors(!showColors)} className={btnClass} title="Farve">
          <Palette className="w-4 h-4" />
        </button>
        {showColors && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-battle-dark border border-white/20 rounded-lg shadow-xl z-50 flex gap-1">
            {FORMAT_COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => insertColor(color.value)}
                className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
      <div className="w-px h-5 bg-white/20 mx-1" />
      <button type="button" onClick={insertBullet} className={btnClass} title="Punktliste">
        <List className="w-4 h-4" />
      </button>
      <button type="button" onClick={insertNumber} className={btnClass} title="Nummereret liste">
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

// Video URL Input Component (for direct video adding without edit mode)
interface VideoUrlInputProps {
  section: { section_key: string };
  onSave: (url: string) => Promise<void>;
}

const VideoUrlInput: React.FC<VideoUrlInputProps> = ({ section, onSave }) => {
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const videoId = getYouTubeVideoId(url);
  const isValid = url && videoId;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await onSave(url);
      setUrl('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Indsæt YouTube link..."
        className="w-full bg-battle-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
        onClick={(e) => e.stopPropagation()}
      />
      {url && (
        <div className="flex items-center justify-between">
          {isValid ? (
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Gyldig video
            </span>
          ) : (
            <span className="text-[10px] text-red-400">Ugyldig YouTube URL</span>
          )}
          {isValid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs uppercase tracking-wider hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Gemmer...' : 'Gem'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Packing item data with optional image
interface PackingItemData {
  text: string;
  imageUrl?: string;
}

// Linked Packing List Checklist Component
interface LinkedPackingListChecklistProps {
  linkedKey: string;
  sectionKey: string;
  fetchItems: (linkedKey: string) => Promise<PackingItemData[]>;
  cachedItems?: PackingItemData[];
  colorClasses: { bg: string; border: string; text: string; icon: string };
}

const LinkedPackingListChecklist: React.FC<LinkedPackingListChecklistProps> = ({
  linkedKey,
  sectionKey,
  fetchItems,
  cachedItems,
  colorClasses
}) => {
  const [items, setItems] = useState<PackingItemData[]>(cachedItems || []);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(!cachedItems);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load checked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`checklist_${sectionKey}`);
      if (stored) {
        setCheckedItems(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, [sectionKey]);

  // Fetch items if not cached
  useEffect(() => {
    if (!cachedItems) {
      setIsLoading(true);
      fetchItems(linkedKey).then(fetchedItems => {
        setItems(fetchedItems);
        setIsLoading(false);
      });
    } else {
      setItems(cachedItems);
    }
  }, [linkedKey, cachedItems, fetchItems]);

  const handleToggle = (itemName: string) => {
    const newChecked = { ...checkedItems, [itemName]: !checkedItems[itemName] };
    setCheckedItems(newChecked);
    // Save to localStorage
    try {
      localStorage.setItem(`checklist_${sectionKey}`, JSON.stringify(newChecked));
    } catch {
      // Ignore errors
    }
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;

  if (isLoading) {
    return (
      <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="text-sm text-purple-400">Henter pakkeliste...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const listType = linkedKey.split(':')[1] || '';
  const listTitle = listType === 'afgang' ? 'Pakkeliste: Afgang' :
                    listType === 'hjemkomst' ? 'Pakkeliste: Hjemkomst' :
                    listType === 'before' ? 'Pakkeliste: Før' :
                    listType === 'after' ? 'Pakkeliste: Efter' :
                    listType === 'nulstil' ? 'Pakkeliste: Nulstil' :
                    listType === 'taske' ? 'Pakkeliste: Taske' :
                    `Pakkeliste: ${listType}`;

  return (
    <>
      <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-purple-300 uppercase tracking-wider">{listTitle}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            checkedCount === totalCount ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
          }`}>
            {checkedCount}/{totalCount}
          </span>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={checkedItems[item.text] || false}
                  onChange={() => handleToggle(item.text)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded border-2 border-purple-400/50 flex items-center justify-center peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-colors flex-shrink-0">
                  {checkedItems[item.text] && <CheckSquare className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm transition-all ${
                  checkedItems[item.text] ? 'text-gray-500 line-through' : 'text-gray-300'
                }`}>
                  {item.text}
                </span>
              </label>
              {/* Image indicator with hover preview */}
              {item.imageUrl && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(item.imageUrl || null);
                    }}
                    onMouseEnter={() => setHoveredImage(item.imageUrl || null)}
                    onMouseLeave={() => setHoveredImage(null)}
                    className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                    title="Vis billede"
                  >
                    <Image className="w-4 h-4 text-purple-400" />
                  </button>
                  {/* Hover preview tooltip */}
                  {hoveredImage === item.imageUrl && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 pointer-events-none">
                      <div className="bg-battle-grey border border-purple-500/30 rounded-lg p-1 shadow-xl">
                        <img
                          src={item.imageUrl}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Pakkeliste billede"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

interface ActivityGuideProps {
  activity: string;
  onNavigate?: (view: string) => void;
}

// TeamLazer-specific default sections based on the CrewGuide
const getTeamLazerSections = (): SectionWithMeta[] => {
  return [
    // ========== FØR OPGAVEN ==========
    {
      activity: 'teamlazer',
      section_key: 'forventninger_before',
      title: 'FORVENTNINGER TIL DIG',
      content: `Dit mål: At blive en selvsikker og kompetent TeamLazer-instruktør, der kan levere en professionel og sjov oplevelse for alle deltagere.

• Vær forberedt og kend din opgave
• Tjek alt gear inden afgang
• Ankom minimum 45 min før eventstart (LEAD)
• Have læst denne guide grundigt
• Være klædt til vejret (udendørs aktivitet)
• Have din telefon opladet til musik`,
      order_index: 0,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'introduktion',
      title: 'INTRODUKTION TIL LAZER LERDUESKYDNING',
      content: `Lazer Lerdueskydning er en moderne og sikker variant af den traditionelle lerdueskydning. Der skydes med rigtige rifler, men i stedet for krudt anvender vi ufarlige laserstråler, der rammer genanvendelige lerduer udstyret med reflektorer.

FORDELE:
• Ingen rekyl (tilbageslag på skulder)
• Ingen høje brag eller farlige elementer
• Alle kan deltage uanset erfaring og evner

SÅDAN FOREGÅR DET:
• 3-5 deltagere pr. team (helst max 4 personer)
• Alle skyder samtidig efter samme due
• Livescore vises på stort display foran skydezonen
• Typisk 4 forskellige runder per arrangement

HVORFOR TEAMLAZER?
• Inklusivt: Alle kan deltage uanset fysik eller erfaring
• Fleksibelt: Kan afholdes næsten hvor som helst med plads
• Engagerende: Konkurrenceelementet holder spændingen høj
• Fungerer også i mørke med tacticallys!`,
      order_index: 1,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'pakning_gear',
      title: 'PAKNING & GEAR',
      content: `FØLGENDE SKAL MED I BILEN:

☐ 1 stk. kaster (launcher) til duer
☐ Pløkker til kaster
☐ Knæpude
☐ Fjeder til duekaster (tjek i duekassen!)
☐ Tårn til duer inkl. alle 3 vingemøtrikker
☐ Display - start og test med gul TEST knap
☐ 1 højt bord til pointboard og controller
☐ 5 geværer + 24 GENOPLADELIGE batterier
   NB: Batterier må IKKE sidde i geværerne under kørsel!
☐ 5 skydemåtter (nummermåtter 1-5)
☐ Den STORE boks med GEAR
☐ Den lille boks med DUER
☐ 1 JBL musikafspiller - par med telefon/tablet

OVERVEJ OGSÅ:
☐ Telt ved dårligt vejr (+ jernklodser)
☐ Afspærringspinde/bånd
☐ Koblingssæt til 2 setup
☐ Beachflag
☐ Natduer og lygter (hvis natskydning)

VIGTIGT: Tjek at ALLE geværer virker FØR afgang!
Tænd dem og se rødt LED lys.`,
      order_index: 2,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'gear_bokse',
      title: 'INDHOLD I BOKSE',
      content: `DEN STORE BOX - INDHOLD:
• 2 højtalere til display
• 3 blå kabelruller inkl.:
  - 1 controller (trådløse versioner findes)
  - 1 kabel til kaster (trådløse versioner findes)
  - 1 kabel til 12V (bilstik)
• 1 ekstra lader til anlæg
• Scoreboard inkl. POINTSKEMAER i blåt clipboard
• Kuglepenne

DEN LILLE BOX MED DUER:
• 80-100 duer (3-farvet plastikduer)
  Et fyldt rør har 60 duer - der skal være til fyldt rør + ekstra
• Fjeder til duekaster (HVIS ikke allerede på kasteren!)

MEGET VIGTIGT: Tjek altid at fjederen er med!

Mangler der duer eller andet, så giv besked under "Fejl & Mangler" i TeamBattle appen.`,
      order_index: 3,
      icon: Package,
      iconKey: 'package',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'ankomst_opsaetning',
      title: 'ANKOMST & OPSÆTNING',
      content: `ANKOMST & OPSÆTNING:

1. TIDLIG ANKOMST
   Min. 45 minutter før eventstart for LEAD

2. NOTIFICER RECEPTIONEN
   Giv besked så snart du er ankommet

3. RING 114
   Der skal næsten altid ringes til politiet - se særskilt afsnit

4. TERRÆN-INSPEKTION
   • Identificer potentielle farer (ujævnt terræn, forhindringer)
   • Gennemtænk placering af deltagere og udstyr
   • Tjek for offentlig adgang

5. OPSÆTNING AF BANEN
   Se særskilt afsnit om banesetup

6. HÅNDTERING AF GEVÆRER
   Se særskilt afsnit

7. SÆT MUSIK PÅ
   Musikken skal spille når gæsterne ankommer!

MODTAGELSE: Når banen er sat op, geværerne håndteret og musikken spiller - byd deltagerne velkommen med et smil!`,
      order_index: 4,
      icon: MapPin,
      iconKey: 'mappin',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'ring_114',
      title: 'RING 114 - VIGTIGT!',
      content: `Der skal ved ankomst ringes til Politiet på 114, hvis vi står på offentlig grund eller nær noget som kan OPFATTES som offentligt, selvom det er privat.

GENERELT: Det er bedst bare altid at ringe!

HVAD SKAL DU OPLYSE?
• Dit CPR-nummer (de kan se hvis du har ringet før)
• Adressen hvor I står
• At I laver et kort teambuilding arrangement
• At aktiviteten hedder Lazer Lerdueskydning
• At det er ganske ufarligt, men kan ligne rigtige geværer
• At der kun skydes med lys - IKKE krudt & kugler
• At I er væk indenfor 2 timer
• At det ikke ødelægger noget eller sviner

HVORFOR?
Naboer eller forbipasserende kan ringe til politiet hvis de ser aktiviteten. Ved at ringe 114 på forhånd undgår I unødvendig politiudrykning.

Ved akut nødsituation ring altid 112.`,
      order_index: 5,
      icon: Phone,
      iconKey: 'phone',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'banesetup',
      title: 'BANESETUP',
      content: `PLACERING AF UDSTYR:

• PLASTIKMÅTTER (1-5): Placeres med 50-60 cm mellemrum

• SCOREBOARD TAVLEN: 5-7 meter lige foran måtterne

• GEVÆRERNE: Placeres ovenpå kasserne skråt foran

• KASTEREN: Ca. 20 meter til venstre for scoreboardet
  Placeres så duerne flyver hen over skydezonen

SIKKERHED VED KASTEREN:
• Sørg for ingen udefrakommende går foran den
• Den skyder med stor kraft!
• Vær påpasselig med egne fingre ved samling/adskillelse
• SLUK ALTID kasteren og hiv stikket ud hvis du skal "fiske" duer fri

BANE-LAYOUT:
[KASTER] ----20m---- [SCOREBOARD]
                          |
                        5-7m
                          |
                    [1][2][3][4][5]
                     (Skydemåtter)

Duerne flyver i en bue ca. 30-35 meter ud.`,
      order_index: 6,
      icon: MapPin,
      iconKey: 'mappin',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'haandtering_gevaerer',
      title: 'HÅNDTERING AF GEVÆRER FØR OPGAVEN',
      content: `FREMGANGSMÅDE:

1. ISÆT BATTERIER
   • 4 GENOPLADELIGE batterier i alle 5 geværer
   • VIGTIGT: Normale batterier er for lange og ødelægger fjederen!
   • Batterier må IKKE "slippes" ned - skal roligt glides ned i løbet
   • Husk: Batterier skal ud og i lader efter hvert arrangement!

2. TJEK ALLE GEVÆRER
   • Tænd for dem og displayet
   • Se at de lyser rødt på rigtig kanal

3. TEST-SKYD
   • Skyd et par skud i luften
   • Se om de lyser rødt i begge skud (= OK)
   • Hvis nogle markerer grønt = fejl

HVIS ET GEVÆR RAMMER ALT I TESTSKUD:
Læg det væk FØR kunden kommer, og omgruppér holdene til 4 geværer.

HUSK: En velforberedt instruktør er en selvsikker instruktør!`,
      order_index: 7,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },

    // ========== UNDER OPGAVEN ==========
    {
      activity: 'teamlazer',
      section_key: 'forventninger_during',
      title: 'FORVENTNINGER TIL DIG',
      content: `DU ER BÅDE VÆRT, DOMMER OG GUIDE!

Det er din energi og tilstedeværelse, der sætter rammen for et sjovt og mindeværdigt event.

• Vær synlig og tilgængelig hele tiden
• Hold høj energi og entusiasme
• Vær retfærdig dommer ved uenigheder
• Hold øje med sikkerhed konstant
• Sørg for alle har det sjovt
• Hold tidsplanen

Din evne til at engagere deltagerne, skabe god stemning og sikre en tydelig introduktion er nøglen til en vellykket TeamLazer-oplevelse.`,
      order_index: 10,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'musik',
      title: 'MUSIK TIL OPGAVEN',
      content: `Musik bryder tavsheden og skaber stemning - især hvis gæsterne ikke kender hinanden.

MUSIK-PROTOKOL:

• Det forventes at der spiller musik NÅR GÆSTERNE KOMMER
  Tilpas højt til at der er et godt "lydtæppe"

• SLUK under velkomst og briefing

• TÆND igen mens de skyder

• TÆND ALTID når I har kåret vinderen
  Mens der stadig er gæster ved opgaven

FREMGANGSMÅDE:
1. Connect JBL musikafspiller med bluetooth
2. Brug tablet på WIFI eller din egen telefon
3. Start playlisten: https://l.ead.me/musik1

QR kode findes også i låget til pointblokken.

TIP: Har du Apple Watch kan Spotify justeres derfra.`,
      order_index: 11,
      icon: Music,
      iconKey: 'music',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'tidsplan',
      title: 'TIDSPLAN: EKSEKVERING',
      content: `VARIGHED I ALT: 75-90 minutter

VELKOMST OG HOLD: 5 min
• Byd velkommen
• Fortæl navn(e) på instruktør(er)
• Intro til TeamBattle
• Opdel i teams (hvis ikke gjort på forhånd)

GENNEMGANG AF GEAR: 5 min
• Forklar hvad aktiviteten går ud på
• Laser lerdueskydning - ufarligt
• Duerne er af composit og genbruges
• 4 runder med forskellige regler
• Vi kårer et samlet vinderteam til sidst

TRÆNING AF DELTAGERE: 10-15 min
• Instruktion i geværer
• Testrunde

DE 4 RUNDER: 50-60 min
• LAZERSPORT
• SPEEDSHOT
• SKILLSHOT
• RAPIDFIRE

KÅRING OG AFSKED: 5 min
• Vinderhold kåres
• Tak for i dag`,
      order_index: 12,
      icon: Clock,
      iconKey: 'clock',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'din_rolle_instruktor',
      title: 'DIN ROLLE SOM INSTRUKTØR',
      content: `NÅR DELTAGERNE ER ANKOMMET:

1. BYD VELKOMMEN
   • Fortæl navn(e) på instruktør(er)
   • Intro til TeamBattle

2. OPDEL I TEAMS
   Hvis dette ikke er klaret på forhånd af kunden

3. FORKLAR AKTIVITETEN
   • Der skal skydes med gevær efter lerduer
   • Det virker ved hjælp af laser - ufarligt
   • Duerne er af composit og genbruges
   • 4 runder med forskellige regler
   • Reglerne forklares inden hver runde
   • Vi kårer et samlet vinderteam baseret på alle 4 runders score

4. INSTRUER I GEVÆRERNE

5. EKSEKVÉR TESTRUNDE

6. EKSEKVÉR DE 4 RUNDER

7. UDDEL POINT

8. AFRUNDING OG "TAK FOR I DAG"`,
      order_index: 13,
      icon: Users,
      iconKey: 'users',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'brug_gevaerer',
      title: 'BRUG AF GEVÆRER',
      content: `INSTRUKTION TIL DELTAGERNE:

1. FORKLAR FUNKTION
   • Hvordan gevær, kaster og scoreboard fungerer
   • Hvordan man holder geværet korrekt
   • Hvordan man sigter

2. FORTÆL OM TESTRUNDEN
   • Alle skal testskyde
   • Alle skyder på samme flyvende due
   • Der IKKE skal skiftes skytte FØR du siger til

SIGTETEKNIK:
• Hold geværet stabilt med begge hænder
• Kig langs løbet
• Følg duen med geværet
• Tryk roligt af

VIGTIGT:
• Geværet har 2 skud per due
• Score vises live på displayet
• Hvert gevær har et nummer der matcher displayet`,
      order_index: 14,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'testrunden',
      title: 'TESTRUNDEN',
      content: `FORMÅL:
Alle skal være trygge ved udstyret før konkurrencen starter.

SÅDAN GØR DU:

1. Hver deltager skyder ca. 10 duer

2. Forklar hvordan point vises på scoreboard
   Så deltagerne kan følge med i pointgivning

3. Når alle har skudt 8-15 duer hver (alt efter evner):
   Få ALLE til at hjælpe med at samle duerne ind igen

TIP: Lok dem ved at forklare at LIGE OM LIDT er det en del af konkurrencen at samle duer ind!

4. Fyld kasteren op igen

BYGER ENERGI:
"Nu hvor I har prøvet lidt... hvem tror I vinder!?"

Skab rivalisering og engagement mellem holdene!`,
      order_index: 15,
      icon: Play,
      iconKey: 'play',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'de_4_runder',
      title: 'DE 4 RUNDER',
      content: `RUNDE 1: LAZERSPORT
Antal duer: 10 duer pr. mand
POINT: 2 point for hit på 1. skud, 1 point for hit på 2. skud
Max 2 point pr. due (rammer 1. skud gives IKKE point for 2. skud)

RUNDE 2: SPEEDSHOT
Antal duer: 10 duer pr. mand
POINT: KUN den deltager som rammer duen FØRST får 2 point
Resten kan ramme, men får intet!

RUNDE 3: SKILLSHOT
Antal duer: 5x3 (15) duer pr. mand
POINT: Op til 3 point pr. due (2 for 1. skud + 1 for 2. skud)
SKIFT: Efter hver 3. due rykker alle én plads til højre
(Plads 5 flytter til plads 1)
NB: Score vises stadig på oprindeligt TEAM nummer!

RUNDE 4: RAPIDFIRE
Antal duer: 5x4 eller 5 (20-25) duer pr. mand
SKIFT: Efter hver 4-5. due rykker alle placering
POINT: Rækkefølge - TOP 5 der rammer:
1. = 5 point, 2. = 4 point, 3. = 3 point, 4. = 2 point, 5. = 1 point
Man kan ramme med begge skud og få 2 placeringer (max 9 point)`,
      order_index: 16,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'pointgivning',
      title: 'POINTGIVNING',
      content: `AFSLUTNING AF RUNDE:

Når alle deltagere på teamet har skudt det angivne antal duer:
1. Notér pointtal på pointarket
2. Fordel placeringspoint: 5 – 4 – 3 – 2 – 1
   (også selvom der kun er fx 4 hold med)

SIDELØBENDE:
De 1-3 teams der er i midten af point i runden skal samle duer ind!

POINTLIGHED:
Ved pointlighed får begge teams SAMME antal point og bunden løftes et point op.

EFTER HVER RUNDE:
• Skriv point ned fra displayet fra alle teams
• Fordel scoren 5-1 fra højeste score og nedefter

VARIATIONER (hvis tid til overs):
• Gentag et eller flere spil som "revanche"
• Alle spil gentages, men kun én udvalgt deltager skyder pr. spil`,
      order_index: 17,
      icon: FileText,
      iconKey: 'file',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'afrunding',
      title: 'AFRUNDING OG "TAK FOR I DAG"',
      content: `MENS DER SAMLES DUER IND FOR RUNDE 4:

1. Regn de 4 rundescorer sammen
   Da det er lave numre (1-5) bør det gå stærkt

2. Ved pointlighed:
   Lav en "flest point på 5 skud" på spil 3
   Bed dem selv vælge deres skytte

3. KÅR VINDERHOLDET!

AFSLUT MED:
• "Tak for i dag!"
• Italesæt hvor godt det gik med at ramme duer
• At de fik hygget sig og grint sammen
• At de har set nye sider af hinanden

HUSK:
Afslutningen er det sidste indtryk - gør det mindeværdigt!`,
      order_index: 18,
      icon: CheckCircle2,
      iconKey: 'check',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },

    // ========== EFTER OPGAVEN ==========
    {
      activity: 'teamlazer',
      section_key: 'forventninger_after',
      title: 'FORVENTNINGER TIL DIG',
      content: `• Pak alt udstyr sikkert og effektivt ned
• Efterlad lokationen ren og pæn som du fandt den
• Tjek at intet er glemt
• Ved hjemkomst: Tjek alt gear igennem
• Sørg for at gear er klar til næste opgave

Du og dine kollegaer har et fælles ansvar for at dette sker hver gang!

Det er god stil og professionelt at efterlade lokationen i perfekt stand.`,
      order_index: 20,
      icon: Target,
      iconKey: 'target',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamlazer',
      section_key: 'tjekliste_hjemkomst',
      title: 'TJEKLISTE VED HJEMKOMST',
      content: `VED HJEMKOMSTEN TIL LAGERET:

☐ TØR GEAR AF
   Alt gear inkl. ledninger tørres af med viskestykke/klud
   Er noget for beskidt - GIV BESKED så vi finder en løsning

☐ VÅDT GEAR
   Alle våde kabler og især stik/controller hænges op
   Våde duer tømmes ud og lufttørres
   Våde geværkasser placeres åbne på lageret
   Geværer skal forblive "knækkede"

☐ BATTERIER
   ALLE batterier ud af geværerne og i lader!

☐ SIKRE LADNING
   Display og kaster sættes til lader
   125% SIKR at de lader inden du går!
   Ved mindste tvivl - RING!

☐ POINTSKEMAER
   Brugte skemaer smides ud
   Friske lægges i clipboard

☐ FEJL ELLER MANGLER
   Skriv under "Fejl & Mangler" i app

VIGTIGT: Hvis noget af gearet/anlægget IKKE kan bruges til næste opgave - RING TIL OS MED DET SAMME!`,
      order_index: 21,
      icon: Home,
      iconKey: 'home',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    // TOP 10
    {
      activity: 'teamlazer',
      section_key: 'de_10_bud',
      title: 'DE 10 VIGTIGSTE POINTER',
      content: `TEAMLAZER - DE 10 VIGTIGSTE PUNKTER:

1. RING ALTID 114 ved ankomst til lokationen

2. Tjek at ALLE 5 geværer virker FØR kunden kommer
   Tænd og se rødt LED lys

3. Test-skyd alle geværer (rødt = OK, grønt = fejl)

4. Brug kun GENOPLADELIGE batterier
   Normale batterier ødelægger fjederen!

5. Musik SKAL spille når gæsterne ankommer

6. SLUK musik under velkomst og briefing

7. Vær en engageret vært, dommer og guide

8. Sørg for at deltagerne samler duer ind mellem runder

9. Afslut med klar pointopdatering og vinderkåring

10. Ved hjemkomst: ALLE batterier i lader
    Sikr 125% at display og kaster lader!`,
      order_index: 30,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'blue',
      category: 'summary',
      isDefault: true
    }
  ];
};

// TeamConstruct-specific default sections
const getTeamChallengeSections = (): SectionWithMeta[] => {
  return [
    // FØR OPGAVEN
    {
      activity: 'teamchallenge',
      section_key: 'forventninger_before',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig FØR opgaven starter?

• Vær forberedt og kend de 3 Battle Zoner
• Tjek alle tablets og bokse inden afgang
• Load spillet i LOQUIZ på WIFI inden afgang
• Ankom i god tid til opsætning`,
      order_index: 0,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'maalsaetning',
      title: 'MÅLSÆTNING & TEAMS',
      content: `TeamChallenge er vores mest populære aktivitet!

FORMÅL: Deltagerne skal gennem samarbejde med løsning af meget forskelligartede opgaver se hinandens styrker og have en underholdende og relationsskabende oplevelse.

TEAMOPDELING: 3-5 deltagere pr. team (4 er optimalt)

DE 3 BATTLE ZONER:
• BE@T-THE-BOX: Fysiske opgaver i 32 sorte bokse
• BONUSZONE: 18 opgaver på tablet - kan løses HELE tiden
• BE@T-THE-M@P: Ca. 50 GPS opgaver udendørs`,
      order_index: 1,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'tidsplan',
      title: 'TIDSPLAN',
      content: `VARIGHED: 75-150 min

• 5 min: Intro - brug gerne videointro
• 5 min: Opdeling af hold, fordeling ved borde
• 5 min: Til at sende "Beat-the-Map" ud
• 60-120 min: Til battle (afhængigt af Beat-The-Map)
• 10 min: Til at få alle teams retur
• 5 min: Til kåring af vinder`,
      order_index: 2,
      icon: Clock,
      iconKey: 'clock',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'pakkeliste',
      title: 'PAKKELISTE VED AFGANG',
      content: `1. Pak TeamChallenge sæt med sorte bokse (samme farve skilt)
2. Kuffert med tablets - tjek antal i app
   • Tjek strøm på ALLE tablets
   • Tjek Sim Kort forbindelse med 4G
3. Load spillet i LOQUIZ på WIFI INDEN afgang
4. JBL musikafspiller - par med telefon
5. Den store sorte instruktørkasse med:
   • Laminerede A4 numre (1-50)
   • Orange duge til runde borde
   • Orange filtmåtter
   • Oplader til ballonpumpen
6. Høje caféborde - et til hvert team
7. 1-2 sorte 120 cm borde til boxene`,
      order_index: 3,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'green',
      link: '#teamchallenge_packing_afgang',
      linkText: 'PAKKELISTE AFGANG',
      isInternal: true,
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'teknisk_forberedelse',
      title: 'TEKNISK FORBEREDELSE',
      content: `SE VIDEO: https://l.ead.me/teamaction

TABLETS:
• Placer en tablet på hvert højbord
• Åbn LOQUIZ i bunden af skærmen (blåt ikon)
• Find login til spillet i TeamBattle app'en
• Username & kodeord er det SAMME
• Vær opmærksom på STORE/små bogstaver
• Login på alle tablets med kode eller QR
• Skærmlås tablet`,
      order_index: 4,
      icon: Settings,
      iconKey: 'settings',
      color: 'green',
      link: 'https://l.ead.me/teamaction',
      linkText: 'SE TABLET GUIDE VIDEO',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'opstilling',
      title: 'OPSTILLING AF SPILOMRÅDE',
      content: `OPSÆTNING:
• Opstil borde og kufferter så der er klart
• Opsæt orange duge på højborde
• Alle sorte kasser stilles OPREJST på et bord
• Placer bordet i MIDTEN mellem alle teams
• Ligeligt fordelt: et højbord til hvert hold
• Placer en tablet på hvert bord (logget ind + skærmlåst)`,
      order_index: 5,
      icon: MapPin,
      iconKey: 'mappin',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    // UNDER OPGAVEN
    {
      activity: 'teamchallenge',
      section_key: 'forventninger_during',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig UNDER opgaven?

• Bevæg dig HELE tiden rundt mellem bordene
• "Afhjælp tvivl og hyggesnakke"
• Hjælp med instruktør-opgaver (gule strips)
• Sørg for god stemning og energi`,
      order_index: 6,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'musik',
      title: 'MUSIK TIL OPGAVEN',
      content: `Connect musikafspiller med bluetooth.

QR kode findes i alle tablet kassers låg.

REGLER:
• Musik SKAL spille når gæsterne kommer (godt lydtæppe)
• SLUK under velkomst
• Start lidt lavere igen de første 10-15 min
• TÆND igen hvis stemningen daler
• TÆND ALTID når I har kåret vinder

Er I flere instruktører: én har ansvar for musik!`,
      order_index: 7,
      icon: Music,
      iconKey: 'music',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'velkomst',
      title: 'VELKOMST',
      content: `BYD VELKOMMEN og fortæl:
• Navn(e) på instruktører
• Kort intro til TeamBattle

FORKLAR AKTIVITETEN:
• Som team skal I løse flest opgaver korrekt inden for tiden
• Tiden er vigtig både på ENKELTE opgaver og HELE aktiviteten
• Opgaverne spænder bredt fra korte spørgsmål til komplekse opgaver
• INTET er fysisk krævende
• Rigtigt svar = POINT, forkert svar = MINUS point
• Der kåres en TeamChallenge vinder

FORKLAR DE 3 ZONER (2 eller 3 afhængigt af Beat-The-Map):
1. BE@T-THE-BOX: Fysiske opgaver i sorte bokse
2. BONUSZONE: Opgaver på tablet - kan løses HELE aktiviteten
3. BE@T-THE-M@P: Opgaver på kort (ikke altid med)`,
      order_index: 8,
      icon: Users,
      iconKey: 'users',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'opstart',
      title: 'OPSTART AF AKTIVITETEN',
      content: `HVIS MANGE DELTAGERE (deles i 2 grupper):
• Fortæl at instruktører kommer rundt til hvert bord
• Start hvert team op NÅR de har skrevet teamnavn

TEAMNAVNE:
• Teamet læser introen først
• Derefter indtastes TEAMNAVN der SKAL indeholde TEAMNUMMER
• Eks: "De 4 Musketerer"
• Bed dem markere når de er klar til instruks

EFTER 3-5 MINUTTER:
• Afklar om teams har FORSTÅET tabletten
• Hjælp med "instruktørhjælp" opgaver:
  - Pointgivning efter fysisk aktivitet
  - Hjælp til billede/video ved Bonus opgaver
  - Facilitér instruktørdrevne opgaver (GUL strips)`,
      order_index: 9,
      icon: Play,
      iconKey: 'play',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'beat_the_box',
      title: 'BEAT THE BOX - ZONEN',
      content: `VIDEO: https://l.ead.me/teamchallenge

FORKLAR TIL KUNDEN:
1. Hent EN box ad gangen til jeres eget bord FØR I åbner den
2. Åbn boxen
3. Scan QR kode med tilsvarende flag (sprog)
   • "CODE IS NOT IN THE GAME" = forkert sprog, vend kortet
   • QR scanner findes nederste højre hjørne + menuen i venstre top
4. Nogle opgaver har TIDSGRÆNSE - send svar 10-15 sek inden
5. Returnér kuffert til bordet når opgaven er løst
6. Anbefal at SKIFTE mellem BONUSZONE og bokse

HUSK:
• BLÅ QR scanneknap i nederste højre hjørne
• Ca. 30 bokse på bordet - hent én ad gangen
• Rødt ur under billedet = tid på opgaven
• Forkerte svar giver MINUSPOINT
• Vi hjælper gerne med at tage billeder`,
      order_index: 10,
      icon: Package,
      iconKey: 'package',
      color: 'yellow',
      link: 'https://l.ead.me/teamchallenge',
      linkText: 'SE VIDEO GENNEMGANG',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'bonus_zone',
      title: 'BONUS - ZONEN',
      content: `VIDEO 31: https://l.ead.me/teamchallenge

Under HELE spillet er der en BLÅ knap "BonusZone" nederst.

BONUSZONEN:
• 6x3 ikoner i 6 temaer
• Tryk på ikon = åbner BONUS opgave
• Foto/video opgaver: Instruktør hjælper med billede
• Video bruger 3 sek fra tryk til optagelse

VIGTIGT - GØR DEM OPMÆRSOM GENTAGNE GANGE:
• Bonusopgaver kan løses HELE spillet
• Grønt OK (V) = korrekt
• Rødt kryds (X) = forkert
• 3 rigtige i en linje = 300 BONUS point`,
      order_index: 11,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'beat_the_map',
      title: 'BEAT THE MAP - ZONEN',
      content: `Beat-The-Map er udendørs GPS jagt efter BLÅ ikoner.

FORKLAR TIL HOLDET:
• 3 sværhedsgrader i 3 farver = forskellig point
• Opgaver dukker AUTOMATISK op når I bevæger jer hen
• Nogle opgaver har TID - rødt ur under billedet
• Forkerte svar giver MINUSPOINT
• Er opgaven åben SKAL den løses - ellers minuspoint
• Zoom med fingrene (demonstrér)
• Centrér position: blå knap i højre top
• Google is cheating!

TIMING:
• Beat-The-Map ≈ halvdelen af tiden
• Send dem ud FØR du briefer Beat-The-Box
• Når infoskærm dukker op = kom retur til startzonen
• BONUSZONEN er også synlig her`,
      order_index: 12,
      icon: Navigation,
      iconKey: 'mappin',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'kaaring',
      title: 'KÅRING AF VINDERTEAM',
      content: `PÅ STORSKÆRM:
• Aftal med kunden FØR opgaven hvordan du får adgang
• Vælg FULD SKÆRM i browseren FØR du kobler resultpage til
• SKJUL TOP 3 til du skal kåre dem

UDEN STORSKÆRM - Showman!
1. Bed team nr. 3 komme frem UDEN at fortælle placering
2. Fortæl deres point
3. Lad folk klappe - og fortæl så de er nr. 3
4. Gentag for nr. 2 og nr. 1
5. Aflever ballontrofæer fra BOX 20 til vinderteamet
6. Fortæl at kontaktperson har rankingliste og billeder

TAK AF:
• Nævn TeamBattle
• "Vi glæder os til at TEAMBATTLE med jer igen"
• TÆND MUSIK!`,
      order_index: 13,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    // EFTER OPGAVEN
    {
      activity: 'teamchallenge',
      section_key: 'forventninger_after',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig EFTER opgaven?

• Ryd grundigt op
• Tjek alle bokse er komplette
• Tjek alle tablets virker
• Rapporter fejl/mangler i evalueringen`,
      order_index: 14,
      icon: Target,
      iconKey: 'target',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'link_til_kunden',
      title: 'LINK TIL KUNDEN',
      content: `Vi sender link til kunden med:
• Resultpage - rankingliste
• Medialink - download billeder og videoer
• Answers - svar fra alle teams (hvis egne opgaver)

Mailen kommer MENS de er i gang med opgaven.

Hvis ikke: Send linket fra vores app under NOTER på opgaven.`,
      order_index: 15,
      icon: FileText,
      iconKey: 'file',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamchallenge',
      section_key: 'tjekliste',
      title: 'TJEKLISTE HJEMKOMST',
      content: `TJEK ALLE BOKSE:
• Er der NR. på alle kufferter?
• Er der QR koder i alle kufferter?
• Er der skum i alle kufferter?

SPECIELLE TJEK:
• Box 2: Etch a Sketch virker + markeringsprikker
• Box 3: 4 Rubic der virker
• Box 4: Klokker sidder på pinden
• Box 9: Alle 80 brikker til Jorden Rundt
• Box 16: Låsen på kontrolkuffert er låst
• Box 19: Pump fodbolde (pumpe i box 25)
• Box 20: FARVEDE balloner + batteri + sort dut
• Box 22: Hint-billede i tabletkuffert
• Box 25: Minimum 7 genstande at skyde med
• Box 26: 4 små figurer i hver kasse
• Box 27: Batterier virker
• Box 28: FRISKE krydderier - fyldte`,
      order_index: 16,
      icon: CheckCircle2,
      iconKey: 'check',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    // DE 10 BUD
    {
      activity: 'teamchallenge',
      section_key: 'de_10_bud',
      title: 'DE 10 BUD',
      content: `TEAMCHALLENGE - DE 10 VIGTIGSTE PUNKTER:

1. Load spillet i LOQUIZ på WIFI INDEN afgang
2. Tjek strøm og 4G på ALLE tablets
3. Opsæt bokse OPREJST og indbydende i midten
4. MUSIK skal spille når gæsterne kommer
5. Forklar de 3 ZONER tydeligt
6. Bevæg dig HELE TIDEN rundt og hjælp
7. Mind dem om BONUSZONEN gentagne gange
8. Send Beat-The-Map ud FØR du briefer Beat-The-Box
9. Kår vinderen som en SHOWMAN
10. TJEK alle bokse er komplette efter opgaven`,
      order_index: 20,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'blue',
      category: 'summary',
      isDefault: true
    }
  ];
};

const getTeamConstructSections = (): SectionWithMeta[] => {
  return [
    // FØR OPGAVEN
    {
      activity: 'teamconstruct',
      section_key: 'forventninger_before',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig FØR opgaven starter?

• Vær forberedt og kend din opgave
• Tjek alt gear inden afgang
• Ankom i god tid
• Kontakt kunden ved ankomst`,
      order_index: 0,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
      section_key: 'maalsaetning',
      title: 'MÅLSÆTNING & TEAMS',
      content: `Formålet med TeamConstruct er at alle TEAMS skal løse en 100% ens opgave, med de helt samme materialer, og med et Add-on midtvejs i tiden.

TEAMOPDELING: 3-4 deltagere pr. team

Resultatet bliver, trods samme udgangspunkt – meget forskelligt.`,
      order_index: 1,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
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
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
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
      color: 'green',
      link: '#teamconstruct_packing_afgang',
      linkText: 'PAKKELISTE AFGANG',
      isInternal: true,
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
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
      color: 'green',
      link: 'https://l.ead.me/TeamConstruct-Video',
      linkText: 'SE OPSÆTNING VIDEO',
      category: 'before',
      isDefault: true
    },
    // UNDER OPGAVEN
    {
      activity: 'teamconstruct',
      section_key: 'forventninger_during',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig UNDER opgaven?

• Vær synlig og tilgængelig
• Hold øje med sikkerhed
• Sørg for god stemning
• Overhold tidsplanen`,
      order_index: 5,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
      section_key: 'musik',
      title: 'MUSIK TIL OPGAVEN',
      content: `Connect JBL musikafspiller med bluetooth til din telefon.

Start TeamBattle Play QR playliste - findes i tablet kassernes låg.

REGLER:
• Musik skal spille når gæsterne kommer
• Sluk under velkomst og fællesinstruktioner
• Tænd når holdene bygger
• Tænd altid ved oprydning`,
      order_index: 6,
      icon: Music,
      iconKey: 'music',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
      section_key: 'velkomst',
      title: 'VELKOMST',
      content: `Byd velkommen og fortæl:
• Hvem du er
• At du glæder dig til at udfordre dem
• Det er en underholdende konstruktionsopgave
• Der kommer lidt overraskelser undervejs

Sørg for at ALLE kan høre dig tydeligt.`,
      order_index: 7,
      icon: Users,
      iconKey: 'users',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
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
      order_index: 8,
      icon: Settings,
      iconKey: 'settings',
      color: 'yellow',
      link: 'https://l.ead.me/TeamConstruct-Video',
      linkText: 'SE AFVIKLING VIDEO',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
      section_key: 'kaaring',
      title: 'KONKURRENCE & KÅRING',
      content: `AFSLUTNINGEN ER DET VIGTIGSTE!

1. Alle fra alle hold går rundt sammen
2. Et hold tjekker om modstanderen opfylder kriterierne
3. Du noterer pointene ned
4. Annoncér vinderen højtideligt

Sørg for god stemning og anerkendelse til ALLE hold.`,
      order_index: 9,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    // EFTER OPGAVEN
    {
      activity: 'teamconstruct',
      section_key: 'forventninger_after',
      title: 'FORVENTNINGER TIL DIG',
      content: `Hvad forventes der af dig EFTER opgaven?

• Ryd grundigt op
• Tjek alt gear virker
• Rapporter fejl/mangler
• Evaluer opgaven`,
      order_index: 10,
      icon: Target,
      iconKey: 'target',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamconstruct',
      section_key: 'oprydning',
      title: 'OPRYDNING & HJEMKOMST',
      content: `Gearet skal virke og være klar til næste bruger!

EFTER HVER OPGAVE:
• Smid brugte paprør og gaffatape ud
• OMPAK og tjek alt i de gule værktøjskasser
• Skriv fejl/mangler i evalueringen
• Ring STRAKS hvis gear ikke virker

Tænd musik under oprydning!`,
      order_index: 11,
      icon: Home,
      iconKey: 'home',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    // DE 10 BUD
    {
      activity: 'teamconstruct',
      section_key: 'de_10_bud',
      title: 'DE 10 BUD',
      content: `TEAMCONSTRUCT - DE 10 VIGTIGSTE PUNKTER:

1. Tjek ALLE værktøjskasser inden afgang
2. Sørg for skærehandsker til hvert hold
3. Ankom i god tid og sæt op korrekt
4. Tænd musik FØR gæsterne ankommer
5. Forklar opgaven tydeligt og entusiastisk
6. Hold øje med sikkerhed ved savning
7. Udlever Add-on på det rigtige tidspunkt
8. Sørg for fair pointgivning ved kåring
9. OMPAK alt gear korrekt efter opgaven
10. Rapporter fejl/mangler med det samme`,
      order_index: 20,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'blue',
      category: 'summary',
      isDefault: true
    }
  ];
};

// Default sections for other activities
const getGenericSections = (activity: string): SectionWithMeta[] => {
  return [
    // FØR OPGAVEN
    {
      activity,
      section_key: 'forventninger_before',
      title: 'FORVENTNINGER TIL DIG',
      content: 'Hvad forventes der af dig før opgaven starter?',
      order_index: 0,
      icon: Target,
      iconKey: 'target',
      color: 'green',
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
    // UNDER OPGAVEN
    {
      activity,
      section_key: 'forventninger_during',
      title: 'FORVENTNINGER TIL DIG',
      content: 'Hvad forventes der af dig under opgaven?',
      order_index: 2,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity,
      section_key: 'afvikling',
      title: 'AFVIKLING',
      content: 'Tilføj information om afvikling af aktiviteten her.',
      order_index: 3,
      icon: Play,
      iconKey: 'play',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    // EFTER OPGAVEN
    {
      activity,
      section_key: 'forventninger_after',
      title: 'FORVENTNINGER TIL DIG',
      content: 'Hvad forventes der af dig efter opgaven?',
      order_index: 4,
      icon: Target,
      iconKey: 'target',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity,
      section_key: 'oprydning',
      title: 'OPRYDNING',
      content: 'Tilføj information om oprydning her.',
      order_index: 5,
      icon: CheckCircle2,
      iconKey: 'check',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    // DE 10 BUD
    {
      activity,
      section_key: 'de_10_bud',
      title: 'DE 10 BUD',
      content: `Her er de vigtigste punkter du skal huske:

1. Vær altid forberedt og tjek dit gear
2. Ankom i god tid til lokationen
3. Kontakt kunden ved ankomst
4. Sørg for god stemning og energi
5. Hold øje med sikkerhed hele tiden
6. Overhold tidsplanen
7. Vær synlig og tilgængelig for deltagerne
8. Afslut med stil og anerkend alle
9. Ryd grundigt op efter opgaven
10. Rapporter fejl og mangler med det samme`,
      order_index: 10,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'blue',
      category: 'summary',
      isDefault: true
    }
  ];
};

// TeamRobin-specific default sections based on CrewGuide
const getTeamRobinSections = (): SectionWithMeta[] => {
  return [
    // ========== FØR OPGAVEN ==========
    {
      activity: 'teamrobin',
      section_key: 'hvad_er_teamrobin',
      title: 'HVAD ER TEAMROBIN?',
      content: `TeamRobin er en moderne og sjov teambuilding-aktivitet baseret på bueskydning. Deltagerne konkurrerer i hold og skal ramme skiver placeret i forskellige afstande.

MÅLSÆTNING:
At give deltagerne en sjov og udfordrende oplevelse, hvor de gennem samarbejde og god teknik skal forsøge at ramme flest mulige point.

TEAMSTØRRELSE:
• 3-6 deltagere pr. team (4-5 er optimalt)
• Max 5 teams ad gangen (5 buer)

VARIGHED: 60-90 minutter typisk`,
      order_index: 0,
      icon: Target,
      iconKey: 'target',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'tidsplan',
      title: 'TIDSPLAN',
      content: `TYPISK TIDSPLAN (75 min):

• 10 min: Velkomst og introduktion
• 10 min: Instruktion i teknik og sikkerhed
• 45 min: 3 Battles (15 min pr. battle)
• 10 min: Afslutning og kåring af vinder

VIGTIGT:
• Ankom minimum 45 min før eventstart (LEAD)
• Brug tid på ordentlig instruktion - det giver bedre oplevelse
• Hold pause mellem battles til at samle pile`,
      order_index: 1,
      icon: Clock,
      iconKey: 'clock',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'pakning_gear',
      title: 'PAKNING & GEAR',
      content: `FØLGENDE SKAL MED:

☐ 5 buer (tjek strenge og limbs)
☐ Min. 30 pile (helst 40)
☐ 5 armguards (underarmsbeskyttere)
☐ 5 fingerguards (fingerbeskyttere)
☐ Skydebord/stativ til pile
☐ Skiver med stativer (min. 3 stk)
☐ Målebånd til afstande
☐ JBL musikafspiller
☐ Scoreboard og tuscher

TJEK FØR AFGANG:
• At alle buer er intakte og strenge OK
• At der er nok pile uden skader
• At alle beskyttelsesudstyr er med`,
      order_index: 2,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'ankomst_location',
      title: 'ANKOMST & LOCATION',
      content: `VED ANKOMST:

1. FIND PLACERING TIL BANEN
   • Minimum 30 meter i længden
   • Ingen gennemgang bag skiverne
   • Fladt og jævnt underlag
   • Gerne i læ for vind

2. SIKKERHEDSZONE
   • Afspær området bag skiverne
   • Sørg for ingen kan gå ind i skudzonen
   • Marker tydeligt hvor man må stå

3. TJEK TERRÆN
   • Ingen forhindringer i skudretningen
   • Pilene skal kunne findes igen!
   • Undgå områder med høj vegetation`,
      order_index: 3,
      icon: MapPin,
      iconKey: 'mappin',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'opsaetning_bane',
      title: 'OPSÆTNING AF BANE',
      content: `BANE-LAYOUT:

SKYDEPLADSER        SKIVER
[1][2][3][4][5]  →  [S1][S2][S3]
     ↑                   ↑
  Skydelinje         10-20 meter

AFSTANDE:
• Nybegyndere: 10 meter
• Let øvede: 15 meter
• Øvede: 20 meter

OPSÆTNING:
1. Placer skiver stabilt (brug jernpløkker)
2. Marker skydelinje tydeligt
3. Placer skydebord til pile ved siden
4. Tjek at alle skiver er synlige fra skydelinje

SIKKERHED:
• Ingen må gå foran skydelinjen når der skydes
• Afvent signal før pile hentes`,
      order_index: 4,
      icon: MapPin,
      iconKey: 'mappin',
      color: 'green',
      category: 'before',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'musik',
      title: 'MUSIK TIL OPGAVEN',
      content: `Musik er med til at skabe den rette stemning!

ANBEFALET MUSIK:
• Rolig instrumental musik under skydning
• Mere energisk musik under pauser
• Epic/cinematic musik til finalen

PLAYLISTER:
Brug TeamBattle's officielle playlister i Spotify under "TeamRobin"

LYDNIVEAU:
• Ikke for højt - deltagerne skal kunne høre instruktioner
• Musikken skal være stemningsskabende, ikke dominerende

VIGTIGT:
Hav musikken klar og tilsluttet FØR deltagerne ankommer!`,
      order_index: 5,
      icon: Music,
      iconKey: 'music',
      color: 'green',
      category: 'before',
      isDefault: true
    },

    // ========== UNDER OPGAVEN ==========
    {
      activity: 'teamrobin',
      section_key: 'velkomst_intro',
      title: 'VELKOMST & INTRO',
      content: `BYD VELKOMMEN:

1. Præsenter dig selv og TeamRobin
2. Forklar dagens program og tidsplan
3. Opdel i teams (3-6 personer pr. team)
4. Tildel holdfarver/navne

SIKKERHEDSBRIEFING (VIGTIGT!):
• Pilen må ALDRIG peges mod mennesker
• Buen spændes KUN ved skydelinjen
• ALLE venter på signal før pile hentes
• Pile hentes KUN når instruktør siger det er OK

TEKNIK-INTRODUKTION:
• Vis korrekt stand og greb
• Demonstrer træk og slip
• Forklar sigte og mesterøje
• Lad alle prøve et par træningsskud`,
      order_index: 10,
      icon: Users,
      iconKey: 'users',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'teknik',
      title: 'SKYDESTILLING & TEKNIK',
      content: `KORREKT STAND:

1. PLACERING
   • Stå vinkelret på målet (90 grader)
   • Fødderne skulderbredde fra hinanden
   • Vægten ligeligt fordelt

2. GREB PÅ BUEN
   • Hold buen i den hånd der peger mod målet
   • Let greb - ikke klem!
   • Armen strakt men ikke låst

3. TRÆK OG ANKER
   • Træk strengen til hagen/mundvigen
   • Hold ankerpunktet konsistent
   • Brug ryg- og skuldermusklerne

4. SIGTE OG SLIP
   • Brug dit dominante øje (mesterøje)
   • Sigt langs pilen mod målet
   • Slip strengen rent - ikke "kast"

5. FOLLOW-THROUGH
   • Hold stillingen til pilen rammer
   • Analysér skuddet`,
      order_index: 11,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'mesteroeje',
      title: 'MESTERØJE / SKYTTEØJE',
      content: `Mesterøjet er det dominante øje, som bør bruges til at sigte med.

SÅDAN FINDER DU MESTERØJET:

1. Stræk armene frem og lav en trekant med hænderne
2. Se på et punkt gennem trekanten med begge øjne åbne
3. Luk skiftevis det ene og andet øje
4. Det øje der stadig ser punktet gennem trekanten er mesterøjet

VIGTIGT:
• De fleste højrehåndede har højre mesterøje
• Men ikke alle! Tjek altid
• Ved kryds-dominans (fx højrehåndet med venstre mesterøje) kan det være en udfordring

TIP: Lad deltagerne finde deres mesterøje som en del af introduktionen - det gør dem mere engagerede!`,
      order_index: 12,
      icon: Target,
      iconKey: 'target',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'battle_1',
      title: 'BATTLE 1 - BATTLE OF SCORES',
      content: `STANDARDBATTLE - Point pr. ring

REGLER:
• Hver deltager skyder 3 pile pr. runde
• Point baseret på skivens ringe (10-1 point)
• Holdets samlede score tælles

POINTGIVNING:
• Gul midte: 10 point
• Rød ring: 8 point
• Blå ring: 6 point
• Sort ring: 4 point
• Hvid ring: 2 point
• Skive ramt udenfor: 1 point
• Miss: 0 point

ANTAL RUNDER: 3-5 runder pr. hold

VARIATIONER:
• Kun gul tæller (alt eller intet)
• Dobbelt point for første skud
• Bonuspoint for 3 i samme ring`,
      order_index: 13,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'battle_2',
      title: 'BATTLE 2 - AKKUMULATION BATTLE',
      content: `AKKUMULERET SCORE

REGLER:
• Holdene skyder på skift
• Første hold der når X point vinder
• Typisk mål: 50-100 point

SPÆNDING:
• Denne battle skaber drama!
• Holdene kan se hinandens fremskridt
• Taktik: Skal man satse eller spille sikkert?

TIPS TIL INSTRUKTØR:
• Opdater scoreboard løbende
• Kommenter spændende skud
• Skab stemning når det er tæt

MÅLSCORE ANBEFALING:
• 50 point: Hurtig runde
• 75 point: Medium
• 100 point: Lang, dramatisk finale`,
      order_index: 14,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'battle_3',
      title: 'BATTLE 3 - ELIMINATION BATTLE',
      content: `KNOCKOUT / ELIMINATION

REGLER:
• Alle hold skyder samtidig (1 skud pr. person)
• Holdet med laveste score er UDE
• Fortsæt indtil én vinder

SPÆNDINGSELEMENT:
• Højt pres på hvert enkelt skud
• Publikum hepper
• Dramatisk finale!

VARIATIONER:
• "Sudden Death": Ved uafgjort skyder begge hold igen
• "Golden Arrow": Kun én skyder pr. hold i finalen
• "All-in": Alle pile tæller, men man må kun hente pile når alle har skudt

TIPS:
• Gem denne battle til sidst
• Skab drama med kommentarer
• Lav en ægte finale-stemning`,
      order_index: 15,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'variationer',
      title: 'VARIATIONER & BONUS',
      content: `EKSTRA UDFORDRINGER:

BLIND ARCHER:
• Skytten har bind for øjnene
• Teamet guider med ord
• Sjovt og udfordrende!

SPEED ROUND:
• Flest pile i skiven på 60 sekunder
• Hele holdet skyder på skift
• Kaotisk og sjovt!

MOVING TARGET:
• Skiver der svinger eller bevæger sig
• Kræver timing

BALLOON POP:
• Balloner på skiverne
• Første hold der sprænger alle vinder

ROBIN HOOD:
• Bonus for at ramme sin egen pil
• Ekstremt sjældent men legendarisk!

TIPS:
Vælg variationer baseret på gruppens niveau og energi`,
      order_index: 16,
      icon: Settings,
      iconKey: 'settings',
      color: 'yellow',
      category: 'during',
      isDefault: true
    },

    // ========== EFTER OPGAVEN ==========
    {
      activity: 'teamrobin',
      section_key: 'afslutning',
      title: 'AFSLUTNING & KÅRING',
      content: `AFSLUTNING:

1. SAMLING
   • Saml alle deltagere
   • Opsummer dagens battles

2. KÅRING AF VINDER
   • Annoncer den samlede score
   • Kår vinderholdet med begejstring!
   • Del evt. præmier/diplomer ud

3. TAK FOR I DAG
   • Tak deltagerne for deres indsats
   • Nævn highlights fra dagen
   • Afslut med et smil!

FOTO-MULIGHED:
Tilbyd at tage et gruppebillede med buerne - populært!`,
      order_index: 20,
      icon: Trophy,
      iconKey: 'trophy',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'nedpakning',
      title: 'NEDPAKNING & TJEK',
      content: `NEDPAKNING:

1. PILE
   • Saml ALLE pile (tæl dem!)
   • Tjek for skader på spidser og fjer
   • Rapporter manglende eller ødelagte pile

2. BUER
   • Afspænd buerne (tag strengen af)
   • Tjek limbs for revner
   • Pak forsigtigt i tasker

3. SKIVER OG STATIVER
   • Pak skiver ned
   • Saml stativer og pløkker
   • Tjek at intet efterlades

4. BESKYTTELSESUDSTYR
   • Saml alle armguards
   • Saml alle fingerguards
   • Tæl at alt er med

VIGTIGT:
Efterlad området som du fandt det!`,
      order_index: 21,
      icon: PackageCheck,
      iconKey: 'package',
      color: 'red',
      category: 'after',
      isDefault: true
    },
    {
      activity: 'teamrobin',
      section_key: 'hjemkomst',
      title: 'VED HJEMKOMST',
      content: `NÅR DU KOMMER HJEM:

1. AFLÆSNING
   • Bær alt gear ind
   • Stil det på rette plads

2. TJEK UDSTYRET
   • Gennemgå pile for skader
   • Tjek buer og strenge
   • Rapporter fejl og mangler

3. OPLADNING
   • Sæt JBL-højtaler til opladning
   • Tjek tablet hvis brugt

4. RAPPORTERING
   • Udfyld "Fejl & Mangler" hvis relevant
   • Giv feedback til kontoret

HUSK: Det næste team skal have udstyret i orden!`,
      order_index: 22,
      icon: Home,
      iconKey: 'home',
      color: 'red',
      category: 'after',
      isDefault: true
    },

    // ========== DE 10 BUD ==========
    {
      activity: 'teamrobin',
      section_key: 'de_10_bud',
      title: 'DE 10 BUD - TEAMROBIN',
      content: `1. SIKKERHED FØRST
   Pilen peges ALDRIG mod mennesker - uanset om buen er spændt eller ej.

2. VÆR FORBEREDT
   Tjek alt udstyr inden afgang og ankom i god tid.

3. GIV EN GOD INTRO
   En grundig instruktion giver bedre oplevelse for alle.

4. SKAB STEMNING
   Brug musik, entusiasme og energi til at løfte oplevelsen.

5. HOLD ØJE MED SIKKERHED
   Vær altid opmærksom på hvor pile peges og hvem der er i området.

6. VÆR RETFÆRDIG
   Alle regler gælder for alle - vær en fair dommer.

7. ENGAGER ALLE
   Sørg for at selv de usikre føler sig velkomne og inkluderet.

8. TÆL DINE PILE
   Hold styr på udstyret - manglende pile skal findes eller rapporteres.

9. EFTERLAD STEDET PÆNT
   Ryd op efter dig og lad området stå som du fandt det.

10. HAV DET SJOVT!
    Din energi smitter - hvis du har det sjovt, har deltagerne det også!`,
      order_index: 30,
      icon: ClipboardList,
      iconKey: 'clipboard',
      color: 'blue',
      category: 'summary',
      isDefault: true
    }
  ];
};

// Get default sections based on activity
const getDefaultSections = (activity: string): SectionWithMeta[] => {
  switch (activity) {
    case 'teamlazer':
      return getTeamLazerSections();
    case 'teamrobin':
      return getTeamRobinSections();
    case 'teamconstruct':
      return getTeamConstructSections();
    case 'teamchallenge':
      return getTeamChallengeSections();
    default:
      return getGenericSections(activity);
  }
};

const ActivityGuide: React.FC<ActivityGuideProps> = ({ activity, onNavigate }) => {
  const { profile } = useAuth();
  const [sections, setSections] = useState<SectionWithMeta[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIcon, setEditIcon] = useState('file');
  const [editCategory, setEditCategory] = useState<CategoryKey>('before');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editLinkedPackingList, setEditLinkedPackingList] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newSectionImageRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [newSectionVideoUrl, setNewSectionVideoUrl] = useState('');

  // Viewed sections tracking
  const [viewedSections, setViewedSections] = useState<Record<string, string>>({});
  const [showChangesPopup, setShowChangesPopup] = useState(false);
  const [changedSections, setChangedSections] = useState<SectionWithMeta[]>([]);

  // Category modal state
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  // Linked packing list data cache
  const [linkedPackingListData, setLinkedPackingListData] = useState<Record<string, PackingItemData[]>>({});

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

    // Get deleted section keys
    const deletedKeys = getDeletedSections(activity);

    // Start with defaults, filtering out deleted ones
    let allSections: SectionWithMeta[] = getDefaultSections(activity)
      .filter(s => !deletedKeys.includes(s.section_key));

    if (result.success && result.data) {
      // Merge with database sections
      result.data.forEach((dbSection: GuideSection) => {
        const existingIndex = allSections.findIndex(s => s.section_key === dbSection.section_key);
        if (existingIndex >= 0) {
          // Update existing section - use icon_key from DB if available
          const iconKey = dbSection.icon_key || allSections[existingIndex].iconKey;
          allSections[existingIndex] = {
            ...allSections[existingIndex],
            ...dbSection,
            icon: getIconByKey(iconKey || 'file'),
            iconKey: iconKey,
            color: allSections[existingIndex].color,
            category: (dbSection.category as CategoryKey) || allSections[existingIndex].category,
            updated_at: dbSection.updated_at
          };
        } else {
          // Add new custom section - use icon_key from DB or fallback
          const iconKey = dbSection.icon_key || dbSection.section_key.split('_')[0] || 'file';
          allSections.push({
            ...dbSection,
            icon: getIconByKey(iconKey),
            iconKey: iconKey,
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
    setEditIcon(section.iconKey || 'file');
    setEditCategory(section.category);
    setEditVideoUrl(section.video_url || '');
    setEditLinkedPackingList(section.linked_packing_list || '');
  };

  const handleSaveEdit = async (section: SectionWithMeta) => {
    setIsSaving(true);
    try {
      // Calculate new order_index if category changed
      let newOrderIndex = section.order_index || 0;
      if (editCategory !== section.category) {
        const targetCategorySections = sections.filter(s => s.category === editCategory);
        const maxOrder = Math.max(...targetCategorySections.map(s => s.order_index || 0), -1);
        newOrderIndex = maxOrder + 1;
      }

      const updatedSection: GuideSection = {
        id: section.id,
        activity: section.activity || activity,
        section_key: section.section_key,
        title: editTitle,
        content: editContent,
        image_url: section.image_url,
        video_url: editVideoUrl || undefined,
        icon_key: editIcon,
        linked_packing_list: editLinkedPackingList || undefined,
        order_index: newOrderIndex,
        category: editCategory
      };

      console.log('Saving section:', updatedSection);
      const result = await saveGuideSection(updatedSection);
      console.log('Save result:', result);

      if (result.success) {
        const now = new Date().toISOString();
        setSections(prev => prev.map(s =>
          s.section_key === section.section_key
            ? {
                ...s,
                title: editTitle,
                content: editContent,
                video_url: editVideoUrl || undefined,
                linked_packing_list: editLinkedPackingList || undefined,
                icon: getIconByKey(editIcon),
                iconKey: editIcon,
                category: editCategory,
                order_index: newOrderIndex,
                id: result.id || s.id,
                updated_at: now
              }
            : s
        ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
        setEditingSection(null);
      } else {
        alert('Kunne ikke gemme: ' + (result.error || 'Ukendt fejl'));
      }
    } catch (err) {
      console.error('Error saving section:', err);
      alert('Fejl ved gemning af sektion');
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
    setEditTitle('');
    setEditVideoUrl('');
  };

  // Fetch packing list items for linked checklist display
  const fetchLinkedPackingList = async (linkedKey: string): Promise<PackingItemData[]> => {
    // Check cache first
    if (linkedPackingListData[linkedKey]) {
      return linkedPackingListData[linkedKey];
    }

    try {
      const [packingActivity, listType] = linkedKey.split(':');
      const { data, error } = await supabase
        .from('packing_lists')
        .select('items')
        .eq('activity', packingActivity)
        .eq('list_type', listType)
        .single();

      if (error || !data?.items) {
        return [];
      }

      const items: PackingItemData[] = Array.isArray(data.items)
        ? data.items.map((item: { text?: string; name?: string; imageUrl?: string }) => ({
            text: item.text || item.name || '',
            imageUrl: item.imageUrl
          }))
        : [];

      // Cache the result
      setLinkedPackingListData(prev => ({ ...prev, [linkedKey]: items }));
      return items;
    } catch (err) {
      console.error('Error fetching linked packing list:', err);
      return [];
    }
  };

  // Fetch packing list from Supabase and format as text
  const syncPackingList = async (listType: string) => {
    try {
      const { data, error } = await supabase
        .from('packing_lists')
        .select('items')
        .eq('activity', activity)
        .eq('list_type', listType)
        .single();

      if (error || !data?.items) {
        alert(`Ingen pakkeliste fundet for ${activity} - ${listType}`);
        return;
      }

      // Format items as text content
      const items = data.items as Array<{
        id: string;
        text: string;
        subtext?: string;
        indent?: boolean;
        isDivider?: boolean;
      }>;

      let formattedContent = '';
      items.forEach(item => {
        if (item.isDivider) {
          formattedContent += `\n${item.text}:\n`;
        } else if (item.indent) {
          formattedContent += `  • ${item.text}${item.subtext ? ` (${item.subtext})` : ''}\n`;
        } else {
          formattedContent += `• ${item.text}${item.subtext ? ` (${item.subtext})` : ''}\n`;
        }
      });

      // Update edit content with synced packing list
      setEditContent(formattedContent.trim());
    } catch (err) {
      console.error('Error syncing packing list:', err);
      alert('Fejl ved sync af pakkeliste');
    }
  };

  // Check if packing lists exist for this activity
  const [availablePackingLists, setAvailablePackingLists] = useState<string[]>([]);

  useEffect(() => {
    const checkPackingLists = async () => {
      try {
        const { data } = await supabase
          .from('packing_lists')
          .select('list_type')
          .eq('activity', activity);

        if (data) {
          setAvailablePackingLists(data.map(d => d.list_type));
        }
      } catch (err) {
        console.error('Error checking packing lists:', err);
      }
    };
    checkPackingLists();
  }, [activity]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionKey(sectionKey);
    try {
      const result = await uploadGuideImage(file, activity, sectionKey);

      if (result.success && result.url) {
        const section = sections.find(s => s.section_key === sectionKey);
        if (section) {
          const updatedSection: GuideSection = {
            id: section.id,
            activity: section.activity || activity,
            section_key: section.section_key,
            title: section.title,
            content: section.content,
            image_url: result.url,
            order_index: section.order_index || 0,
            category: section.category
          };
          console.log('Saving image for section:', updatedSection);
          const saveResult = await saveGuideSection(updatedSection);
          console.log('Image save result:', saveResult);
          if (saveResult.success) {
            const now = new Date().toISOString();
            setSections(prev => prev.map(s =>
              s.section_key === sectionKey
                ? { ...s, image_url: result.url, id: saveResult.id || s.id, updated_at: now }
                : s
            ));
          } else {
            alert('Kunne ikke gemme billede: ' + (saveResult.error || 'Ukendt fejl'));
          }
        }
      } else {
        alert('Kunne ikke uploade billede: ' + (result.error || 'Ukendt fejl'));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Fejl ved upload af billede');
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
    const newCurrentOrder = swapSection.order_index;
    const newSwapOrder = currentSection.order_index;

    try {
      // Save both sections with swapped order
      const currentToSave: GuideSection = {
        id: currentSection.id,
        activity: currentSection.activity || activity,
        section_key: currentSection.section_key,
        title: currentSection.title,
        content: currentSection.content,
        image_url: currentSection.image_url,
        order_index: newCurrentOrder,
        category: currentSection.category
      };
      const swapToSave: GuideSection = {
        id: swapSection.id,
        activity: swapSection.activity || activity,
        section_key: swapSection.section_key,
        title: swapSection.title,
        content: swapSection.content,
        image_url: swapSection.image_url,
        order_index: newSwapOrder,
        category: swapSection.category
      };

      console.log('Moving sections:', { currentToSave, swapToSave });
      const result1 = await saveGuideSection(currentToSave);
      const result2 = await saveGuideSection(swapToSave);
      console.log('Move results:', { result1, result2 });

      if (result1.success && result2.success) {
        setSections(prev => {
          const updated = prev.map(s => {
            if (s.section_key === currentSection.section_key) return { ...s, order_index: newCurrentOrder, id: result1.id || s.id };
            if (s.section_key === swapSection.section_key) return { ...s, order_index: newSwapOrder, id: result2.id || s.id };
            return s;
          });
          return updated.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        });
      }
    } catch (err) {
      console.error('Error moving section:', err);
    }
  };

  const handleDeleteSection = async (section: SectionWithMeta) => {
    if (!confirm('Er du sikker på at du vil slette denne sektion?')) return;

    // Mark section as deleted so it doesn't come back from defaults
    markSectionDeleted(activity, section.section_key);

    // If section has an id in database, delete from database
    if (section.id) {
      const result = await deleteGuideSection(section.id);
      if (result.success) {
        setSections(prev => prev.filter(s => s.section_key !== section.section_key));
      } else {
        alert('Kunne ikke slette: ' + (result.error || 'Ukendt fejl'));
      }
    } else {
      // Section only exists locally (default section never saved), just remove from state
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
        video_url: newSectionVideoUrl || undefined,
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
          video_url: newSectionVideoUrl || undefined,
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
        setNewSectionVideoUrl('');
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
  const sectionsByCategory: Record<CategoryKey, SectionWithMeta[]> = {
    before: sections.filter(s => s.category === 'before'),
    during: sections.filter(s => s.category === 'during'),
    after: sections.filter(s => s.category === 'after'),
    summary: sections.filter(s => s.category === 'summary')
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
        <div
          onClick={() => handleToggleSection(section.section_key)}
          className="w-full flex items-center justify-between p-4 tablet:p-5 text-left cursor-pointer hover:bg-white/5 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleToggleSection(section.section_key)}
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
                  title="Flyt op"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'down'); }}
                  disabled={index === totalInCategory - 1}
                  className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Flyt ned"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartEdit(section); }}
                  className="p-1 text-gray-500 hover:text-battle-orange transition-colors"
                  title="Rediger afsnit"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${colorClasses.icon}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${colorClasses.icon}`} />
            )}
          </div>
        </div>

        {/* Section Content */}
        {isExpanded && (
          <div className="px-4 tablet:px-5 pb-4 tablet:pb-5 border-t border-white/10">
            <div className="pt-4 flex flex-col tablet:flex-row gap-4">
              {/* Image/Video Section - only show if image/video exists or in edit mode */}
              {(section.image_url || section.video_url || isEditing) && (
              <div className="tablet:w-1/2 space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => uploadingSectionKey && handleImageUpload(e, uploadingSectionKey)}
                  accept="image/*"
                  className="hidden"
                />
                {section.image_url ? (
                  <div className="space-y-2">
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
                    {/* Remove image button - only in edit mode */}
                    {isEditing && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Fjern billede fra dette afsnit?')) {
                            try {
                              await saveGuideSection({
                                ...section,
                                image_url: undefined
                              });
                              setSections(prev => prev.map(s =>
                                s.section_key === section.section_key
                                  ? { ...s, image_url: undefined }
                                  : s
                              ));
                            } catch (err) {
                              console.error('Failed to remove image:', err);
                            }
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Fjern billede
                      </button>
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
                {/* Google Photos Link - only in edit mode */}
                {isEditing && (
                  <a
                    href="https://photos.google.com/?pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Importer fra Google Photos
                  </a>
                )}

                {/* YouTube Video Control - only in edit mode */}
                {isEditing && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <label className="block text-xs text-red-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        YouTube Video
                      </span>
                    </label>
                    {section.video_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-battle-black/30 rounded-lg px-3 py-2">
                          <span className="text-xs text-green-400 truncate flex-1 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            Video tilføjet
                          </span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Fjern video fra dette afsnit?')) {
                                try {
                                  await saveGuideSection({
                                    ...section,
                                    video_url: undefined
                                  });
                                  setSections(prev => prev.map(s =>
                                    s.section_key === section.section_key
                                      ? { ...s, video_url: undefined }
                                      : s
                                  ));
                                  setEditVideoUrl('');
                                } catch (err) {
                                  console.error('Failed to remove video:', err);
                                }
                              }
                            }}
                            className="ml-2 px-2 py-1 text-red-400 hover:bg-red-500/20 rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Fjern
                          </button>
                        </div>
                      </div>
                    ) : (
                      <VideoUrlInput
                        section={section}
                        onSave={async (url) => {
                          try {
                            const sectionToSave = {
                              id: section.id,
                              activity: section.activity,
                              section_key: section.section_key,
                              title: section.title,
                              content: section.content,
                              image_url: section.image_url,
                              video_url: url,
                              icon_key: section.iconKey,
                              linked_packing_list: section.linked_packing_list,
                              order_index: section.order_index,
                              category: section.category
                            };
                            console.log('Saving video to section:', sectionToSave);
                            const result = await saveGuideSection(sectionToSave);
                            console.log('Video save result:', result);
                            if (result.success) {
                              setSections(prev => prev.map(s =>
                                s.section_key === section.section_key
                                  ? { ...s, video_url: url }
                                  : s
                              ));
                            } else {
                              alert('Kunne ikke gemme video: ' + result.error);
                            }
                          } catch (err) {
                            console.error('Failed to save video:', err);
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Linked Packing List Selector - below image in edit mode */}
                {isEditing && availablePackingLists.length > 0 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <label className="block text-xs text-purple-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Link Pakkeliste
                      </span>
                    </label>
                    <select
                      value={editLinkedPackingList}
                      onChange={(e) => setEditLinkedPackingList(e.target.value)}
                      className="w-full bg-battle-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Ingen pakkeliste</option>
                      {availablePackingLists.map(listType => (
                        <option key={listType} value={`${activity}:${listType}`}>
                          {listType === 'afgang' ? 'Afgang' :
                           listType === 'hjemkomst' ? 'Hjemkomst' :
                           listType === 'before' ? 'Før' :
                           listType === 'after' ? 'Efter' :
                           listType === 'nulstil' ? 'Nulstil' :
                           listType === 'taske' ? 'Taske' : listType}
                        </option>
                      ))}
                    </select>
                    {editLinkedPackingList && (
                      <p className="mt-2 text-[10px] text-purple-400">
                        Vises som tjekliste i afsnittet
                      </p>
                    )}
                  </div>
                )}

                {/* Embedded YouTube Video - shown under image when not editing */}
                {!isEditing && section.video_url && getYouTubeVideoId(section.video_url) && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Video</span>
                    </div>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-battle-black border border-white/10">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(section.video_url)}?rel=0`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}

              </div>
              )}

              {/* Content Section - full width if no image/video */}
              <div className={section.image_url || section.video_url || isEditing ? "tablet:w-1/2" : "w-full"}>
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

                    {/* Icon and Category Row */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Icon Selection */}
                      <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                          Ikon
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                          {ICON_OPTIONS.map((opt) => {
                            const IconOpt = opt.icon;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setEditIcon(opt.key)}
                                className={`p-2 rounded-lg border transition-colors ${
                                  editIcon === opt.key
                                    ? 'border-battle-orange bg-battle-orange/20'
                                    : 'border-white/10 hover:bg-white/5'
                                }`}
                                title={opt.label}
                              >
                                <IconOpt className={`w-4 h-4 mx-auto ${editIcon === opt.key ? 'text-battle-orange' : 'text-gray-400'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                          Sektion
                        </label>
                        <div className="flex flex-col gap-1">
                          {(Object.keys(CATEGORIES) as CategoryKey[]).map((catKey) => {
                            const cat = CATEGORIES[catKey];
                            const catColors = COLORS[cat.color];
                            return (
                              <button
                                key={catKey}
                                type="button"
                                onClick={() => setEditCategory(catKey)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-left ${
                                  editCategory === catKey
                                    ? `${catColors.border} ${catColors.bg}`
                                    : 'border-white/10 hover:bg-white/5'
                                }`}
                              >
                                <cat.icon className={`w-4 h-4 ${editCategory === catKey ? catColors.icon : 'text-gray-500'}`} />
                                <span className={`text-xs uppercase tracking-wider ${editCategory === catKey ? catColors.text : 'text-gray-400'}`}>
                                  {cat.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Indhold
                      </label>
                      <FormattingToolbar
                        value={editContent}
                        onChange={setEditContent}
                        textareaRef={editTextareaRef}
                      />
                      <textarea
                        ref={editTextareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-64 bg-battle-black/50 border border-white/20 rounded-lg p-4 text-white text-sm leading-relaxed resize-none focus:outline-none focus:border-battle-orange font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between">
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
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 text-sm uppercase tracking-wider hover:bg-gray-500/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          ANNULLER
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteSection(section)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        SLET
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Text Content */}
                    {(() => {
                      const { text } = parseChecklist(section.content);
                      return (
                        <div className="text-sm tablet:text-base text-gray-300 leading-relaxed">
                          {parseFormattedText(text)}
                        </div>
                      );
                    })()}

                    {/* Linked Packing List Button */}
                    {section.linked_packing_list && onNavigate && (() => {
                      const [packingActivity, listType] = section.linked_packing_list!.split(':');
                      const buttonText = listType === 'afgang' ? 'PAKKELISTE AFGANG' :
                                         listType === 'hjemkomst' ? 'PAKKELISTE HJEMKOMST' :
                                         listType === 'before' ? 'PAKKELISTE FØR' :
                                         listType === 'after' ? 'PAKKELISTE EFTER' :
                                         listType === 'nulstil' ? 'NULSTIL BOX' :
                                         listType === 'taske' ? 'PAKKELISTE TASKE' : `PAKKELISTE ${listType.toUpperCase()}`;
                      return (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              const view = `${packingActivity}_packing_${listType}`;
                              onNavigate(view);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                          >
                            <ClipboardList className="w-4 h-4" />
                            {buttonText}
                          </button>
                        </div>
                      );
                    })()}

                    {/* Action buttons for links */}
                    {section.link && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {section.isInternal && onNavigate ? (
                          <button
                            onClick={() => {
                              const view = section.link?.replace('#', '') || '';
                              onNavigate(view);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                          >
                            {section.linkText || 'ÅBEN'}
                          </button>
                        ) : (
                          <a
                            href={section.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                          >
                            {section.linkText || 'ÅBEN LINK'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Count new sections per category
  const getNewCount = (categoryKey: CategoryKey): number => {
    return sectionsByCategory[categoryKey].filter(s => isSectionNew(s, viewedSections)).length;
  };

  // Render category card for main grid
  const renderCategoryCard = (categoryKey: CategoryKey) => {
    const category = CATEGORIES[categoryKey];
    const categorySections = sectionsByCategory[categoryKey];
    const CategoryIcon = category.icon;
    const colorClasses = COLORS[category.color];
    const newCount = getNewCount(categoryKey);

    return (
      <button
        key={categoryKey}
        onClick={() => setSelectedCategory(categoryKey)}
        className={`relative flex flex-col items-center justify-center p-6 tablet:p-8 desktop:p-10 ${colorClasses.bg} border-2 ${colorClasses.border} rounded-2xl tablet:rounded-3xl hover:scale-[1.02] hover:shadow-lg hover:shadow-${category.color}-500/20 transition-all duration-200 touch-manipulation min-h-[140px] tablet:min-h-[180px] desktop:min-h-[220px]`}
      >
        {/* New badge */}
        {newCount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-battle-orange text-white text-xs font-bold rounded-full">
            {newCount} NY
          </span>
        )}

        <CategoryIcon className={`w-10 h-10 tablet:w-14 tablet:h-14 desktop:w-16 desktop:h-16 ${colorClasses.icon} mb-3`} />
        <h2 className={`text-base tablet:text-xl desktop:text-2xl font-bold ${colorClasses.text} uppercase tracking-wider text-center`}>
          {category.shortTitle}
        </h2>
        <span className={`text-xs tablet:text-sm ${colorClasses.text} opacity-60 mt-1`}>
          {categorySections.length} afsnit
        </span>
      </button>
    );
  };

  // Render sections in category modal
  const renderCategoryModal = () => {
    if (!selectedCategory) return null;

    const category = CATEGORIES[selectedCategory];
    const categorySections = sectionsByCategory[selectedCategory];
    const CategoryIcon = category.icon;
    const colorClasses = COLORS[category.color];

    return (
      <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-50 overflow-y-auto">
        <div className="w-full max-w-4xl mx-4 my-4 tablet:my-8">
          {/* Modal Header */}
          <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 p-4 tablet:p-5 ${colorClasses.bg} backdrop-blur-xl rounded-t-2xl border ${colorClasses.border} border-b-0`}>
            <div className="flex items-center gap-3">
              <CategoryIcon className={`w-7 h-7 tablet:w-8 tablet:h-8 ${colorClasses.icon}`} />
              <h2 className={`text-xl tablet:text-2xl font-bold ${colorClasses.text} uppercase tracking-wider`}>
                {category.title}
              </h2>
              <span className={`text-sm ${colorClasses.text} opacity-60`}>
                ({categorySections.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    setNewSectionCategory(selectedCategory);
                    setShowNewSectionModal(true);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs uppercase tracking-wider hover:bg-white/10 transition-colors`}
                >
                  <Plus className="w-4 h-4" />
                  NY
                </button>
              )}
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className={`w-6 h-6 ${colorClasses.icon}`} />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className={`bg-battle-grey/95 backdrop-blur-xl rounded-b-2xl border ${colorClasses.border} border-t-0 p-4 tablet:p-5`}>
            <div className="grid grid-cols-1 gap-3">
              {categorySections.map((section, index) => renderSection(section, category.color, index, categorySections.length))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ActivityIcon = activityConfig.icon;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 tablet:px-4 space-y-6">
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

      {/* Category Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 tablet:gap-4 desktop:gap-6">
        {renderCategoryCard('before')}
        {renderCategoryCard('during')}
        {renderCategoryCard('after')}
        {renderCategoryCard('summary')}
      </div>

      {/* Category Modal */}
      {renderCategoryModal()}

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

              {/* YouTube Video URL */}
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    YouTube Video (valgfrit)
                  </span>
                </label>
                <input
                  type="text"
                  value={newSectionVideoUrl}
                  onChange={(e) => setNewSectionVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-battle-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-battle-orange"
                />
                {newSectionVideoUrl && getYouTubeVideoId(newSectionVideoUrl) && (
                  <div className="mt-2 text-xs text-green-400">
                    Video ID: {getYouTubeVideoId(newSectionVideoUrl)}
                  </div>
                )}
                {newSectionVideoUrl && !getYouTubeVideoId(newSectionVideoUrl) && (
                  <div className="mt-2 text-xs text-red-400">
                    Ugyldig YouTube URL
                  </div>
                )}
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
