import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, ArrowLeft, X, PlayCircle, PauseCircle, SkipForward, SkipBack, Star, Edit3, Bold, Italic, List, ChevronDown, Save, Home, Sun, Users, Award, ToggleLeft, ToggleRight } from 'lucide-react';

interface BoxVideo {
  boxNumber: number | string;
  title: string;
  id: string;
  length: string;
  isBonus?: boolean;
}

// Parse and sort the box videos by box number
const BOX_VIDEOS: BoxVideo[] = [
  { boxNumber: 1, title: 'CIRCUS', id: '1qPOQFu4tIY', length: '0:13' },
  { boxNumber: 2, title: 'ETCH A SKETCH', id: 'zIwSL7rBmQQ', length: '0:40' },
  { boxNumber: 3, title: 'RUBIC', id: '8VtWOJvQ7BM', length: '0:18' },
  { boxNumber: 4, title: 'PLAY THAT FUNKY MUSIC', id: 'J68mDdG9SRs', length: '0:37' },
  { boxNumber: 5, title: 'LOGIK!', id: 'KpbT8D45L94', length: '0:18' },
  { boxNumber: 6, title: 'KLODSHANS', id: '2Sg5MKun1wM', length: '0:36' },
  { boxNumber: 7, title: 'MÅLBART', id: 'mZ0j6aboVlA', length: '0:16' },
  { boxNumber: 8, title: 'ÆG-STRA', id: 'hkoGkR4JacQ', length: '0:41' },
  { boxNumber: 9, title: 'JORDEN RUNDT', id: 'f6kLgX_ptOI', length: '0:23' },
  { boxNumber: 10, title: 'BANDCAMP', id: 'aEMwF6tHcD8', length: '0:51' },
  { boxNumber: 11, title: 'HELT ROLIGT', id: 'PT9LMSr32Jo', length: '0:34' },
  { boxNumber: 12, title: 'PINFIGHT', id: '0FdjbpkFn_Y', length: '1:03' },
  { boxNumber: 13, title: 'TEQUILA!', id: 'Wjd5BD3OnZU', length: '0:21' },
  { boxNumber: 14, title: 'I BALANCE', id: '1NUu-azTbjs', length: '0:59' },
  { boxNumber: 15, title: 'THE T TASK', id: 'FyaO_lVVRC4', length: '0:24' },
  { boxNumber: 16, title: '4350', id: 'y2SuwxShXeI', length: '1:02' },
  { boxNumber: 17, title: 'SMÅ NUMRE', id: '686elFeg1m4', length: '0:32' },
  { boxNumber: 18, title: 'PRÆCIS!', id: 'yFhhhUMHYaA', length: '0:36' },
  { boxNumber: 19, title: 'MÅL!', id: '-phNmL-52ho', length: '0:35' },
  { boxNumber: 20, title: 'OPPUSTET', id: 'l4NEZb6jAwQ', length: '0:23' },
  { boxNumber: 21, title: 'RAPPE FINGRE', id: 'vwWCUYdhbQ0', length: '0:38' },
  { boxNumber: 22, title: 'BROEN', id: '7JF4hROShfE', length: '0:28' },
  { boxNumber: 23, title: 'KNUDEN', id: '0sppIvVui-w', length: '0:25' },
  { boxNumber: 24, title: 'HOLEY MOLEY!', id: '326MmwpH_N0', length: '0:32' },
  { boxNumber: 25, title: 'SLINGSHOT', id: 'UNktC_knd7Q', length: '0:37' },
  { boxNumber: 26, title: 'SNAKE', id: 'd-YR5w4C-9A', length: '0:23' },
  { boxNumber: 27, title: 'SIMON', id: 'LT0ExdbBnuE', length: '1:04' },
  { boxNumber: 28, title: 'SPICE GIRLS', id: '30ISFLhciSQ', length: '0:32' },
  { boxNumber: 29, title: 'BOX 29', id: '', length: '' },
  { boxNumber: 30, title: 'VAR DER ANDET?', id: 'HMfvBD06nt8', length: '0:19' },
  { boxNumber: 31, title: 'TOP100', id: 'jkO60ivQsPs', length: '0:32' },
  { boxNumber: 'BONUS', title: 'BONUSPANEL', id: 'IGrF6MuzLN4', length: '0:45', isBonus: true },
];

const STORAGE_KEY = 'teamchallenge_box_descriptions';
const METADATA_STORAGE_KEY = 'teamchallenge_box_metadata';

interface BoxMetadata {
  indoor: boolean;    // Egnet til inde
  outdoor: boolean;   // Egnet til ude
  funbuilding: boolean;
  instructorScore: boolean;  // Instruktør score
}

const DEFAULT_METADATA: BoxMetadata = {
  indoor: true,
  outdoor: true,
  funbuilding: true,
  instructorScore: true,
};

interface TeamChallengeBoxVideosProps {
  onBack?: () => void;
}

// Helper to get YouTube thumbnail
const getThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

const TeamChallengeBoxVideos: React.FC<TeamChallengeBoxVideosProps> = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState<BoxVideo | null>(null);
  const [playAllMode, setPlayAllMode] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredBox, setHoveredBox] = useState<BoxVideo | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [showEditor, setShowEditor] = useState(false);
  const [editorBoxNumber, setEditorBoxNumber] = useState<number | string>(1);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<Record<string, BoxMetadata>>({});
  const [editorContent, setEditorContent] = useState('');
  const [editorMetadata, setEditorMetadata] = useState<BoxMetadata>(DEFAULT_METADATA);
  const [showDropdown, setShowDropdown] = useState(false);
  const [infoBox, setInfoBox] = useState<BoxVideo | null>(null);
  const [activeFilters, setActiveFilters] = useState<(keyof BoxMetadata)[]>([]);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Toggle filter on/off
  const toggleFilter = useCallback((filter: keyof BoxMetadata) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  // Filter boxes based on active filters (show boxes that match ANY active filter)
  const filteredBoxes = React.useMemo(() => {
    if (activeFilters.length === 0) return BOX_VIDEOS;
    return BOX_VIDEOS.filter(video => {
      if (!video.id) return false; // Don't show boxes without videos
      const meta = metadata[String(video.boxNumber)] || DEFAULT_METADATA;
      // Show box if it matches ANY of the active filters
      return activeFilters.some(filter => meta[filter]);
    });
  }, [activeFilters, metadata]);
  const touchStartTime = useRef<number>(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const videosWithContent = BOX_VIDEOS.filter(v => v.id !== '');

  // Load descriptions and metadata from localStorage
  useEffect(() => {
    const savedDesc = localStorage.getItem(STORAGE_KEY);
    if (savedDesc) {
      try {
        setDescriptions(JSON.parse(savedDesc));
      } catch (e) {
        console.error('Failed to parse saved descriptions');
      }
    }
    const savedMeta = localStorage.getItem(METADATA_STORAGE_KEY);
    if (savedMeta) {
      try {
        setMetadata(JSON.parse(savedMeta));
      } catch (e) {
        console.error('Failed to parse saved metadata');
      }
    }
  }, []);

  // Save descriptions to localStorage
  const saveDescriptions = useCallback((newDescriptions: Record<string, string>) => {
    setDescriptions(newDescriptions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDescriptions));
  }, []);

  // Save metadata to localStorage
  const saveMetadata = useCallback((newMetadata: Record<string, BoxMetadata>) => {
    setMetadata(newMetadata);
    localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(newMetadata));
  }, []);

  // Get metadata for a box (with defaults)
  const getBoxMetadata = useCallback((boxNumber: number | string): BoxMetadata => {
    return metadata[String(boxNumber)] || DEFAULT_METADATA;
  }, [metadata]);

  const handleVideoClick = (video: BoxVideo) => {
    setSelectedVideo(video);
    setPlayAllMode(false);
  };

  const handlePlayAll = () => {
    setPlayAllMode(true);
    setCurrentPlayIndex(0);
    setSelectedVideo(videosWithContent[0]);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentPlayIndex < videosWithContent.length - 1) {
      const nextIndex = currentPlayIndex + 1;
      setCurrentPlayIndex(nextIndex);
      setSelectedVideo(videosWithContent[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentPlayIndex > 0) {
      const prevIndex = currentPlayIndex - 1;
      setCurrentPlayIndex(prevIndex);
      setSelectedVideo(videosWithContent[prevIndex]);
    }
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setPlayAllMode(false);
    setIsPlaying(false);
  };

  const handleVideoEnd = () => {
    if (playAllMode && currentPlayIndex < videosWithContent.length - 1) {
      handleNext();
    } else if (playAllMode) {
      setIsPlaying(false);
    }
  };

  // Touch handlers for short/long press
  const handleTouchStart = (video: BoxVideo, e: React.TouchEvent) => {
    if (!video.id) return;
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      // Long press - open video
      handleVideoClick(video);
    }, 500);
  };

  const handleTouchEnd = (video: BoxVideo, e: React.TouchEvent) => {
    if (!video.id) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    const touchDuration = Date.now() - touchStartTime.current;
    if (touchDuration < 500) {
      // Short tap - show info
      e.preventDefault();
      setInfoBox(video);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Mouse hover handlers
  const handleMouseEnter = (video: BoxVideo, e: React.MouseEvent) => {
    if (!video.id) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredBox(video);
  };

  const handleMouseLeave = () => {
    setHoveredBox(null);
  };

  // Editor handlers
  const openEditor = () => {
    setShowEditor(true);
    const content = descriptions[String(editorBoxNumber)] || '';
    setEditorContent(content);
    setEditorMetadata(getBoxMetadata(editorBoxNumber));
  };

  const handleEditorBoxChange = (boxNum: number | string) => {
    setEditorBoxNumber(boxNum);
    setEditorContent(descriptions[String(boxNum)] || '');
    setEditorMetadata(getBoxMetadata(boxNum));
    setShowDropdown(false);
  };

  const saveEditorContent = () => {
    const newDescriptions = { ...descriptions, [String(editorBoxNumber)]: editorContent };
    saveDescriptions(newDescriptions);
    const newMetadata = { ...metadata, [String(editorBoxNumber)]: editorMetadata };
    saveMetadata(newMetadata);
  };

  const toggleMetadata = (key: keyof BoxMetadata) => {
    setEditorMetadata(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyFormat = (format: 'bold' | 'italic' | 'list') => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(formattedText));

    // Update state
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerText);
    }
  };

  // Render formatted description
  const renderDescription = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const currentEditorBox = BOX_VIDEOS.find(v => v.boxNumber === editorBoxNumber);

  // Render metadata tags
  const renderMetadataTags = (boxNumber: number | string, compact: boolean = false) => {
    const meta = getBoxMetadata(boxNumber);
    const tags = [
      { key: 'indoor', icon: Home, label: 'Inde', active: meta.indoor, color: 'cyan' },
      { key: 'outdoor', icon: Sun, label: 'Ude', active: meta.outdoor, color: 'yellow' },
      { key: 'funbuilding', icon: Users, label: 'Funbuilding', active: meta.funbuilding, color: 'green' },
      { key: 'instructorScore', icon: Award, label: 'Instruktør', active: meta.instructorScore, color: 'purple' },
    ];

    const colorClasses: Record<string, { active: string; inactive: string }> = {
      cyan: { active: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50', inactive: 'bg-gray-700/50 text-gray-500 border-gray-600' },
      yellow: { active: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50', inactive: 'bg-gray-700/50 text-gray-500 border-gray-600' },
      green: { active: 'bg-green-400/20 text-green-400 border-green-400/50', inactive: 'bg-gray-700/50 text-gray-500 border-gray-600' },
      purple: { active: 'bg-purple-400/20 text-purple-400 border-purple-400/50', inactive: 'bg-gray-700/50 text-gray-500 border-gray-600' },
    };

    if (compact) {
      return (
        <div className="flex gap-1 flex-wrap">
          {tags.map(tag => {
            const Icon = tag.icon;
            const colors = colorClasses[tag.color];
            return (
              <div
                key={tag.key}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${tag.active ? colors.active : colors.inactive}`}
                title={tag.label}
              >
                <Icon className="w-3 h-3" />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => {
          const Icon = tag.icon;
          const colors = colorClasses[tag.color];
          return (
            <div
              key={tag.key}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${tag.active ? colors.active : colors.inactive}`}
            >
              <Icon className="w-3 h-3" />
              <span>{tag.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen bg-battle-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 tablet-landscape:pt-2 tablet-landscape:pb-1">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Play className="w-6 h-6 text-battle-orange" />
            <h1 className="text-lg tablet-landscape:text-xl font-bold text-white uppercase tracking-wider">
              TeamChallenge Bokse
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={openEditor}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              title="Rediger beskrivelser"
            >
              <Edit3 className="w-5 h-5" />
              <span className="hidden tablet-portrait:inline">Rediger</span>
            </button>
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-battle-orange hover:bg-battle-orangeLight text-white rounded-lg font-medium transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              <span className="hidden mobile-landscape:inline">Afspil Alle</span>
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 text-sm mr-2">Filter:</span>
          <button
            onClick={() => toggleFilter('indoor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
              activeFilters.includes('indoor')
                ? 'bg-cyan-400/30 border-cyan-400 text-cyan-400'
                : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inde</span>
          </button>
          <button
            onClick={() => toggleFilter('outdoor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
              activeFilters.includes('outdoor')
                ? 'bg-yellow-400/30 border-yellow-400 text-yellow-400'
                : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Ude</span>
          </button>
          <button
            onClick={() => toggleFilter('funbuilding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
              activeFilters.includes('funbuilding')
                ? 'bg-green-400/30 border-green-400 text-green-400'
                : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Funbuilding</span>
          </button>
          <button
            onClick={() => toggleFilter('instructorScore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
              activeFilters.includes('instructorScore')
                ? 'bg-purple-400/30 border-purple-400 text-purple-400'
                : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Instruktør</span>
          </button>
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Nulstil</span>
            </button>
          )}
          {activeFilters.length > 0 && (
            <span className="text-gray-500 text-sm ml-2">
              ({filteredBoxes.length} bokse)
            </span>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-4 mobile-landscape:grid-cols-6 tablet-portrait:grid-cols-6 tablet-landscape:grid-cols-8 desktop:grid-cols-10 gap-2 tablet-landscape:gap-3">
          {filteredBoxes.map((video) => (
            <button
              key={String(video.boxNumber)}
              onClick={() => video.id && handleVideoClick(video)}
              onTouchStart={(e) => handleTouchStart(video, e)}
              onTouchEnd={(e) => handleTouchEnd(video, e)}
              onTouchMove={handleTouchMove}
              onMouseEnter={(e) => handleMouseEnter(video, e)}
              onMouseLeave={handleMouseLeave}
              disabled={!video.id}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all relative touch-manipulation
                ${video.id
                  ? video.isBonus
                    ? 'bg-battle-orange/20 border-2 border-battle-orange hover:bg-battle-orange/30 hover:border-battle-orangeLight hover:scale-105 cursor-pointer'
                    : 'bg-battle-black border-2 border-battle-orange/50 hover:bg-battle-orange/10 hover:border-battle-orange hover:scale-105 cursor-pointer'
                  : 'bg-gray-900 border-2 border-gray-700/50 opacity-50 cursor-not-allowed'}
              `}
            >
              {video.isBonus ? (
                <Star className="w-6 h-6 tablet-landscape:w-8 tablet-landscape:h-8 text-battle-orange" />
              ) : (
                <span className="text-2xl tablet-landscape:text-3xl font-bold text-white">
                  {video.boxNumber}
                </span>
              )}
              <span className="text-[10px] tablet-landscape:text-xs text-gray-300 text-center px-1 line-clamp-2">
                {video.title}
              </span>
              {video.length && (
                <span className="text-[9px] tablet-landscape:text-[10px] text-battle-orange">
                  {video.length}
                </span>
              )}
              {/* Toggle indicator dots */}
              {video.id && (
                <div className="flex gap-1 mt-0.5">
                  {(() => {
                    const meta = getBoxMetadata(video.boxNumber);
                    return (
                      <>
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.indoor ? 'bg-cyan-400' : 'bg-gray-600'}`} title="Inde" />
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.outdoor ? 'bg-yellow-400' : 'bg-gray-600'}`} title="Ude" />
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.funbuilding ? 'bg-green-400' : 'bg-gray-600'}`} title="Funbuilding" />
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.instructorScore ? 'bg-purple-400' : 'bg-gray-600'}`} title="Instruktør" />
                      </>
                    );
                  })()}
                </div>
              )}
              {/* Description indicator */}
              {descriptions[String(video.boxNumber)] && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-battle-orange rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredBox && (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: Math.min(hoverPosition.x, window.innerWidth - 220),
            top: Math.max(hoverPosition.y - 180, 10),
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-gray-900 border border-battle-orange/50 rounded-lg p-2 shadow-xl w-52">
            {hoveredBox.id && (
              <img
                src={getThumbnail(hoveredBox.id)}
                alt={hoveredBox.title}
                className="w-full aspect-video object-cover rounded mb-2"
              />
            )}
            <p className="text-white font-medium text-sm">
              {hoveredBox.isBonus ? hoveredBox.title : `Box ${hoveredBox.boxNumber}`}
            </p>
            <p className="text-battle-orange text-xs">{hoveredBox.title}</p>
            {hoveredBox.length && (
              <p className="text-gray-400 text-xs">Varighed: {hoveredBox.length}</p>
            )}
            {/* Metadata tags */}
            <div className="mt-2">
              {renderMetadataTags(hoveredBox.boxNumber, true)}
            </div>
            {descriptions[String(hoveredBox.boxNumber)] && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {renderDescription(descriptions[String(hoveredBox.boxNumber)])}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box Modal (short tap on tablet) */}
      {infoBox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setInfoBox(null)}
        >
          <div
            className="bg-gray-900 border-2 border-battle-orange rounded-xl p-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {infoBox.id && (
              <img
                src={getThumbnail(infoBox.id)}
                alt={infoBox.title}
                className="w-full aspect-video object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-white mb-1">
              {infoBox.isBonus ? infoBox.title : `Box ${infoBox.boxNumber}`}
            </h3>
            <p className="text-battle-orange text-lg mb-2">{infoBox.title}</p>
            {infoBox.length && (
              <p className="text-gray-400 mb-3">Varighed: {infoBox.length}</p>
            )}
            {/* Metadata tags */}
            <div className="mb-4">
              {renderMetadataTags(infoBox.boxNumber)}
            </div>
            {descriptions[String(infoBox.boxNumber)] && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                {renderDescription(descriptions[String(infoBox.boxNumber)])}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleVideoClick(infoBox);
                  setInfoBox(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-battle-orange hover:bg-battle-orangeLight text-white rounded-lg font-medium transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                Afspil Video
              </button>
              <button
                onClick={() => setInfoBox(null)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 text-white hover:text-battle-orange transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Video Title */}
            <div className="mb-4 text-center">
              <h2 className="text-xl tablet-landscape:text-2xl font-bold text-white">
                {selectedVideo.isBonus ? selectedVideo.title : `Box ${selectedVideo.boxNumber} - ${selectedVideo.title}`}
              </h2>
              {playAllMode && (
                <p className="text-battle-orange text-sm mt-1">
                  Video {currentPlayIndex + 1} af {videosWithContent.length}
                </p>
              )}
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-battle-orange/30">
              <iframe
                key={selectedVideo.id}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&enablejsapi=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                onEnded={handleVideoEnd}
              />
            </div>

            {/* Description under video */}
            {descriptions[String(selectedVideo.boxNumber)] && (
              <div className="mt-4 p-3 bg-gray-900/80 rounded-lg border border-battle-orange/20">
                {renderDescription(descriptions[String(selectedVideo.boxNumber)])}
              </div>
            )}

            {/* Play All Controls */}
            {playAllMode && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentPlayIndex === 0}
                  className={`p-3 rounded-full transition-colors ${
                    currentPlayIndex === 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-white hover:bg-battle-orange/20'
                  }`}
                >
                  <SkipBack className="w-8 h-8" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-battle-orange hover:bg-battle-orangeLight rounded-full text-white transition-colors"
                >
                  {isPlaying ? (
                    <PauseCircle className="w-10 h-10" />
                  ) : (
                    <PlayCircle className="w-10 h-10" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentPlayIndex === videosWithContent.length - 1}
                  className={`p-3 rounded-full transition-colors ${
                    currentPlayIndex === videosWithContent.length - 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-white hover:bg-battle-orange/20'
                  }`}
                >
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
            )}

            {/* Video List in Play All Mode */}
            {playAllMode && (
              <div className="mt-4 max-h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2 border border-battle-orange/20">
                <div className="flex flex-wrap gap-2">
                  {videosWithContent.map((video, index) => (
                    <button
                      key={String(video.boxNumber)}
                      onClick={() => {
                        setCurrentPlayIndex(index);
                        setSelectedVideo(video);
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        index === currentPlayIndex
                          ? 'bg-battle-orange text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {video.isBonus ? 'BONUS' : video.boxNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description Editor Modal */}
      {showEditor && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditor(false)}
        >
          <div
            className="bg-gray-900 border-2 border-battle-orange rounded-xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Rediger Box Beskrivelser</h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Box Selector Dropdown */}
            <div className="relative mb-4">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-battle-orange/30 rounded-lg text-white"
              >
                <div className="flex items-center gap-3">
                  {currentEditorBox?.id && (
                    <img
                      src={getThumbnail(currentEditorBox.id)}
                      alt=""
                      className="w-12 h-8 object-cover rounded"
                    />
                  )}
                  <span>
                    {currentEditorBox?.isBonus
                      ? currentEditorBox.title
                      : `Box ${editorBoxNumber} - ${currentEditorBox?.title || ''}`}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-battle-orange/30 rounded-lg max-h-60 overflow-y-auto z-10">
                  {BOX_VIDEOS.filter(v => v.id).map((video) => (
                    <button
                      key={String(video.boxNumber)}
                      onClick={() => handleEditorBoxChange(video.boxNumber)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                        video.boxNumber === editorBoxNumber ? 'bg-battle-orange/20' : ''
                      }`}
                    >
                      <img
                        src={getThumbnail(video.id)}
                        alt=""
                        className="w-10 h-7 object-cover rounded"
                      />
                      <span className="text-white">
                        {video.isBonus ? video.title : `Box ${video.boxNumber} - ${video.title}`}
                      </span>
                      {descriptions[String(video.boxNumber)] && (
                        <div className="ml-auto w-2 h-2 bg-battle-orange rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Preview */}
            {currentEditorBox?.id && (
              <div className="mb-4">
                <img
                  src={getThumbnail(currentEditorBox.id)}
                  alt={currentEditorBox.title}
                  className="w-full max-w-md mx-auto aspect-video object-cover rounded-lg"
                />
              </div>
            )}

            {/* Metadata Toggles */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-battle-orange/20">
              <p className="text-gray-400 text-xs mb-3 uppercase">Egenskaber</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Indoor Toggle */}
                <button
                  onClick={() => toggleMetadata('indoor')}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    editorMetadata.indoor
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span className="text-sm">Egnet til inde</span>
                  </div>
                  {editorMetadata.indoor ? (
                    <ToggleRight className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Outdoor Toggle */}
                <button
                  onClick={() => toggleMetadata('outdoor')}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    editorMetadata.outdoor
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Egnet til ude</span>
                  </div>
                  {editorMetadata.outdoor ? (
                    <ToggleRight className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Funbuilding Toggle */}
                <button
                  onClick={() => toggleMetadata('funbuilding')}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    editorMetadata.funbuilding
                      ? 'bg-green-400/20 border-green-400 text-green-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Funbuilding</span>
                  </div>
                  {editorMetadata.funbuilding ? (
                    <ToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                {/* Instructor Score Toggle */}
                <button
                  onClick={() => toggleMetadata('instructorScore')}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    editorMetadata.instructorScore
                      ? 'bg-purple-400/20 border-purple-400 text-purple-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">Instruktør score</span>
                  </div>
                  {editorMetadata.instructorScore ? (
                    <ToggleRight className="w-5 h-5 text-purple-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => applyFormat('bold')}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Fed tekst"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('italic')}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Kursiv tekst"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormat('list')}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Punktliste"
              >
                <List className="w-4 h-4" />
              </button>
              <span className="text-gray-500 text-sm ml-2">Marker tekst og klik for at formatere</span>
            </div>

            {/* Text Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="w-full min-h-[150px] p-4 bg-gray-800 border border-battle-orange/30 rounded-lg text-white focus:outline-none focus:border-battle-orange"
              onInput={(e) => setEditorContent((e.target as HTMLDivElement).innerText)}
              dangerouslySetInnerHTML={{ __html: editorContent.replace(/\n/g, '<br>') }}
              suppressContentEditableWarning
            />

            {/* Preview */}
            {editorContent && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-xs mb-2 uppercase">Forhåndsvisning:</p>
                {renderDescription(editorContent)}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuller
              </button>
              <button
                onClick={() => {
                  saveEditorContent();
                  setShowEditor(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-battle-orange hover:bg-battle-orangeLight text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-5 h-5" />
                Gem Beskrivelse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChallengeBoxVideos;
