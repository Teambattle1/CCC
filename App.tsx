import React, { useState, useEffect } from 'react';
import {
  HUB_LINKS,
  ACTIVITY_LINKS,
  ECONOMY_LINKS,
  TASK_CONTROL_LINKS,
  TOOLS_LINKS,
  CODE_LINKS,
  OFFICE_LINKS,
  TEAM_CHALLENGE_LINKS,
  LOQUIZ_LINKS,
  TEAMACTION_LINKS,
  TEAMLAZER_LINKS,
  TEAMLAZER_FEJLSOGNING_LINKS,
  TEAMROBIN_LINKS,
  TEAMCONNECT_LINKS,
  TEAMBOX_LINKS,
  TEAMSEGWAY_LINKS,
  TEAMCONTROL_LINKS,
  TEAMCONSTRUCT_LINKS,
  TEAMROBIN_PACKING_LINKS,
  TEAMLAZER_VIDEO_INDEX
} from './constants';
import HubButton from './components/HubButton';
import Clock, { DateDisplay } from './components/Clock';
import CalendarModal from './components/CalendarModal';
import DistanceTool from './components/DistanceTool';
import ClaudeDevModal from './components/ClaudeDevModal';
import LoginScreen from './components/LoginScreen';
import UsersManagement from './components/UsersManagement';
import ClaudeAssistant from './components/ClaudeAssistant';
import PackingList, { TEAMROBIN_PACKING_BEFORE, TEAMROBIN_PACKING_AFTER } from './components/PackingList';
import VideoPlayer from './components/VideoPlayer';
import TeamLazerPackingList from './components/TeamLazerPackingList';
import TeamSegwayPackingList from './components/TeamSegwayPackingList';
import LazerPointScoreboard from './components/LazerPointScoreboard';
import { useAuth } from './contexts/AuthContext';
import {
  ShieldCheck,
  House,
  Calendar,
  Wallet,
  Code,
  ClipboardList,
  Wrench,
  Briefcase,
  Trophy,
  Navigation,
  Swords,
  MapPin,
  Zap,
  Target,
  CircleDot,
  LogOut,
  User,
  Gamepad2,
  Hammer,
  Bot,
  Ruler,
  Package,
  ListChecks
} from 'lucide-react';
import { HubLink } from './types';

type ViewState = 'main' | 'activities' | 'economy' | 'task_control' | 'tools' | 'code' | 'office' | 'team_challenge' | 'loquiz' | 'teamaction' | 'teamlazer' | 'teamrobin' | 'teamconnect' | 'teambox' | 'teamsegway' | 'teamcontrol' | 'teamconstruct' | 'distance_tool' | 'teamrobin_packing' | 'teamrobin_packing_before' | 'teamrobin_packing_after' | 'teamlazer_justering' | 'teamlazer_fejlsogning' | 'teamrobin_video' | 'teamchallenge_video' | 'teamaction_video' | 'teamsegway_video' | 'teamconstruct_video' | 'teamcontrol_video' | 'teambox_video' | 'teamlazer_video' | 'teamlazer_packing' | 'teamsegway_packing' | 'teamlazer_scorecard';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, profile, signOut, logPageVisit } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isClaudeDevOpen, setIsClaudeDevOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isClaudeAssistantOpen, setIsClaudeAssistantOpen] = useState(false);

  // Drag and Drop State - MUST be before any early returns to satisfy React hooks rules
  const [hubLinks, setHubLinks] = useState<HubLink[]>(() => {
    try {
      const saved = localStorage.getItem('hubLinksOrder');
      if (saved) {
        const savedIds = JSON.parse(saved);
        if (Array.isArray(savedIds)) {
          const orderedLinks = savedIds
            .map((id: string) => HUB_LINKS.find(l => l.id === id))
            .filter((l): l is HubLink => !!l);
          const missingLinks = HUB_LINKS.filter(l => !savedIds.includes(l.id));
          return [...orderedLinks, ...missingLinks];
        }
      }
    } catch (error) {
      console.error("Failed to load hub links order", error);
    }
    return HUB_LINKS;
  });

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Log page visits
  useEffect(() => {
    if (isAuthenticated && currentView) {
      logPageVisit(currentView);
    }
  }, [currentView, isAuthenticated]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-battle-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-battle-orange/30 border-t-battle-orange rounded-full animate-spin" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set a custom drag image if needed, or stick to default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Essential to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const newLinks = [...hubLinks];
    const draggedItem = newLinks[draggedItemIndex];
    
    // Remove dragged item
    newLinks.splice(draggedItemIndex, 1);
    // Insert at new position
    newLinks.splice(targetIndex, 0, draggedItem);
    
    setHubLinks(newLinks);
    setDraggedItemIndex(null);
    
    // Save to localStorage
    localStorage.setItem('hubLinksOrder', JSON.stringify(newLinks.map(l => l.id)));
  };

  const changeView = (view: ViewState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
    }, 300);
  };

  const handleLinkClick = (link: HubLink) => {
    if (link.title === 'ACTIVITIES') changeView('activities');
    else if (link.title === 'ECONOMY') changeView('economy');
    else if (link.title === 'ADMIN') changeView('task_control');
    else if (link.title === 'TOOLS') changeView('tools');
    else if (link.title === 'OFFICE') changeView('office');
    else if (link.title === 'TEAMCHALLENGE') changeView('team_challenge');
    else if (link.title === 'LOQUIZ') changeView('loquiz');
    else if (link.title === 'TEAMACTION') changeView('teamaction');
    else if (link.title === 'TEAMLAZER') changeView('teamlazer');
    else if (link.title === 'TEAMROBIN') changeView('teamrobin');
    else if (link.title === 'TEAMCONNECT') changeView('teamconnect');
    else if (link.title === 'TEAMBOX') changeView('teambox');
    else if (link.title === 'TEAMSEGWAY') changeView('teamsegway');
    else if (link.title === 'TEAMCONTROL') changeView('teamcontrol');
    else if (link.title === 'TEAMCONSTRUCT') changeView('teamconstruct');
    else if (link.title === 'DISTANCE') changeView('distance_tool');
    else if (link.title === 'PAKKELISTER') changeView('teamrobin_packing');
    else if (link.title === 'FØR OPGAVEN') changeView('teamrobin_packing_before');
    else if (link.title === 'EFTER OPGAVEN') changeView('teamrobin_packing_after');
    else if (link.title === 'JUSTERING') changeView('teamlazer_justering');
    else if (link.url === '#teamrobin_video') changeView('teamrobin_video');
    else if (link.url === '#teamchallenge_video') changeView('teamchallenge_video');
    else if (link.url === '#teamaction_video') changeView('teamaction_video');
    else if (link.url === '#teamsegway_video') changeView('teamsegway_video');
    else if (link.url === '#teamconstruct_video') changeView('teamconstruct_video');
    else if (link.url === '#teamcontrol_video') changeView('teamcontrol_video');
    else if (link.url === '#teambox_video') changeView('teambox_video');
    else if (link.url === '#teamlazer_video') changeView('teamlazer_video');
    else if (link.url === '#teamlazer_packing') changeView('teamlazer_packing');
    else if (link.url === '#teamsegway_packing') changeView('teamsegway_packing');
    else if (link.url === '#teamlazer_scorecard') changeView('teamlazer_scorecard');
    else if (link.url === '#teamlazer_fejlsogning') changeView('teamlazer_fejlsogning');
    else if (link.url === '#code') changeView('code');
    else if (link.title === 'CLAUDE') setIsClaudeDevOpen(true);
    else if (link.title === 'USERS') setIsUsersOpen(true);
  };

  const handleBackClick = () => {
    // Nested navigation logic
    if (currentView === 'economy') {
      changeView('office');
    } else if (currentView === 'team_challenge') {
      changeView('activities');
    } else if (currentView === 'loquiz') {
      changeView('team_challenge');
    } else if (currentView === 'teamaction') {
      changeView('activities');
    } else if (currentView === 'teamlazer') {
      changeView('activities');
    } else if (currentView === 'teamrobin') {
      changeView('activities');
    } else if (currentView === 'teamconnect') {
      changeView('activities');
    } else if (currentView === 'teambox') {
      changeView('activities');
    } else if (currentView === 'teamsegway') {
      changeView('activities');
    } else if (currentView === 'teamcontrol') {
      changeView('activities');
    } else if (currentView === 'teamconstruct') {
      changeView('activities');
    } else if (currentView === 'distance_tool') {
      changeView('tools');
    } else if (currentView === 'code') {
      changeView('tools');
    } else if (currentView === 'teamrobin_packing') {
      changeView('teamrobin');
    } else if (currentView === 'teamrobin_packing_before' || currentView === 'teamrobin_packing_after') {
      changeView('teamrobin_packing');
    } else if (currentView === 'teamlazer_justering') {
      changeView('teamlazer_fejlsogning');
    } else if (currentView === 'teamlazer_fejlsogning') {
      changeView('teamlazer');
    } else if (currentView === 'teamrobin_video') {
      changeView('teamrobin');
    } else if (currentView === 'teamchallenge_video') {
      changeView('team_challenge');
    } else if (currentView === 'teamaction_video') {
      changeView('teamaction');
    } else if (currentView === 'teamsegway_video') {
      changeView('teamsegway');
    } else if (currentView === 'teamconstruct_video') {
      changeView('teamconstruct');
    } else if (currentView === 'teamcontrol_video') {
      changeView('teamcontrol');
    } else if (currentView === 'teambox_video') {
      changeView('teambox');
    } else if (currentView === 'teamlazer_video') {
      changeView('teamlazer');
    } else if (currentView === 'teamlazer_packing') {
      changeView('teamlazer');
    } else if (currentView === 'teamsegway_packing') {
      changeView('teamsegway');
    } else if (currentView === 'teamlazer_scorecard') {
      changeView('teamlazer');
    } else {
      changeView('main');
    }
  };

  let currentLinks: HubLink[] = [];
  let viewTitle = '';
  let viewSubtitle = '';
  let ViewIcon = ShieldCheck;

  // Determine content based on view
  switch (currentView) {
    case 'activities':
      currentLinks = ACTIVITY_LINKS;
      viewTitle = 'ACTIVITIES';
      viewSubtitle = '';
      ViewIcon = ShieldCheck;
      break;
    case 'economy':
      currentLinks = ECONOMY_LINKS;
      viewTitle = 'ECONOMY';
      viewSubtitle = 'Financial Systems';
      ViewIcon = Wallet;
      break;
    case 'task_control':
      currentLinks = TASK_CONTROL_LINKS;
      viewTitle = 'ADMIN';
      viewSubtitle = 'Admin & Operations';
      ViewIcon = ClipboardList;
      break;
    case 'tools':
      currentLinks = TOOLS_LINKS;
      viewTitle = 'TOOLS';
      viewSubtitle = 'Utility Functions';
      ViewIcon = Wrench;
      break;
    case 'code':
      currentLinks = CODE_LINKS;
      viewTitle = 'CODE';
      viewSubtitle = 'Development Tools';
      ViewIcon = Code;
      break;
    case 'office':
      currentLinks = OFFICE_LINKS;
      viewTitle = 'OFFICE';
      viewSubtitle = '';
      ViewIcon = Briefcase;
      break;
    case 'team_challenge':
      currentLinks = TEAM_CHALLENGE_LINKS;
      viewTitle = 'TEAMCHALLENGE';
      viewSubtitle = '';
      ViewIcon = Trophy;
      break;
    case 'loquiz':
      currentLinks = LOQUIZ_LINKS;
      viewTitle = 'LOQUIZ';
      viewSubtitle = '';
      ViewIcon = MapPin;
      break;
    case 'teamaction':
      currentLinks = TEAMACTION_LINKS;
      viewTitle = 'TEAMACTION';
      viewSubtitle = '';
      ViewIcon = Swords;
      break;
    case 'teamlazer':
      currentLinks = TEAMLAZER_LINKS;
      viewTitle = 'TEAMLAZER';
      viewSubtitle = '';
      ViewIcon = Zap;
      break;
    case 'teamrobin':
      currentLinks = TEAMROBIN_LINKS;
      viewTitle = 'TEAMROBIN';
      viewSubtitle = '';
      ViewIcon = Target;
      break;
    case 'teamconnect':
      currentLinks = TEAMCONNECT_LINKS;
      viewTitle = 'TEAMCONNECT';
      viewSubtitle = '';
      ViewIcon = CircleDot;
      break;
    case 'teambox':
      currentLinks = TEAMBOX_LINKS;
      viewTitle = 'TEAMBOX';
      viewSubtitle = '';
      ViewIcon = Briefcase;
      break;
    case 'teamsegway':
      currentLinks = TEAMSEGWAY_LINKS;
      viewTitle = 'TEAMSEGWAY';
      viewSubtitle = '';
      ViewIcon = Navigation;
      break;
    case 'teamcontrol':
      currentLinks = TEAMCONTROL_LINKS;
      viewTitle = 'TEAMCONTROL';
      viewSubtitle = '';
      ViewIcon = Gamepad2;
      break;
    case 'teamconstruct':
      currentLinks = TEAMCONSTRUCT_LINKS;
      viewTitle = 'TEAMCONSTRUCT';
      viewSubtitle = '';
      ViewIcon = Hammer;
      break;
    case 'distance_tool':
      currentLinks = []; // No links grid for this view
      viewTitle = 'DISTANCE';
      viewSubtitle = 'Travel Calculator';
      ViewIcon = Navigation;
      break;
    case 'teamrobin_packing':
      currentLinks = TEAMROBIN_PACKING_LINKS;
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamRobin';
      ViewIcon = Package;
      break;
    case 'teamrobin_packing_before':
      currentLinks = []; // No links grid for this view - shows PackingList component
      viewTitle = 'FØR OPGAVEN';
      viewSubtitle = 'Afgang Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teamrobin_packing_after':
      currentLinks = []; // No links grid for this view - shows PackingList component
      viewTitle = 'EFTER OPGAVEN';
      viewSubtitle = 'Hjemkomst Checklist';
      ViewIcon = ListChecks;
      break;
    case 'teamlazer_justering':
      currentLinks = []; // No links grid for this view - shows VideoPlayer component
      viewTitle = 'JUSTERING';
      viewSubtitle = 'Video Guide';
      ViewIcon = Zap;
      break;
    case 'teamlazer_fejlsogning':
      currentLinks = TEAMLAZER_FEJLSOGNING_LINKS;
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamLazer';
      ViewIcon = Wrench;
      break;
    case 'teamrobin_video':
      currentLinks = []; // No links grid for this view - shows VideoPlayer component
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamRobin Guides';
      ViewIcon = Target;
      break;
    case 'teamchallenge_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamChallenge Guides';
      ViewIcon = Trophy;
      break;
    case 'teamaction_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamAction Guides';
      ViewIcon = Swords;
      break;
    case 'teamsegway_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamSegway Guides';
      ViewIcon = Navigation;
      break;
    case 'teamconstruct_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamConstruct Guides';
      ViewIcon = Hammer;
      break;
    case 'teamcontrol_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamControl Guides';
      ViewIcon = Gamepad2;
      break;
    case 'teambox_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamBox Guides';
      ViewIcon = Briefcase;
      break;
    case 'teamlazer_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamLazer Guides';
      ViewIcon = Zap;
      break;
    case 'teamlazer_packing':
      currentLinks = [];
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamLazer';
      ViewIcon = Package;
      break;
    case 'teamsegway_packing':
      currentLinks = [];
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamSegway';
      ViewIcon = Package;
      break;
    case 'teamlazer_scorecard':
      currentLinks = [];
      viewTitle = 'SCORECARD';
      viewSubtitle = 'TeamLazer Point';
      ViewIcon = ListChecks;
      break;
    case 'main':
    default:
      // Use the state for main view to reflect drag and drop order
      currentLinks = hubLinks; 
      viewTitle = 'TEAMBATTLE';
      viewSubtitle = 'Operational Command Center';
      ViewIcon = ShieldCheck;
      break;
  }

  // Grid layout logic - optimized for tablet landscape (1280x800)
  // Activities grid: 4 columns on tablet+ for better landscape layout
  let gridClass = "grid grid-cols-2 tablet:grid-cols-4 lg:grid-cols-4 gap-x-4 gap-y-4 tablet:gap-x-6 tablet:gap-y-6 md:gap-x-8 md:gap-y-8 justify-items-center max-w-5xl mx-auto tablet-landscape-grid";

  if (currentView === 'main') {
    // Main view: centered flex layout
    gridClass = "flex flex-wrap justify-center gap-4 tablet:gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto";
  } else if (currentView === 'activities') {
    // Activities: 4 columns grid for 11 items, optimized for tablet landscape
    gridClass = "grid grid-cols-2 sm:grid-cols-3 tablet:grid-cols-4 gap-x-3 gap-y-3 tablet:gap-x-4 tablet:gap-y-4 justify-items-center max-w-5xl mx-auto tablet-landscape-grid";
  } else if (currentView === 'office') {
    // Office: 6 columns grid for sections
    gridClass = "grid grid-cols-3 sm:grid-cols-4 tablet:grid-cols-6 gap-x-3 gap-y-3 tablet:gap-x-4 tablet:gap-y-4 justify-items-center max-w-6xl mx-auto";
  }

  return (
    <div className="min-h-screen w-full bg-battle-black text-white selection:bg-battle-orange selection:text-white overflow-x-hidden flex flex-col relative">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Orange Glow Top Left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-battle-orange/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        {/* White Glow Bottom Right */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Top Left Back Button - Touch optimized */}
      {currentView !== 'main' && (
        <div className="absolute top-3 left-3 tablet:top-4 tablet:left-4 md:top-8 md:left-8 z-50">
          <button
            onClick={handleBackClick}
            className="group flex items-center justify-center w-11 h-11 tablet:w-12 tablet:h-12 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation"
            title="Return"
          >
            <House className="w-5 h-5 tablet:w-6 tablet:h-6 md:w-7 md:h-7 group-hover:text-battle-orange group-active:text-battle-orange transition-colors" />
          </button>
        </div>
      )}

      {/* Center Top Clock */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Clock />
      </div>

      {/* Top Right User Info and Calendar - Touch optimized */}
      <div className="absolute top-3 right-3 tablet:top-4 tablet:right-4 md:top-8 md:right-8 z-50 flex items-center gap-2 tablet:gap-3">
        {/* Claude AI Button - Admin Only */}
        {profile?.role === 'ADMIN' && (
          <button
            onClick={() => setIsClaudeAssistantOpen(true)}
            className="group flex items-center justify-center w-10 h-10 tablet:w-11 tablet:h-11 md:w-14 md:h-14 bg-gradient-to-br from-orange-500/20 to-amber-600/20 hover:from-orange-500/40 hover:to-amber-600/40 active:from-orange-500/50 active:to-amber-600/50 border border-orange-500/30 hover:border-orange-500 text-white rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_25px_rgba(255,140,0,0.4)] touch-manipulation"
            title="Claude AI Assistant"
          >
            <Bot className="w-5 h-5 tablet:w-6 tablet:h-6 md:w-7 md:h-7 text-orange-400 group-hover:text-orange-300 group-active:text-orange-200 transition-colors" />
          </button>
        )}

        {/* User Info - Hidden on small tablets */}
        <div className="hidden lg:flex items-center gap-2 bg-battle-grey/50 border border-white/10 rounded-full px-4 py-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{profile?.name || profile?.email}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            profile?.role === 'ADMIN' ? 'bg-red-500/20 text-white' :
            profile?.role === 'GAMEMASTER' ? 'bg-purple-500/20 text-purple-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {profile?.role}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={signOut}
          className="group flex items-center justify-center w-10 h-10 tablet:w-11 tablet:h-11 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-red-500/20 active:bg-red-500/30 border border-white/10 hover:border-red-500 text-white rounded-full transition-all duration-200 touch-manipulation"
          title="Log ud"
        >
          <LogOut className="w-5 h-5 tablet:w-6 tablet:h-6 md:w-7 md:h-7 group-hover:text-red-500 group-active:text-red-400 transition-colors" />
        </button>

        {/* Distance Button */}
        <button
          onClick={() => changeView('distance_tool')}
          className="group flex items-center justify-center w-10 h-10 tablet:w-11 tablet:h-11 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-blue-500/20 active:bg-blue-500/30 border border-white/10 hover:border-blue-500 text-white rounded-full transition-all duration-200 touch-manipulation"
          title="Afstandsberegner"
        >
          <Ruler className="w-5 h-5 tablet:w-6 tablet:h-6 md:w-7 md:h-7 group-hover:text-blue-400 group-active:text-blue-300 transition-colors" />
        </button>

        {/* Calendar Button */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="group flex items-center justify-center w-10 h-10 tablet:w-11 tablet:h-11 md:w-14 md:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation"
        >
          <Calendar className="w-5 h-5 tablet:w-6 tablet:h-6 md:w-7 md:h-7 group-hover:text-battle-orange group-active:text-battle-orangeLight transition-colors" />
        </button>
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <ClaudeDevModal isOpen={isClaudeDevOpen} onClose={() => setIsClaudeDevOpen(false)} />
      <UsersManagement isOpen={isUsersOpen} onClose={() => setIsUsersOpen(false)} />
      <ClaudeAssistant isOpen={isClaudeAssistantOpen} onClose={() => setIsClaudeAssistantOpen(false)} />

      {/* Main Content Container - Optimized for tablet landscape */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-start pt-16 tablet:pt-14 lg:pt-20 px-3 tablet:px-4 tablet-landscape-compact">

        {/* Header Section - Compact on tablet landscape */}
        <header className="w-full max-w-6xl mx-auto mb-4 tablet:mb-6 lg:mb-10 relative flex flex-col items-center justify-center tablet-landscape-header">

          {/* Centered Title Content - Text centered, Icon absolute left */}
          <div className="text-center flex flex-col items-center">

            <div className="relative flex items-center justify-center mb-1 tablet:mb-2">
               {/* Icon Positioned Absolute Left of the Title */}
               <div className="absolute right-full mr-3 tablet:mr-4 md:mr-6 text-battle-orange drop-shadow-[0_0_10px_rgba(255,102,0,0.5)] flex items-center">
                 <ViewIcon className="w-8 h-8 tablet:w-10 tablet:h-10 md:w-14 md:h-14" />
               </div>

               <h1 className="text-3xl tablet:text-4xl md:text-6xl font-black tracking-tighter uppercase">
                {viewTitle.startsWith('TEAM') ? (
                  <>
                    <span className="text-white">TEAM</span>
                    <span className="text-battle-orange">{viewTitle.slice(4)}</span>
                  </>
                ) : viewTitle === 'OFFICE' || viewTitle === 'ADMIN' ? (
                  <span className="text-white">{viewTitle}</span>
                ) : (
                  <span className="text-battle-orange">{viewTitle}</span>
                )}
              </h1>
            </div>

            <DateDisplay />
            {viewSubtitle && (
              <p className="text-battle-white/50 text-xs tablet:text-sm md:text-lg tracking-[0.2em] uppercase mt-1">
                {viewSubtitle}
              </p>
            )}
            <div className="h-0.5 tablet:h-1 w-16 tablet:w-24 bg-battle-orange mx-auto mt-3 tablet:mt-4 lg:mt-6 rounded-full shadow-[0_0_15px_rgba(255,102,0,1)]"></div>
          </div>
        </header>

        {/* content */}
        <div className={`w-full max-w-6xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentView === 'distance_tool' ? (
            <DistanceTool />
          ) : currentView === 'teamrobin_packing_before' ? (
            <PackingList
              title="Før Opgaven - Afgang"
              storageKey="teamrobin_packing_before"
              items={TEAMROBIN_PACKING_BEFORE}
            />
          ) : currentView === 'teamrobin_packing_after' ? (
            <PackingList
              title="Efter Opgaven - Hjemkomst"
              storageKey="teamrobin_packing_after"
              items={TEAMROBIN_PACKING_AFTER}
            />
          ) : currentView === 'teamlazer_justering' ? (
            <VideoPlayer
              title="TeamLazer Justering"
              videoId="ZkkqiV-uRRg"
            />
          ) : currentView === 'teamrobin_video' ? (
            <VideoPlayer
              title="TeamRobin Video Guides"
              playlistId="PLq4wXYwkH9QaWwF-HmOgfUc_ubty9BOub"
            />
          ) : currentView === 'teamchallenge_video' ? (
            <VideoPlayer
              title="TeamChallenge Video Guides"
              playlistId="PLq4wXYwkH9QYW4rRwBBM8xUUf_9yg6l6Z"
            />
          ) : currentView === 'teamaction_video' ? (
            <VideoPlayer
              title="TeamAction Video Guides"
              playlistId="PLq4wXYwkH9QY14CVT_nnytn_HMX_BTnyR"
            />
          ) : currentView === 'teamsegway_video' ? (
            <VideoPlayer
              title="TeamSegway Video Guides"
              playlistId="PLq4wXYwkH9QZE47RWiYV6XAy48RSt83mR"
            />
          ) : currentView === 'teamconstruct_video' ? (
            <VideoPlayer
              title="TeamConstruct Video Guides"
              playlistId="PLq4wXYwkH9QaJWSzrKmj7NCWdPgJD0_zd"
            />
          ) : currentView === 'teamcontrol_video' ? (
            <VideoPlayer
              title="TeamControl Video Guides"
              playlistId="PLq4wXYwkH9QaTPd62RD_rf3YSCw3eMdzr"
            />
          ) : currentView === 'teambox_video' ? (
            <VideoPlayer
              title="TeamBox Video Guides"
              playlistId="PLq4wXYwkH9QYNeIb2OD85T-zLjIkp6MIc"
            />
          ) : currentView === 'teamlazer_video' ? (
            <VideoPlayer
              title="TeamLazer Video Guides"
              playlistId="PLq4wXYwkH9QbWM9SurCo-EWPJlCO03-vk"
              videoIndex={TEAMLAZER_VIDEO_INDEX}
            />
          ) : currentView === 'teamlazer_packing' ? (
            <TeamLazerPackingList />
          ) : currentView === 'teamsegway_packing' ? (
            <TeamSegwayPackingList />
          ) : currentView === 'teamlazer_scorecard' ? (
            <LazerPointScoreboard />
          ) : currentView === 'office' ? (
            <div className="w-full max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-3 tablet:gap-4">
                {[
                  { name: 'CrewControlCenter', color: 'red', borderColor: 'border-red-500', bgColor: 'bg-red-500/10', titleColor: 'text-red-400' },
                  { name: 'Office', color: 'green', borderColor: 'border-green-500', bgColor: 'bg-green-500/10', titleColor: 'text-green-400' },
                  { name: 'Economy', color: 'yellow', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-500/10', titleColor: 'text-yellow-400' },
                  { name: 'Google Tools', color: 'blue', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', titleColor: 'text-blue-400' }
                ].map((section) => {
                  const sectionLinks = currentLinks.filter(l => l.section === section.name);
                  return (
                    <div
                      key={section.name}
                      className={`rounded-lg border ${section.borderColor} ${section.bgColor} p-2 tablet:p-3`}
                    >
                      <h3 className={`text-xs tablet:text-sm font-bold ${section.titleColor} uppercase tracking-widest mb-2 tablet:mb-3 text-center`}>
                        {section.name}
                      </h3>
                      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-1 tablet:gap-2 justify-items-center office-grid-small">
                        {sectionLinks.map((link, idx) => (
                          <HubButton
                            key={link.id}
                            link={link}
                            index={idx}
                            onClick={handleLinkClick}
                            draggable={false}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full">
              {(() => {
                let lastSection: string | undefined = undefined;
                return currentLinks.map((link, index) => {
                  const showSectionHeader = link.section && link.section !== lastSection;
                  lastSection = link.section;
                  return (
                    <React.Fragment key={link.id}>
                      {showSectionHeader && (
                        <div className="w-full mb-4 mt-8 first:mt-0">
                          <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-battle-orange/30 to-transparent"></div>
                            <h3 className="text-sm md:text-base font-bold text-battle-orange uppercase tracking-widest">
                              {link.section}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-battle-orange/30 to-transparent"></div>
                          </div>
                        </div>
                      )}
                      {index === 0 || showSectionHeader ? (
                        <div className={gridClass}>
                          {currentLinks
                            .filter((l, i) => {
                              if (!link.section) return i === index;
                              return l.section === link.section;
                            })
                            .map((sectionLink, sectionIndex) => (
                              <HubButton
                                key={sectionLink.id}
                                link={sectionLink}
                                index={sectionIndex}
                                onClick={handleLinkClick}
                                draggable={currentView === 'main'}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                              />
                            ))}
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-battle-grey text-xs uppercase tracking-widest mt-auto">
        <p>&copy; {new Date().getFullYear()} TeamBattle Systems. Authorized Personnel Only.</p>
      </footer>

    </div>
  );
};

export default App;