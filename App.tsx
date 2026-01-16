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
  TEAMBOX_PACKING_LINKS,
  TEAMSEGWAY_LINKS,
  TEAMCONTROL_LINKS,
  TEAMCONSTRUCT_LINKS,
  TEAMROBIN_PACKING_LINKS,
  TEAMCONSTRUCT_PACKING_LINKS,
  TEAMLAZER_VIDEO_INDEX,
  TEAMCONSTRUCT_VIDEO_INDEX,
  TEAMCONTROL_VIDEO_INDEX,
  TEAMRACE_VIDEO_INDEX,
  TEAMLAZER_FEJLSOGNING_VIDEO_INDEX,
  TEAMROBIN_FEJLSOGNING_VIDEO_INDEX,
  TEAMSEGWAY_FEJLSOGNING_VIDEO_INDEX,
  FLYBRIX_LINKS,
  TEAMCONTROL_PACKING_LINKS,
  TEAMRACE_LINKS,
  TEAMRACE_PACKING_LINKS
} from './constants';
import HubButton from './components/HubButton';
import Clock, { DateDisplay } from './components/Clock';
import CalendarModal from './components/CalendarModal';
import DistanceTool from './components/DistanceTool';
import ClaudeDevModal from './components/ClaudeDevModal';
import LoginScreen from './components/LoginScreen';
import UsersManagement, { getPermissions, PermissionsConfig, getUserActivityPermissions } from './components/UsersManagement';
import ClaudeAssistant from './components/ClaudeAssistant';
import PackingList, { TEAMROBIN_PACKING_BEFORE, TEAMROBIN_PACKING_AFTER } from './components/PackingList';
import VideoPlayer from './components/VideoPlayer';
import TeamLazerPackingList from './components/TeamLazerPackingList';
import TeamSegwayPackingList from './components/TeamSegwayPackingList';
import LazerPointScoreboard from './components/LazerPointScoreboard';
import IdeasModal from './components/IdeasModal';
import TeamConstructGuide from './components/TeamConstructGuide';
import TeamBoxGuide from './components/TeamBoxGuide';
import TeamBoxDownloads from './components/TeamBoxDownloads';
import TeamConstructScorecard from './components/TeamConstructScorecard';
import TeamConstructPackingList from './components/TeamConstructPackingList';
import TeamControlGuide from './components/TeamControlGuide';
import FlybrixManual from './components/FlybrixManual';
import TeamControlPackingList from './components/TeamControlPackingList';
import FejlsogningReport from './components/FejlsogningReport';
import AdminReports from './components/AdminReports';
import PackingListEditor from './components/PackingListEditor';
import DynamicPackingList from './components/DynamicPackingList';
import PDFViewer from './components/PDFViewer';
import TeamRaceGuide from './components/TeamRaceGuide';
import TeamRaceInstructions from './components/TeamRaceInstructions';
import TeamRaceScorecard from './components/TeamRaceScorecard';
import ActivityGuide from './components/ActivityGuide';
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
  ListChecks,
  HelpCircle,
  Map,
  Car
} from 'lucide-react';
import { HubLink } from './types';

type ViewState = 'main' | 'activities' | 'economy' | 'task_control' | 'tools' | 'code' | 'office' | 'team_challenge' | 'loquiz' | 'teamaction' | 'teamlazer' | 'teamrobin' | 'teamconnect' | 'teambox' | 'teamsegway' | 'teamcontrol' | 'teamconstruct' | 'teamrace' | 'distance_tool' | 'teamrobin_packing' | 'teamrobin_packing_before' | 'teamrobin_packing_after' | 'teamlazer_justering' | 'teamlazer_fejlsogning' | 'teamrobin_fejlsogning' | 'teamsegway_fejlsogning' | 'teamrobin_video' | 'teamchallenge_video' | 'teamaction_video' | 'teamsegway_video' | 'teamconstruct_video' | 'teamconstruct_guide' | 'teamconstruct_scorecard' | 'teamconstruct_packing' | 'teamconstruct_packing_afgang' | 'teamconstruct_packing_hjemkomst' | 'teamcontrol_video' | 'teamcontrol_guide' | 'teamcontrol_flybrix' | 'teamcontrol_flybrix_manual' | 'teamcontrol_packing' | 'teamcontrol_packing_afgang' | 'teamcontrol_packing_hjemkomst' | 'teamcontrol_musik' | 'teambox_video' | 'teambox_checklist' | 'teambox_guide' | 'teambox_packing' | 'teambox_packing_afgang' | 'teambox_packing_hjemkomst' | 'teambox_downloads' | 'teamlazer_video' | 'teamlazer_packing' | 'teamsegway_packing' | 'teamlazer_scorecard' | 'fejlsogning_teamlazer' | 'fejlsogning_teamrobin' | 'fejlsogning_teamsegway' | 'fejlsogning_teamcontrol' | 'fejlsogning_teamconstruct' | 'fejlsogning_teamconnect' | 'fejlsogning_teambox' | 'fejlsogning_teamaction' | 'fejlsogning_teamchallenge' | 'fejlsogning_loquiz' | 'fejlsogning_teamrace' | 'teamrace_video' | 'teamrace_packing' | 'teamrace_packing_afgang' | 'teamrace_packing_hjemkomst' | 'teamrace_packing_taske' | 'teamrace_scorecard' | 'teamrace_guide' | 'teamrace_rccars' | 'teamrace_instructions' | 'admin_reports' | 'admin_packing_editor' | 'teamlazer_guide' | 'teamrobin_guide' | 'teamsegway_guide' | 'teamconnect_guide' | 'teamaction_guide' | 'teamchallenge_guide';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, profile, signOut, logPageVisit } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isClaudeDevOpen, setIsClaudeDevOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isClaudeAssistantOpen, setIsClaudeAssistantOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);

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

  // Load permissions from localStorage
  const [permissions, setPermissions] = useState<PermissionsConfig>(getPermissions);
  const [userActivityPermsVersion, setUserActivityPermsVersion] = useState(0);

  // Refresh permissions when UsersManagement modal closes
  useEffect(() => {
    if (!isUsersOpen) {
      setPermissions(getPermissions());
      setUserActivityPermsVersion(v => v + 1); // Trigger re-filter of activities
    }
  }, [isUsersOpen]);

  // Role-based access control - filter links based on user role and permissions
  const filterLinksByRole = (links: HubLink[]): HubLink[] => {
    if (!profile) return links;

    const rolePerms = permissions[profile.role as keyof PermissionsConfig];
    if (!rolePerms) return links;

    return links.filter(link => {
      // Landing page items
      if (link.title === 'ADMIN') return rolePerms.landing_admin;
      if (link.title === 'OFFICE') return rolePerms.landing_office;
      if (link.title === 'ACTIVITIES') return rolePerms.landing_activities;
      if (link.title === 'ControlCenter') return rolePerms.landing_controlcenter;
      return true;
    });
  };

  // Filter OFFICE sections by role
  const filterOfficeSectionsByRole = (links: HubLink[]): HubLink[] => {
    if (!profile) return links;

    const rolePerms = permissions[profile.role as keyof PermissionsConfig];
    if (!rolePerms) return links;

    return links.filter(link => {
      if (link.section === 'Economy') return rolePerms.office_economy;
      if (link.section === 'Google Tools') return rolePerms.office_googletools;
      if (link.section === 'CrewControlCenter') return rolePerms.office_crewcontrolcenter;
      if (link.section === 'Office') return rolePerms.office_office;
      return true;
    });
  };

  // Filter ACTIVITY links by role
  const filterActivitiesByRole = (links: HubLink[]): HubLink[] => {
    if (!profile) return links;

    // Admin and Gamemaster see all activities
    if (profile.role === 'ADMIN' || profile.role === 'GAMEMASTER') {
      return links;
    }

    // Instructors - use user-level permissions
    if (profile.role === 'INSTRUCTOR') {
      const userActivityPerms = getUserActivityPermissions();
      return links.filter(link => {
        const titleLower = link.title.toLowerCase();
        const activityKey = `activity_${titleLower}`;
        const allowedUsers = userActivityPerms[activityKey] || [];
        return allowedUsers.includes(profile.email);
      });
    }

    return links;
  };

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
    else if (link.title === 'TEAMRACE') changeView('teamrace');
    else if (link.title === 'DISTANCE') changeView('distance_tool');
    else if (link.url === '#teamrobin_packing') changeView('teamrobin_packing');
    else if (link.url === '#teamrobin_packing_before') changeView('teamrobin_packing_before');
    else if (link.url === '#teamrobin_packing_after') changeView('teamrobin_packing_after');
    else if (link.title === 'JUSTERING') changeView('teamlazer_justering');
    else if (link.url === '#teamrobin_video') changeView('teamrobin_video');
    else if (link.url === '#teamchallenge_video') changeView('teamchallenge_video');
    else if (link.url === '#teamaction_video') changeView('teamaction_video');
    else if (link.url === '#teamsegway_video') changeView('teamsegway_video');
    else if (link.url === '#teamconstruct_video') changeView('teamconstruct_video');
    else if (link.url === '#teamconstruct_guide') changeView('teamconstruct_guide');
    else if (link.url === '#teamconstruct_scorecard') changeView('teamconstruct_scorecard');
    else if (link.url === '#teamconstruct_packing') changeView('teamconstruct_packing');
    else if (link.url === '#teamconstruct_packing_afgang') changeView('teamconstruct_packing_afgang');
    else if (link.url === '#teamconstruct_packing_hjemkomst') changeView('teamconstruct_packing_hjemkomst');
    else if (link.url === '#teamcontrol_video') changeView('teamcontrol_video');
    else if (link.url === '#teamcontrol_guide') changeView('teamcontrol_guide');
    else if (link.url === '#teamcontrol_flybrix') changeView('teamcontrol_flybrix');
    else if (link.url === '#teamcontrol_flybrix_manual') changeView('teamcontrol_flybrix_manual');
    else if (link.url === '#teamcontrol_packing') changeView('teamcontrol_packing');
    else if (link.url === '#teamcontrol_packing_afgang') changeView('teamcontrol_packing_afgang');
    else if (link.url === '#teamcontrol_packing_hjemkomst') changeView('teamcontrol_packing_hjemkomst');
    else if (link.url === '#teamcontrol_musik') changeView('teamcontrol_musik');
    else if (link.url === '#teambox_video') changeView('teambox_video');
    else if (link.url === '#teambox_checklist') changeView('teambox_checklist');
    else if (link.url === '#teambox_guide') changeView('teambox_guide');
    else if (link.url === '#teambox_packing') changeView('teambox_packing');
    else if (link.url === '#teambox_packing_afgang') changeView('teambox_packing_afgang');
    else if (link.url === '#teambox_packing_hjemkomst') changeView('teambox_packing_hjemkomst');
    else if (link.url === '#teambox_downloads') changeView('teambox_downloads');
    else if (link.url === '#teamlazer_video') changeView('teamlazer_video');
    else if (link.url === '#teamlazer_packing') changeView('teamlazer_packing');
    else if (link.url === '#teamsegway_packing') changeView('teamsegway_packing');
    else if (link.url === '#teamlazer_scorecard') changeView('teamlazer_scorecard');
    else if (link.url === '#teamlazer_fejlsogning') changeView('teamlazer_fejlsogning');
    else if (link.url === '#fejlsogning_teamlazer') changeView('fejlsogning_teamlazer');
    else if (link.url === '#fejlsogning_teamrobin') changeView('fejlsogning_teamrobin');
    else if (link.url === '#fejlsogning_teamsegway') changeView('fejlsogning_teamsegway');
    else if (link.url === '#fejlsogning_teamcontrol') changeView('fejlsogning_teamcontrol');
    else if (link.url === '#fejlsogning_teamconstruct') changeView('fejlsogning_teamconstruct');
    else if (link.url === '#fejlsogning_teamconnect') changeView('fejlsogning_teamconnect');
    else if (link.url === '#fejlsogning_teambox') changeView('fejlsogning_teambox');
    else if (link.url === '#fejlsogning_teamaction') changeView('fejlsogning_teamaction');
    else if (link.url === '#fejlsogning_teamchallenge') changeView('fejlsogning_teamchallenge');
    else if (link.url === '#fejlsogning_loquiz') changeView('fejlsogning_loquiz');
    else if (link.url === '#teamrace_scorecard') changeView('teamrace_scorecard');
    else if (link.url === '#teamrace_guide') changeView('teamrace_guide');
    else if (link.url === '#teamrace_packing') changeView('teamrace_packing');
    else if (link.url === '#teamrace_packing_afgang') changeView('teamrace_packing_afgang');
    else if (link.url === '#teamrace_packing_hjemkomst') changeView('teamrace_packing_hjemkomst');
    else if (link.url === '#teamrace_packing_taske') changeView('teamrace_packing_taske');
    else if (link.url === '#teamrace_video') changeView('teamrace_video');
    else if (link.url === '#fejlsogning_teamrace') changeView('fejlsogning_teamrace');
    else if (link.url === '#teamrace_rccars') changeView('teamrace_rccars');
    else if (link.url === '#teamrace_instructions') changeView('teamrace_instructions');
    else if (link.url === '#code') changeView('code');
    else if (link.url === '#admin_reports') changeView('admin_reports');
    else if (link.url === '#admin_packing_editor') changeView('admin_packing_editor');
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
    } else if (currentView === 'teamrace') {
      changeView('activities');
    } else if (currentView === 'teamrace_scorecard' || currentView === 'teamrace_guide' || currentView === 'teamrace_packing' || currentView === 'teamrace_video' || currentView === 'fejlsogning_teamrace' || currentView === 'teamrace_rccars' || currentView === 'teamrace_instructions') {
      changeView('teamrace');
    } else if (currentView === 'teamrace_packing_afgang' || currentView === 'teamrace_packing_hjemkomst' || currentView === 'teamrace_packing_taske') {
      changeView('teamrace_packing');
    } else if (currentView === 'distance_tool') {
      changeView('tools');
    } else if (currentView === 'code') {
      changeView('task_control');
    } else if (currentView === 'admin_reports') {
      changeView('task_control');
    } else if (currentView === 'admin_packing_editor') {
      changeView('task_control');
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
    } else if (currentView === 'teamconstruct_guide') {
      changeView('teamconstruct');
    } else if (currentView === 'teamconstruct_scorecard') {
      changeView('teamconstruct');
    } else if (currentView === 'teamconstruct_packing') {
      changeView('teamconstruct');
    } else if (currentView === 'teamconstruct_packing_afgang' || currentView === 'teamconstruct_packing_hjemkomst') {
      changeView('teamconstruct_packing');
    } else if (currentView === 'teamcontrol_video') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_guide') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_flybrix') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_flybrix_manual') {
      changeView('teamcontrol_flybrix');
    } else if (currentView === 'teamcontrol_packing') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_packing_afgang' || currentView === 'teamcontrol_packing_hjemkomst') {
      changeView('teamcontrol_packing');
    } else if (currentView === 'teamcontrol_musik') {
      changeView('teamcontrol');
    } else if (currentView === 'teambox_video') {
      changeView('teambox');
    } else if (currentView === 'teambox_checklist') {
      changeView('teambox');
    } else if (currentView === 'teambox_guide') {
      changeView('teambox');
    } else if (currentView === 'teambox_packing') {
      changeView('teambox');
    } else if (currentView === 'teambox_packing_afgang' || currentView === 'teambox_packing_hjemkomst') {
      changeView('teambox_packing');
    } else if (currentView === 'teambox_downloads') {
      changeView('teambox');
    } else if (currentView === 'teamlazer_video') {
      changeView('teamlazer');
    } else if (currentView === 'teamlazer_packing') {
      changeView('teamlazer');
    } else if (currentView === 'teamsegway_packing') {
      changeView('teamsegway');
    } else if (currentView === 'teamlazer_scorecard') {
      changeView('teamlazer');
    } else if (currentView === 'fejlsogning_teamlazer') {
      changeView('teamlazer');
    } else if (currentView === 'fejlsogning_teamrobin') {
      changeView('teamrobin');
    } else if (currentView === 'fejlsogning_teamsegway') {
      changeView('teamsegway');
    } else if (currentView === 'fejlsogning_teamcontrol') {
      changeView('teamcontrol');
    } else if (currentView === 'fejlsogning_teamconstruct') {
      changeView('teamconstruct');
    } else if (currentView === 'fejlsogning_teamconnect') {
      changeView('teamconnect');
    } else if (currentView === 'fejlsogning_teambox') {
      changeView('teambox');
    } else if (currentView === 'fejlsogning_teamaction') {
      changeView('teamaction');
    } else if (currentView === 'fejlsogning_teamchallenge') {
      changeView('team_challenge');
    } else if (currentView === 'fejlsogning_loquiz') {
      changeView('loquiz');
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
      currentLinks = filterActivitiesByRole(ACTIVITY_LINKS);
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
    case 'admin_reports':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORTER';
      viewSubtitle = 'Alle Aktiviteter';
      ViewIcon = Wrench;
      break;
    case 'admin_packing_editor':
      currentLinks = [];
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'Editor';
      ViewIcon = Package;
      break;
    case 'office':
      currentLinks = filterOfficeSectionsByRole(OFFICE_LINKS);
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
    case 'teambox_packing':
      currentLinks = TEAMBOX_PACKING_LINKS;
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamBox';
      ViewIcon = Package;
      break;
    case 'teambox_guide':
      currentLinks = [];
      viewTitle = 'INSTRUKTØRGUIDE';
      viewSubtitle = 'TeamBox';
      ViewIcon = Map;
      break;
    case 'teambox_packing_afgang':
      currentLinks = [];
      viewTitle = 'FØR OPGAVEN';
      viewSubtitle = 'Afgang Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teambox_packing_hjemkomst':
      currentLinks = [];
      viewTitle = 'EFTER OPGAVEN';
      viewSubtitle = 'Hjemkomst Checklist';
      ViewIcon = ListChecks;
      break;
    case 'teambox_downloads':
      currentLinks = [];
      viewTitle = 'DOWNLOADS';
      viewSubtitle = 'TeamBox Filer';
      ViewIcon = Package;
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
    case 'teamrace':
      currentLinks = TEAMRACE_LINKS;
      viewTitle = 'TEAMRACE';
      viewSubtitle = '';
      ViewIcon = Car;
      break;
    case 'teamrace_scorecard':
      currentLinks = [];
      viewTitle = 'SCORECARD';
      viewSubtitle = 'TeamRace';
      ViewIcon = ListChecks;
      break;
    case 'teamrace_guide':
      currentLinks = [];
      viewTitle = 'GUIDE';
      viewSubtitle = 'TeamRace';
      ViewIcon = Map;
      break;
    case 'teamrace_packing':
      currentLinks = TEAMRACE_PACKING_LINKS;
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamRace';
      ViewIcon = Package;
      break;
    case 'teamrace_packing_afgang':
      currentLinks = [];
      viewTitle = 'FØR OPGAVEN';
      viewSubtitle = 'Afgang Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teamrace_packing_hjemkomst':
      currentLinks = [];
      viewTitle = 'EFTER OPGAVEN';
      viewSubtitle = 'Hjemkomst Checklist';
      ViewIcon = ListChecks;
      break;
    case 'teamrace_packing_taske':
      currentLinks = [];
      viewTitle = 'TASKE';
      viewSubtitle = 'Sæbekasse Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teamrace_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamRace';
      ViewIcon = Car;
      break;
    case 'fejlsogning_teamrace':
      currentLinks = [];
      viewTitle = 'FEJL & MANGLER';
      viewSubtitle = 'TeamRace';
      ViewIcon = Wrench;
      break;
    case 'teamrace_rccars':
      currentLinks = [];
      viewTitle = 'RC CARS';
      viewSubtitle = 'Remote Control';
      ViewIcon = Gamepad2;
      break;
    case 'teamrace_instructions':
      currentLinks = [];
      viewTitle = 'INSTRUCTIONS';
      viewSubtitle = 'Samlevejledning';
      ViewIcon = Map;
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
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamLazer Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'teamrobin_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamRobin Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'teamsegway_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamSegway Troubleshooting';
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
    case 'teamconstruct_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamConstruct';
      ViewIcon = Map;
      break;
    case 'teamconstruct_scorecard':
      currentLinks = [];
      viewTitle = 'SCORECARD';
      viewSubtitle = 'TeamConstruct';
      ViewIcon = ListChecks;
      break;
    case 'teamconstruct_packing':
      currentLinks = TEAMCONSTRUCT_PACKING_LINKS;
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamConstruct';
      ViewIcon = Package;
      break;
    case 'teamconstruct_packing_afgang':
      currentLinks = [];
      viewTitle = 'FØR OPGAVEN';
      viewSubtitle = 'Afgang Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teamconstruct_packing_hjemkomst':
      currentLinks = [];
      viewTitle = 'EFTER OPGAVEN';
      viewSubtitle = 'Hjemkomst Checklist';
      ViewIcon = ListChecks;
      break;
    case 'teamcontrol_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamControl Guides';
      ViewIcon = Gamepad2;
      break;
    case 'teamcontrol_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamControl';
      ViewIcon = Map;
      break;
    case 'teamcontrol_flybrix':
      currentLinks = FLYBRIX_LINKS;
      viewTitle = 'FLYBRIX';
      viewSubtitle = 'TeamControl';
      ViewIcon = Gamepad2;
      break;
    case 'teamcontrol_flybrix_manual':
      currentLinks = [];
      viewTitle = 'SAMLEVEJLEDNING';
      viewSubtitle = 'Flybrix Manual';
      ViewIcon = Map;
      break;
    case 'teamcontrol_packing':
      currentLinks = TEAMCONTROL_PACKING_LINKS;
      viewTitle = 'PAKKELISTER';
      viewSubtitle = 'TeamControl';
      ViewIcon = Package;
      break;
    case 'teamcontrol_packing_afgang':
      currentLinks = [];
      viewTitle = 'FØR OPGAVEN';
      viewSubtitle = 'Afgang Pakkeliste';
      ViewIcon = Package;
      break;
    case 'teamcontrol_packing_hjemkomst':
      currentLinks = [];
      viewTitle = 'EFTER OPGAVEN';
      viewSubtitle = 'Hjemkomst Checklist';
      ViewIcon = ListChecks;
      break;
    case 'teamcontrol_musik':
      currentLinks = [];
      viewTitle = 'MUSIK';
      viewSubtitle = 'Top Gun Anthem';
      ViewIcon = Gamepad2;
      break;
    case 'teambox_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamBox Guides';
      ViewIcon = Briefcase;
      break;
    case 'teambox_checklist':
      currentLinks = [];
      viewTitle = 'NULSTIL BOX';
      viewSubtitle = 'Tjekliste';
      ViewIcon = Package;
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
    case 'fejlsogning_teamlazer':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamLazer';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamrobin':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamRobin';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamsegway':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamSegway';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamcontrol':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamControl';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamconstruct':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamConstruct';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamconnect':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamConnect';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teambox':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamBox';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamaction':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamAction';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamchallenge':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'TeamChallenge';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_loquiz':
      currentLinks = [];
      viewTitle = 'FEJLRAPPORT';
      viewSubtitle = 'Loquiz';
      ViewIcon = Wrench;
      break;
    case 'main':
    default:
      // Use the state for main view to reflect drag and drop order, filtered by role
      currentLinks = filterLinksByRole(hubLinks);
      viewTitle = 'TEAMBATTLE';
      viewSubtitle = 'Operational Command Center';
      ViewIcon = ShieldCheck;
      break;
  }

  // Grid layout logic - Responsive for all 5 modes
  // Default grid for sub-pages
  let gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-5xl mx-auto responsive-activities-grid";

  if (currentView === 'main') {
    // Main view: centered flex layout - responsive for all modes
    gridClass = "flex flex-wrap justify-center gap-3 mobile-landscape:gap-3 tablet-portrait:gap-6 tablet-landscape:gap-5 desktop:gap-8 max-w-6xl mx-auto responsive-main-grid";
  } else if (currentView === 'activities') {
    // Activities: responsive grid for 11 items
    gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-5xl mx-auto responsive-activities-grid";
  } else if (currentView === 'office') {
    // Office: responsive sections grid
    gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-2 tablet-portrait:grid-cols-2 tablet-landscape:grid-cols-2 desktop:grid-cols-2 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-6xl mx-auto responsive-office-grid";
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

      {/* Top Left Back Button - Responsive for all 5 modes */}
      {currentView !== 'main' && (
        <div className="absolute top-2 left-2 mobile-landscape:top-1.5 mobile-landscape:left-1.5 tablet-portrait:top-4 tablet-portrait:left-4 tablet-landscape:top-3 tablet-landscape:left-3 desktop:top-8 desktop:left-8 z-50 safe-area-top safe-area-left">
          <button
            onClick={handleBackClick}
            className="group flex items-center justify-center w-10 h-10 mobile-landscape:w-9 mobile-landscape:h-9 tablet-portrait:w-12 tablet-portrait:h-12 tablet-landscape:w-11 tablet-landscape:h-11 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
            title="Return"
          >
            <House className="w-5 h-5 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-6 tablet-portrait:h-6 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-battle-orange group-active:text-battle-orange transition-colors" />
          </button>
        </div>
      )}

      {/* Center Top Clock */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Clock />
      </div>

      {/* Top Right User Info and Calendar - Responsive for all 5 modes */}
      <div className="absolute top-2 right-2 mobile-landscape:top-1.5 mobile-landscape:right-1.5 tablet-portrait:top-4 tablet-portrait:right-4 tablet-landscape:top-3 tablet-landscape:right-3 desktop:top-8 desktop:right-8 z-50 flex items-center gap-1.5 mobile-landscape:gap-1 tablet-portrait:gap-2 tablet-landscape:gap-2 desktop:gap-3 safe-area-top safe-area-right">
        {/* Claude AI Button - Admin Only */}
        {profile?.role === 'ADMIN' && (
          <button
            onClick={() => setIsClaudeAssistantOpen(true)}
            className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-gradient-to-br from-orange-500/20 to-amber-600/20 hover:from-orange-500/40 hover:to-amber-600/40 active:from-orange-500/50 active:to-amber-600/50 border border-orange-500/30 hover:border-orange-500 text-white rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_25px_rgba(255,140,0,0.4)] touch-manipulation touch-target"
            title="Claude AI Assistant"
          >
            <Bot className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 text-orange-400 group-hover:text-orange-300 group-active:text-orange-200 transition-colors" />
          </button>
        )}

        {/* User Info - Only visible on desktop */}
        <div className="hidden desktop:flex items-center gap-2 bg-battle-grey/50 border border-white/10 rounded-full px-4 py-2">
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
          className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-red-500/20 active:bg-red-500/30 border border-white/10 hover:border-red-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
          title="Log ud"
        >
          <LogOut className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-red-500 group-active:text-red-400 transition-colors" />
        </button>

        {/* Ideas Button */}
        <button
          onClick={() => setIsIdeasOpen(true)}
          className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-yellow-500/20 active:bg-yellow-500/30 border border-white/10 hover:border-yellow-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
          title="Ideer & Forslag"
        >
          <HelpCircle className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-yellow-400 group-active:text-yellow-300 transition-colors" />
        </button>

        {/* Distance Button */}
        <button
          onClick={() => changeView('distance_tool')}
          className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-blue-500/20 active:bg-blue-500/30 border border-white/10 hover:border-blue-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
          title="Afstandsberegner"
        >
          <Ruler className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-blue-400 group-active:text-blue-300 transition-colors" />
        </button>

        {/* Calendar Button */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
        >
          <Calendar className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-battle-orange group-active:text-battle-orangeLight transition-colors" />
        </button>
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <ClaudeDevModal isOpen={isClaudeDevOpen} onClose={() => setIsClaudeDevOpen(false)} />
      <UsersManagement isOpen={isUsersOpen} onClose={() => setIsUsersOpen(false)} />
      <ClaudeAssistant isOpen={isClaudeAssistantOpen} onClose={() => setIsClaudeAssistantOpen(false)} />
      <IdeasModal isOpen={isIdeasOpen} onClose={() => setIsIdeasOpen(false)} />

      {/* Main Content Container - Responsive for all 5 modes */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-start pt-14 mobile-landscape:pt-10 tablet-portrait:pt-16 tablet-landscape:pt-12 desktop:pt-20 px-2 mobile-landscape:px-3 tablet-portrait:px-4 tablet-landscape:px-4 desktop:px-6 responsive-top-spacing safe-area-top">

        {/* Header Section - Responsive for all 5 modes */}
        <header className="w-full max-w-6xl mx-auto mb-3 mobile-landscape:mb-2 tablet-portrait:mb-6 tablet-landscape:mb-4 desktop:mb-10 relative flex flex-col items-center justify-center responsive-header">

          {/* Centered Title Content - Text centered, Icon absolute left */}
          <div className="text-center flex flex-col items-center">

            <div className="relative flex items-center justify-center mb-0.5 mobile-landscape:mb-0.5 tablet-portrait:mb-2 tablet-landscape:mb-1 desktop:mb-2">
               {/* Icon Positioned Absolute Left of the Title */}
               <div className="absolute right-full mr-2 mobile-landscape:mr-2 tablet-portrait:mr-4 tablet-landscape:mr-3 desktop:mr-6 text-battle-orange drop-shadow-[0_0_10px_rgba(255,102,0,0.5)] flex items-center">
                 <ViewIcon className="w-6 h-6 mobile-landscape:w-5 mobile-landscape:h-5 tablet-portrait:w-10 tablet-portrait:h-10 tablet-landscape:w-8 tablet-landscape:h-8 desktop:w-14 desktop:h-14" />
               </div>

               <h1 className="text-xl mobile-landscape:text-lg tablet-portrait:text-4xl tablet-landscape:text-3xl desktop:text-6xl font-black tracking-tighter uppercase responsive-title">
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
              <p className="text-battle-white/50 text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-lg tracking-[0.2em] uppercase mt-0.5 mobile-landscape:mt-0.5 tablet-portrait:mt-1 responsive-subtitle">
                {viewSubtitle}
              </p>
            )}
            <div className="h-0.5 w-12 mobile-landscape:w-10 tablet-portrait:w-24 tablet-landscape:w-20 desktop:w-32 desktop:h-1 bg-battle-orange mx-auto mt-2 mobile-landscape:mt-1.5 tablet-portrait:mt-4 tablet-landscape:mt-3 desktop:mt-6 rounded-full shadow-[0_0_15px_rgba(255,102,0,1)]"></div>
          </div>
        </header>

        {/* content */}
        <div className={`w-full max-w-6xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentView === 'distance_tool' ? (
            <DistanceTool />
          ) : currentView === 'teamrobin_packing_before' ? (
            <DynamicPackingList activity="teamrobin" listType="before" title="FØR OPGAVEN" />
          ) : currentView === 'teamrobin_packing_after' ? (
            <DynamicPackingList activity="teamrobin" listType="after" title="EFTER OPGAVEN" />
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
              videoIndex={TEAMCONSTRUCT_VIDEO_INDEX}
            />
          ) : currentView === 'teamconstruct_guide' ? (
            <TeamConstructGuide onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamconstruct_scorecard' ? (
            <TeamConstructScorecard />
          ) : currentView === 'teamconstruct_packing_afgang' ? (
            <DynamicPackingList activity="teamconstruct" listType="afgang" />
          ) : currentView === 'teamconstruct_packing_hjemkomst' ? (
            <DynamicPackingList activity="teamconstruct" listType="hjemkomst" />
          ) : currentView === 'teamcontrol_video' ? (
            <VideoPlayer
              title="TeamControl Video Guides"
              playlistId="PLq4wXYwkH9QaTPd62RD_rf3YSCw3eMdzr"
              videoIndex={TEAMCONTROL_VIDEO_INDEX}
            />
          ) : currentView === 'teamcontrol_guide' ? (
            <TeamControlGuide onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamcontrol_flybrix_manual' ? (
            <FlybrixManual />
          ) : currentView === 'teamcontrol_packing_afgang' ? (
            <DynamicPackingList activity="teamcontrol" listType="afgang" />
          ) : currentView === 'teamcontrol_packing_hjemkomst' ? (
            <DynamicPackingList activity="teamcontrol" listType="hjemkomst" />
          ) : currentView === 'teamcontrol_musik' ? (
            <div className="w-full max-w-2xl mx-auto px-2 tablet:px-4">
              <div className="bg-battle-grey/20 border border-green-500/30 rounded-xl tablet:rounded-2xl p-6 tablet:p-8 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 tablet:w-40 tablet:h-40 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50">
                    <Gamepad2 className="w-16 h-16 tablet:w-20 tablet:h-20 text-green-400" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl tablet:text-3xl font-bold text-white uppercase tracking-wider mb-2">Top Gun Anthem</h2>
                    <p className="text-sm text-gray-400">Afspil 5 min før FLYBRIX konkurrence</p>
                  </div>
                  <audio
                    controls
                    autoPlay={false}
                    className="w-full max-w-md"
                    style={{ filter: 'sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%)' }}
                  >
                    <source src="https://ilbjytyukicbssqftmma.supabase.co/storage/v1/object/public/guide-images/music/topgun-anthem.mp3" type="audio/mpeg" />
                    Din browser understøtter ikke audio afspilning.
                  </audio>
                </div>
              </div>
            </div>
          ) : currentView === 'teambox_video' ? (
            <VideoPlayer
              title="TeamBox Video Guides"
              playlistId="PLq4wXYwkH9QYNeIb2OD85T-zLjIkp6MIc"
            />
          ) : currentView === 'teambox_checklist' ? (
            <DynamicPackingList activity="teambox" listType="nulstil" title="NULSTIL BOX" enableTabs={true} trackCompletion={true} />
          ) : currentView === 'teambox_guide' ? (
            <TeamBoxGuide onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teambox_packing_afgang' ? (
            <DynamicPackingList activity="teambox" listType="afgang" />
          ) : currentView === 'teambox_packing_hjemkomst' ? (
            <DynamicPackingList activity="teambox" listType="hjemkomst" />
          ) : currentView === 'teambox_downloads' ? (
            <TeamBoxDownloads onBack={() => changeView('teambox')} />
          ) : currentView === 'teamlazer_video' ? (
            <VideoPlayer
              title="TeamLazer Video Guides"
              playlistId="PLq4wXYwkH9QbWM9SurCo-EWPJlCO03-vk"
              videoIndex={TEAMLAZER_VIDEO_INDEX}
            />
          ) : currentView === 'teamlazer_fejlsogning' ? (
            <VideoPlayer
              title="TeamLazer Fejlsøgning"
              playlistId="PLq4wXYwkH9QbWM9SurCo-EWPJlCO03-vk"
              videoIndex={TEAMLAZER_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamrobin_fejlsogning' ? (
            <VideoPlayer
              title="TeamRobin Fejlsøgning"
              videoIndex={TEAMROBIN_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamsegway_fejlsogning' ? (
            <VideoPlayer
              title="TeamSegway Fejlsøgning"
              videoIndex={TEAMSEGWAY_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamlazer_packing' ? (
            <DynamicPackingList activity="teamlazer" listType="before" />
          ) : currentView === 'teamsegway_packing' ? (
            <DynamicPackingList activity="teamsegway" listType="before" />
          ) : currentView === 'teamlazer_scorecard' ? (
            <LazerPointScoreboard />
          ) : currentView === 'fejlsogning_teamlazer' ? (
            <FejlsogningReport activity="teamlazer" />
          ) : currentView === 'fejlsogning_teamrobin' ? (
            <FejlsogningReport activity="teamrobin" />
          ) : currentView === 'fejlsogning_teamsegway' ? (
            <FejlsogningReport activity="teamsegway" />
          ) : currentView === 'fejlsogning_teamcontrol' ? (
            <FejlsogningReport activity="teamcontrol" />
          ) : currentView === 'fejlsogning_teamconstruct' ? (
            <FejlsogningReport activity="teamconstruct" />
          ) : currentView === 'fejlsogning_teamconnect' ? (
            <FejlsogningReport activity="teamconnect" />
          ) : currentView === 'fejlsogning_teambox' ? (
            <FejlsogningReport activity="teambox" />
          ) : currentView === 'fejlsogning_teamaction' ? (
            <FejlsogningReport activity="teamaction" />
          ) : currentView === 'fejlsogning_teamchallenge' ? (
            <FejlsogningReport activity="teamchallenge" />
          ) : currentView === 'fejlsogning_loquiz' ? (
            <FejlsogningReport activity="loquiz" />
          ) : currentView === 'fejlsogning_teamrace' ? (
            <FejlsogningReport activity="teamrace" />
          ) : currentView === 'teamrace_video' ? (
            <VideoPlayer
              title="TeamRace Video Guides"
              playlistId="PLq4wXYwkH9QZxzGDBGeMBMxWmyKKH2xKl"
              videoIndex={TEAMRACE_VIDEO_INDEX}
            />
          ) : currentView === 'teamrace_guide' ? (
            <TeamRaceGuide onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamrace_rccars' ? (
            <PDFViewer
              pdfUrl="https://shop.hoeco.at/explosionsdatein/pdf/76054-5_LaTraxTeton.pdf"
              title="LaTrax Teton Manual"
              totalPages={3}
            />
          ) : currentView === 'teamrace_packing_afgang' ? (
            <DynamicPackingList activity="teamrace" listType="afgang" />
          ) : currentView === 'teamrace_packing_hjemkomst' ? (
            <DynamicPackingList activity="teamrace" listType="hjemkomst" />
          ) : currentView === 'teamrace_packing_taske' ? (
            <DynamicPackingList activity="teamrace" listType="taske" title="TASKE - Sæbekasse Pakkeliste" />
          ) : currentView === 'teamrace_instructions' ? (
            <TeamRaceInstructions totalSlides={10} />
          ) : currentView === 'teamrace_scorecard' ? (
            <TeamRaceScorecard />
          ) : currentView === 'admin_reports' ? (
            <AdminReports />
          ) : currentView === 'admin_packing_editor' ? (
            <PackingListEditor />
          ) : currentView === 'office' ? (
            <div className="w-full max-w-4xl mx-auto px-1 mobile-landscape:px-2 tablet-portrait:px-4">
              <div className="grid grid-cols-2 gap-2 mobile-landscape:gap-1.5 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-4 responsive-office-grid">
                {[
                  { name: 'CrewControlCenter', color: 'red', borderColor: 'border-red-500', bgColor: 'bg-red-500/10', titleColor: 'text-red-400' },
                  { name: 'Office', color: 'green', borderColor: 'border-green-500', bgColor: 'bg-green-500/10', titleColor: 'text-green-400' },
                  { name: 'Economy', color: 'yellow', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-500/10', titleColor: 'text-yellow-400' },
                  { name: 'Google Tools', color: 'blue', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', titleColor: 'text-blue-400' }
                ].map((section) => {
                  const sectionLinks = currentLinks.filter(l => l.section === section.name);
                  // Hide sections with no links (e.g., Economy for non-admins)
                  if (sectionLinks.length === 0) return null;
                  return (
                    <div
                      key={section.name}
                      className={`rounded-lg border ${section.borderColor} ${section.bgColor} p-1.5 mobile-landscape:p-1 tablet-portrait:p-3 tablet-landscape:p-2 desktop:p-4`}
                    >
                      <h3 className={`text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-sm font-bold ${section.titleColor} uppercase tracking-widest mb-1.5 mobile-landscape:mb-1 tablet-portrait:mb-3 tablet-landscape:mb-2 desktop:mb-3 text-center`}>
                        {section.name}
                      </h3>
                      <div className="grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-4 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-1 mobile-landscape:gap-0.5 tablet-portrait:gap-2 tablet-landscape:gap-1.5 desktop:gap-2 justify-items-center">
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
            <div className={gridClass}>
              {currentLinks.map((link, index) => (
                <HubButton
                  key={link.id}
                  link={link}
                  index={index}
                  onClick={handleLinkClick}
                  draggable={currentView === 'main'}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
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