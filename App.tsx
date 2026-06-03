import React, { useState, useEffect, useCallback } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import {
  HUB_LINKS,
  OPGAVER_LINKS,
  GAMES_LINKS,
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
  TEAMLAZER_VIDEO_INDEX,
  TEAMCONSTRUCT_VIDEO_INDEX,
  TEAMCONTROL_VIDEO_INDEX,
  TEAMRACE_VIDEO_INDEX,
  TEAMLAZER_FEJLSOGNING_VIDEO_INDEX,
  TEAMROBIN_FEJLSOGNING_VIDEO_INDEX,
  TEAMSEGWAY_FEJLSOGNING_VIDEO_INDEX,
  TEAMPLAY_VIDEO_INDEX,
  TEAMTASTE_VIDEO_INDEX,
  TEAMCONNECT_VIDEO_INDEX,
  TEAMACTION_VIDEO_INDEX,
  TEAMCHALLENGE_VIDEO_INDEX,
  TEAMPLAY_FEJLSOGNING_VIDEO_INDEX,
  TEAMTASTE_FEJLSOGNING_VIDEO_INDEX,
  TEAMCHALLENGE_FEJLSOGNING_VIDEO_INDEX,
  TEAMCONNECT_FEJLSOGNING_VIDEO_INDEX,
  TEAMBOX_FEJLSOGNING_VIDEO_INDEX,
  TEAMCONTROL_FEJLSOGNING_VIDEO_INDEX,
  TEAMACTION_FEJLSOGNING_VIDEO_INDEX,
  TEAMCONSTRUCT_FEJLSOGNING_VIDEO_INDEX,
  TEAMRACE_FEJLSOGNING_VIDEO_INDEX,
  FLYBRIX_LINKS,
  TEAMRACE_LINKS,
  TEAMPLAY_LINKS,
  TEAMTASTE_LINKS,
} from './constants';
import HubButton from './components/HubButton';
import Clock, { DateDisplay } from './components/Clock';
import CalendarModal from './components/CalendarModal';
import DistanceTool from './components/DistanceTool';
import ClaudeDevModal from './components/ClaudeDevModal';
import LoginScreen from './components/LoginScreen';
import UsersManagement, { getPermissions, PermissionsConfig, getUserActivityPermissions } from './components/UsersManagement';
import ClaudeAssistant from './components/ClaudeAssistant';
import VideoPlayer from './components/VideoPlayer';
import LazerPointScoreboard from './components/LazerPointScoreboard';
import IdeasModal from './components/IdeasModal';
import TeamConstructGuide from './components/TeamConstructGuide';
import TeamBoxVideoGrid from './components/TeamBoxVideoGrid';
import TeamChallengeBoxVideos from './components/TeamChallengeBoxVideos';
import TeamBoxGuide from './components/TeamBoxGuide';
import TeamBoxDownloads from './components/TeamBoxDownloads';
import TeamConstructScorecard from './components/TeamConstructScorecard';
import TeamControlGuide from './components/TeamControlGuide';
import FlybrixManual from './components/FlybrixManual';
import FejlsogningReport from './components/FejlsogningReport';
import AdminReports from './components/AdminReports';
import LiveGPSPanel from './components/LiveGPSPanel';
import AdminGearOutOfService from './components/AdminGearOutOfService';
import AdminMaintenance from './components/AdminMaintenance';
import ZapierIntegration from './components/ZapierIntegration';
import ActivityGearList from './components/ActivityGearList';
import PDFViewer from './components/PDFViewer';
import TeamRaceGuide from './components/TeamRaceGuide';
import TeamRaceInstructions from './components/TeamRaceInstructions';
import TeamRaceScorecard from './components/TeamRaceScorecard';
import TeamRobinVideoGrid from './components/TeamRobinVideoGrid';
import TeamSegwayVideoGrid from './components/TeamSegwayVideoGrid';
import ActivityGuide from './components/ActivityGuide';
import JobInput from './components/JobInput';
import JobOverview from './components/JobOverview';
import InstructorSelect from './components/InstructorSelect';
import SessionReport from './components/SessionReport';
import MyJobs from './components/MyJobs';
import ActivityFileManager from './components/ActivityFileManager';
import SitemapModal from './components/SitemapModal';
import IntroAnimation from './components/IntroAnimation';
import GooglePhotosView from './components/GooglePhotosView';
import TeamLazerGearList from './components/TeamLazerGearList';
import TopbarJobSearch from './components/TopbarJobSearch';
import TodayJobsButton from './components/TodayJobsButton';
import InstructorLanding from './components/InstructorLanding';
import { DevicePreviewToolbar, DevicePreviewWrapper, DeviceType, Orientation, detectDevice } from './components/DevicePreview';
import { useAuth } from './contexts/AuthContext';
import { getUnreadFejlsogningCount, subscribeFejlsogningReports, TaskJob, ResolvedActivity } from './lib/supabase';
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
  Settings,
  Package,
  ListChecks,
  Map,
  Car,
  Users,
  Utensils,
  FolderOpen,
  Printer,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { HubLink } from './types';

type ViewState = 'main' | 'crew_hub' | 'opgaver' | 'games' | 'activities' | 'economy' | 'task_control' | 'tools' | 'code' | 'office' | 'team_challenge' | 'loquiz' | 'teamaction' | 'teamlazer' | 'teamrobin' | 'teamconnect' | 'teambox' | 'teamsegway' | 'teamcontrol' | 'teamconstruct' | 'teamrace' | 'teamplay' | 'teamtaste' | 'distance_tool' | 'teamlazer_justering' | 'teamlazer_fejlsogning' | 'teamrobin_fejlsogning' | 'teamsegway_fejlsogning' | 'teamrobin_video' | 'teamchallenge_video' | 'teamchallenge_boxvideos' | 'teamaction_video' | 'teamsegway_video' | 'teamconstruct_video' | 'teamconstruct_guide' | 'teamconstruct_scorecard' | 'teamcontrol_video' | 'teamcontrol_guide' | 'teamcontrol_flybrix' | 'teamcontrol_flybrix_manual' | 'teamcontrol_musik' | 'teambox_video' | 'teambox_guide' | 'teambox_downloads' | 'teamlazer_video' | 'teamlazer_scorecard' | 'teamlazer_frekvenser' | 'fejlsogning_teamlazer' | 'fejlsogning_teamrobin' | 'fejlsogning_teamsegway' | 'fejlsogning_teamcontrol' | 'fejlsogning_teamconstruct' | 'fejlsogning_teamconnect' | 'fejlsogning_teambox' | 'fejlsogning_teamaction' | 'fejlsogning_teamchallenge' | 'fejlsogning_loquiz' | 'fejlsogning_teamrace' | 'teamrace_video' | 'teamrace_scorecard' | 'teamrace_guide' | 'teamrace_rccars' | 'teamrace_instructions' | 'admin_reports' | 'teamlazer_guide' | 'teamrobin_guide' | 'teamsegway_guide' | 'teamconnect_guide' | 'teamaction_guide' | 'teamchallenge_guide' | 'teamplay_guide' | 'teamplay_video' | 'teamplay_fejlsogning' | 'fejlsogning_teamplay' | 'teamtaste_guide' | 'teamtaste_video' | 'teamtaste_fejlsogning' | 'fejlsogning_teamtaste' | 'teamchallenge_fejlsogning' | 'teamconnect_video' | 'teamconnect_fejlsogning' | 'teamaction_fejlsogning' | 'teambox_fejlsogning' | 'teamcontrol_fejlsogning' | 'teamconstruct_fejlsogning' | 'teamrace_fejlsogning' | 'job_input' | 'instructor_select' | 'job_overview' | 'session_report' | 'my_jobs' | 'teamplay_files' | 'teamtaste_files' | 'teamchallenge_files' | 'teamlazer_files' | 'teamrobin_files' | 'teamsegway_files' | 'teamconnect_files' | 'teambox_files' | 'teamcontrol_files' | 'teamaction_files' | 'teamconstruct_files' | 'teamrace_files' | 'google_photos' | 'teamlazer_gear' | 'livegps' | 'admin_oos' | 'admin_maintenance' | 'zapier_integration' | 'teamchallenge_gear' | 'teamrobin_gear' | 'teambox_gear' | 'teamconnect_gear' | 'teamplay_gear' | 'teamsegway_gear' | 'teamcontrol_gear' | 'teamconstruct_gear' | 'teamrace_gear' | 'teamtaste_gear' | 'teamaction_gear';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, profile, signOut, logPageVisit } = useAuth();
  // URL-backed view state — hver viewskift pushes til history så browser-back navigerer i appen
  const [currentViewRaw, setCurrentViewRaw] = useQueryState(
    'view',
    parseAsString.withDefault('main').withOptions({ history: 'push' })
  );
  const currentView = currentViewRaw as ViewState;
  const setCurrentView = (view: ViewState) => {
    setCurrentViewRaw(view === 'main' ? null : view);
  };
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isClaudeDevOpen, setIsClaudeDevOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isClaudeAssistantOpen, setIsClaudeAssistantOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introSeen'));
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem('introSeen', '1');
  }, []);
  const [fejlsogningCount, setFejlsogningCount] = useState(0);
  const [activeJob, setActiveJob] = useState<TaskJob | null>(null);
  const [activeJobActivities, setActiveJobActivities] = useState<ResolvedActivity[]>([]);
  const [activeInstructor, setActiveInstructor] = useState<{ name: string; id?: string } | null>(null);

  // Device Preview State
  const [previewDevice, setPreviewDevice] = useState<DeviceType | null>(null);
  const [previewOrientation, setPreviewOrientation] = useState<Orientation>('portrait');
  const [isPreviewActive, setIsPreviewActive] = useState(false);

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

  // Fejlsogning reports realtime subscription
  useEffect(() => {
    // Load initial count
    const loadInitialCount = async () => {
      const { count } = await getUnreadFejlsogningCount();
      setFejlsogningCount(count);
    };
    loadInitialCount();

    // Subscribe to realtime updates
    const channel = subscribeFejlsogningReports(({ count }) => {
      setFejlsogningCount(count);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Add dynamic badges to hub links (e.g., fejlsogning count)
  const enhanceHubLinksWithBadges = (links: HubLink[]): HubLink[] => {
    return links.map(link => {
      if (link.title === 'FEJLRAPPORTER' && fejlsogningCount > 0) {
        return {
          ...link,
          badge: fejlsogningCount.toString(),
          badgeColor: 'pink' as const
        };
      }
      return link;
    });
  };

  // Role-based access control - filter links based on user role and permissions
  const filterLinksByRole = (links: HubLink[]): HubLink[] => {
    if (!profile) return links;

    const rolePerms = permissions[profile.role as keyof PermissionsConfig];
    if (!rolePerms) return links;

    return links.filter(link => {
      // Landing page items
      if (link.title === 'MINE SESSIONS') return rolePerms.landing_admin;
      if (link.title === 'OFFICE') return rolePerms.landing_office;
      if (link.title === 'AKTIVITETER') return rolePerms.landing_activities;
      if (link.title === 'GAMES') return rolePerms.landing_activities;
      if (link.title === 'ADMIN') return rolePerms.landing_admin;
      if (link.title === 'FEJLRAPPORTER') return rolePerms.landing_admin;
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
    // External URLs (http/https) åbner i ny fane — bruges til at sende pakkelister
    // og pakkeliste-editor til check.eventday.dk
    if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
      return;
    }
    // URL-based navigation takes priority over title-based (e.g. scorecard links in Games view)
    if (link.url === '#teamlazer_scorecard') changeView('teamlazer_scorecard');
    else if (link.url === '#teamconstruct_scorecard') changeView('teamconstruct_scorecard');
    else if (link.url === '#teamrace_scorecard') changeView('teamrace_scorecard');
    // Title-based navigation for hub/activity links
    else if (link.title === 'MINE SESSIONS') changeView('opgaver');
    else if (link.title === 'AKTIVITETER') changeView('activities');
    else if (link.title === 'GAMES') { window.open('https://games.eventday.dk', '_blank'); return; }
    else if (link.title === 'ACTIVITIES') changeView('activities');
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
    else if (link.title === 'TEAMPLAY') changeView('teamplay');
    else if (link.title === 'TEAMTASTE') changeView('teamtaste');
    else if (link.title === 'DISTANCE' || link.url === '#distance_tool') changeView('distance_tool');
    else if (link.url === '#calendar' || link.title === 'UGEKALENDER') setIsCalendarOpen(true);
    else if (link.url === '#ideas') setIsIdeasOpen(true);
    else if (link.title === 'JUSTERING') changeView('teamlazer_justering');
    else if (link.url === '#teamrobin_video') changeView('teamrobin_video');
    else if (link.url === '#teamchallenge_guide') changeView('teamchallenge_guide');
    else if (link.url === '#teamchallenge_video') changeView('teamchallenge_video');
    else if (link.url === '#teamchallenge_boxvideos') changeView('teamchallenge_boxvideos');
    else if (link.url === '#teamaction_video') changeView('teamaction_video');
    else if (link.url === '#teamsegway_video') changeView('teamsegway_video');
    else if (link.url === '#teamconstruct_video') changeView('teamconstruct_video');
    else if (link.url === '#teamconstruct_guide') changeView('teamconstruct_guide');
    else if (link.url === '#teamconstruct_scorecard') changeView('teamconstruct_scorecard');
    else if (link.url === '#teamcontrol_video') changeView('teamcontrol_video');
    else if (link.url === '#teamcontrol_guide') changeView('teamcontrol_guide');
    else if (link.url === '#teamcontrol_flybrix') changeView('teamcontrol_flybrix');
    else if (link.url === '#teamcontrol_flybrix_manual') changeView('teamcontrol_flybrix_manual');
    else if (link.url === '#teamcontrol_musik') changeView('teamcontrol_musik');
    else if (link.url === '#teambox_video') changeView('teambox_video');
    else if (link.url === '#teambox_guide') changeView('teambox_guide');
    else if (link.url === '#teambox_downloads') changeView('teambox_downloads');
    else if (link.url === '#teamlazer_video') changeView('teamlazer_video');
    else if (link.url === '#teamlazer_scorecard') changeView('teamlazer_scorecard');
    else if (link.url === '#teamlazer_fejlsogning') changeView('teamlazer_fejlsogning');
    else if (link.url === '#teamlazer_frekvenser') changeView('teamlazer_frekvenser');
    else if (link.url === '#teamlazer_gear') changeView('teamlazer_gear');
    else if (link.url === '#teamlazer_guide') changeView('teamlazer_guide');
    else if (link.url === '#teamrobin_guide') changeView('teamrobin_guide');
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
    else if (link.url === '#teamrace_video') changeView('teamrace_video');
    else if (link.url === '#fejlsogning_teamrace') changeView('fejlsogning_teamrace');
    else if (link.url === '#teamrace_rccars') changeView('teamrace_rccars');
    else if (link.url === '#teamrace_instructions') changeView('teamrace_instructions');
    // TeamPlay views
    else if (link.url === '#teamplay_guide') changeView('teamplay_guide');
    else if (link.url === '#teamplay_video') changeView('teamplay_video');
    else if (link.url === '#teamplay_fejlsogning') changeView('teamplay_fejlsogning');
    else if (link.url === '#fejlsogning_teamplay') changeView('fejlsogning_teamplay');
    // TeamTaste views
    else if (link.url === '#teamtaste_guide') changeView('teamtaste_guide');
    else if (link.url === '#teamtaste_video') changeView('teamtaste_video');
    else if (link.url === '#teamtaste_fejlsogning') changeView('teamtaste_fejlsogning');
    else if (link.url === '#fejlsogning_teamtaste') changeView('fejlsogning_teamtaste');
    // TeamChallenge new views
    else if (link.url === '#teamchallenge_fejlsogning') changeView('teamchallenge_fejlsogning');
    // TeamConnect new views
    else if (link.url === '#teamconnect_video') changeView('teamconnect_video');
    else if (link.url === '#teamconnect_fejlsogning') changeView('teamconnect_fejlsogning');
    // TeamAction new views
    else if (link.url === '#teamaction_fejlsogning') changeView('teamaction_fejlsogning');
    // New fejlsogning views
    else if (link.url === '#teambox_fejlsogning') changeView('teambox_fejlsogning');
    else if (link.url === '#teamcontrol_fejlsogning') changeView('teamcontrol_fejlsogning');
    else if (link.url === '#teamconstruct_fejlsogning') changeView('teamconstruct_fejlsogning');
    else if (link.url === '#teamrace_fejlsogning') changeView('teamrace_fejlsogning');
    // Activity file manager views
    else if (link.url === '#teamplay_files') changeView('teamplay_files');
    else if (link.url === '#teamtaste_files') changeView('teamtaste_files');
    else if (link.url === '#teamchallenge_files') changeView('teamchallenge_files');
    else if (link.url === '#teamlazer_files') changeView('teamlazer_files');
    else if (link.url === '#teamrobin_files') changeView('teamrobin_files');
    else if (link.url === '#teamsegway_files') changeView('teamsegway_files');
    else if (link.url === '#teamconnect_files') changeView('teamconnect_files');
    else if (link.url === '#teambox_files') changeView('teambox_files');
    else if (link.url === '#teamcontrol_files') changeView('teamcontrol_files');
    else if (link.url === '#teamaction_files') changeView('teamaction_files');
    else if (link.url === '#teamconstruct_files') changeView('teamconstruct_files');
    else if (link.url === '#teamrace_files') changeView('teamrace_files');
    else if (link.url === '#job_input') changeView('job_input');
    else if (link.url === '#my_jobs') changeView('my_jobs');
    else if (link.url === '#code') changeView('code');
    else if (link.url === '#admin_reports') changeView('admin_reports');
    else if (link.url === '#livegps') changeView('livegps');
    else if (link.url === '#admin_oos') changeView('admin_oos');
    else if (link.url === '#admin_maintenance') changeView('admin_maintenance');
    else if (link.url === '#zapier_integration') changeView('zapier_integration');
    else if (link.url === '#teamchallenge_gear') changeView('teamchallenge_gear');
    else if (link.url === '#teamrobin_gear') changeView('teamrobin_gear');
    else if (link.url === '#teambox_gear') changeView('teambox_gear');
    else if (link.url === '#teamconnect_gear') changeView('teamconnect_gear');
    else if (link.url === '#teamplay_gear') changeView('teamplay_gear');
    else if (link.url === '#teamsegway_gear') changeView('teamsegway_gear');
    else if (link.url === '#teamcontrol_gear') changeView('teamcontrol_gear');
    else if (link.url === '#teamconstruct_gear') changeView('teamconstruct_gear');
    else if (link.url === '#teamrace_gear') changeView('teamrace_gear');
    else if (link.url === '#teamtaste_gear') changeView('teamtaste_gear');
    else if (link.url === '#teamaction_gear') changeView('teamaction_gear');
    else if (link.url === '#google_photos') changeView('google_photos');
    else if (link.title === 'CLAUDE') setIsClaudeDevOpen(true);
    else if (link.title === 'USERS') setIsUsersOpen(true);
  };

  const handleBackClick = () => {
    // Nested navigation logic
    if (currentView === 'crew_hub') {
      changeView('main');
    } else if (currentView === 'job_input') {
      changeView('opgaver');
    } else if (currentView === 'session_report') {
      changeView('opgaver');
    } else if (currentView === 'my_jobs') {
      changeView('opgaver');
    } else if (currentView === 'instructor_select') {
      changeView('job_input');
    } else if (currentView === 'job_overview') {
      changeView('instructor_select');
    } else if (currentView === 'opgaver' || currentView === 'games') {
      changeView('crew_hub');
    } else if (currentView === 'activities') {
      changeView('crew_hub');
    } else if (currentView === 'economy') {
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
    } else if (currentView === 'teamplay') {
      changeView('activities');
    } else if (currentView === 'teamtaste') {
      changeView('activities');
    } else if (currentView === 'teamrace_scorecard' || currentView === 'teamrace_guide' || currentView === 'teamrace_video' || currentView === 'fejlsogning_teamrace' || currentView === 'teamrace_rccars' || currentView === 'teamrace_instructions') {
      changeView('teamrace');
    } else if (currentView === 'distance_tool') {
      changeView('opgaver');
    } else if (currentView === 'task_control') {
      changeView('opgaver');
    } else if (currentView === 'code') {
      changeView('opgaver');
    } else if (currentView === 'admin_reports') {
      changeView('opgaver');
    } else if (currentView === 'zapier_integration') {
      changeView('opgaver');
    } else if (currentView === 'livegps') {
      changeView('task_control');
    } else if (currentView === 'admin_oos' || currentView === 'admin_maintenance') {
      changeView('task_control');
    } else if (currentView === 'teamchallenge_gear') {
      changeView('team_challenge');
    } else if (currentView === 'teamrobin_gear') {
      changeView('teamrobin');
    } else if (currentView === 'teambox_gear') {
      changeView('teambox');
    } else if (currentView === 'teamconnect_gear') {
      changeView('teamconnect');
    } else if (currentView === 'teamplay_gear') {
      changeView('teamplay');
    } else if (currentView === 'teamsegway_gear') {
      changeView('teamsegway');
    } else if (currentView === 'teamcontrol_gear') {
      changeView('teamcontrol');
    } else if (currentView === 'teamconstruct_gear') {
      changeView('teamconstruct');
    } else if (currentView === 'teamrace_gear') {
      changeView('teamrace');
    } else if (currentView === 'teamtaste_gear') {
      changeView('teamtaste');
    } else if (currentView === 'teamaction_gear') {
      changeView('teamaction');
    } else if (currentView === 'google_photos') {
      changeView('office');
    } else if (currentView === 'teamlazer_justering') {
      changeView('teamlazer_fejlsogning');
    } else if (currentView === 'teamlazer_fejlsogning') {
      changeView('teamlazer');
    } else if (currentView === 'teamlazer_frekvenser') {
      changeView('teamlazer');
    } else if (currentView === 'teamlazer_gear') {
      changeView('teamlazer');
    } else if (currentView === 'teamrobin_video') {
      changeView('teamrobin');
    } else if (currentView === 'teamchallenge_video') {
      changeView('team_challenge');
    } else if (currentView === 'teamchallenge_boxvideos') {
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
    } else if (currentView === 'teamcontrol_video') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_guide') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_flybrix') {
      changeView('teamcontrol');
    } else if (currentView === 'teamcontrol_flybrix_manual') {
      changeView('teamcontrol_flybrix');
    } else if (currentView === 'teamcontrol_musik') {
      changeView('teamcontrol');
    } else if (currentView === 'teambox_video') {
      changeView('teambox');
    } else if (currentView === 'teambox_guide') {
      changeView('teambox');
    } else if (currentView === 'teambox_downloads') {
      changeView('teambox');
    } else if (currentView === 'teamlazer_video') {
      changeView('teamlazer');
    } else if (currentView === 'teamlazer_guide') {
      changeView('teamlazer');
    } else if (currentView === 'teamrobin_guide') {
      changeView('teamrobin');
    } else if (currentView === 'teamsegway_guide') {
      changeView('teamsegway');
    } else if (currentView === 'teamconnect_guide') {
      changeView('teamconnect');
    } else if (currentView === 'teamaction_guide') {
      changeView('teamaction');
    } else if (currentView === 'teamchallenge_guide') {
      changeView('team_challenge');
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
    // TeamPlay back navigation
    } else if (currentView === 'teamplay_guide' || currentView === 'teamplay_video' || currentView === 'teamplay_fejlsogning' || currentView === 'fejlsogning_teamplay') {
      changeView('teamplay');
    // TeamTaste back navigation
    } else if (currentView === 'teamtaste_guide' || currentView === 'teamtaste_video' || currentView === 'teamtaste_fejlsogning' || currentView === 'fejlsogning_teamtaste') {
      changeView('teamtaste');
    // TeamChallenge new back navigation
    } else if (currentView === 'teamchallenge_fejlsogning') {
      changeView('team_challenge');
    // TeamConnect new back navigation
    } else if (currentView === 'teamconnect_video' || currentView === 'teamconnect_fejlsogning') {
      changeView('teamconnect');
    // TeamAction new back navigation
    } else if (currentView === 'teamaction_fejlsogning') {
      changeView('teamaction');
    // New fejlsogning back navigation
    } else if (currentView === 'teambox_fejlsogning') {
      changeView('teambox');
    } else if (currentView === 'teamcontrol_fejlsogning') {
      changeView('teamcontrol');
    } else if (currentView === 'teamconstruct_fejlsogning') {
      changeView('teamconstruct');
    } else if (currentView === 'teamrace_fejlsogning') {
      changeView('teamrace');
    // Activity file manager back navigation
    } else if (currentView === 'teamplay_files') {
      changeView('teamplay');
    } else if (currentView === 'teamtaste_files') {
      changeView('teamtaste');
    } else if (currentView === 'teamchallenge_files') {
      changeView('team_challenge');
    } else if (currentView === 'teamlazer_files') {
      changeView('teamlazer');
    } else if (currentView === 'teamrobin_files') {
      changeView('teamrobin');
    } else if (currentView === 'teamsegway_files') {
      changeView('teamsegway');
    } else if (currentView === 'teamconnect_files') {
      changeView('teamconnect');
    } else if (currentView === 'teambox_files') {
      changeView('teambox');
    } else if (currentView === 'teamcontrol_files') {
      changeView('teamcontrol');
    } else if (currentView === 'teamaction_files') {
      changeView('teamaction');
    } else if (currentView === 'teamconstruct_files') {
      changeView('teamconstruct');
    } else if (currentView === 'teamrace_files') {
      changeView('teamrace');
    } else {
      changeView('crew_hub');
    }
  };

  let currentLinks: HubLink[] = [];
  let viewTitle = '';
  let viewSubtitle = '';
  let ViewIcon = ShieldCheck;

  // Determine content based on view
  switch (currentView) {
    case 'opgaver':
      currentLinks = OPGAVER_LINKS;
      viewTitle = 'MINE SESSIONS';
      viewSubtitle = 'Mine Opgaver';
      ViewIcon = ClipboardList;
      break;
    case 'games':
      currentLinks = GAMES_LINKS;
      viewTitle = 'GAMES';
      viewSubtitle = 'Spil Platforme';
      ViewIcon = Trophy;
      break;
    case 'activities':
      currentLinks = filterActivitiesByRole(ACTIVITY_LINKS);
      viewTitle = 'AKTIVITETER';
      viewSubtitle = 'Alle Aktiviteter';
      ViewIcon = Gamepad2;
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
    case 'zapier_integration':
      currentLinks = [];
      viewTitle = 'ZAPIER';
      viewSubtitle = 'Data Integration';
      ViewIcon = Zap;
      break;
    case 'google_photos':
      currentLinks = [];
      viewTitle = 'GOOGLE PHOTOS';
      viewSubtitle = 'Albums & Billeder';
      ViewIcon = Camera;
      break;
    case 'livegps':
      currentLinks = [];
      viewTitle = 'LIVEGPS';
      viewSubtitle = 'GPS Tracking & Enheder';
      ViewIcon = Navigation;
      break;
    case 'admin_oos':
      currentLinks = [];
      viewTitle = 'UDE AF DRIFT';
      viewSubtitle = 'Gear ude af drift';
      ViewIcon = AlertTriangle;
      break;
    case 'admin_maintenance':
      currentLinks = [];
      viewTitle = 'VEDLIGEHOLDELSE';
      viewSubtitle = 'Maintenance Overview';
      ViewIcon = Wrench;
      break;
    case 'teamchallenge_gear':
      currentLinks = [];
      viewTitle = 'TEAMCHALLENGE GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamrobin_gear':
      currentLinks = [];
      viewTitle = 'TEAMROBIN GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teambox_gear':
      currentLinks = [];
      viewTitle = 'TEAMBOX GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamconnect_gear':
      currentLinks = [];
      viewTitle = 'TEAMCONNECT GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamplay_gear':
      currentLinks = [];
      viewTitle = 'TEAMPLAY GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamsegway_gear':
      currentLinks = [];
      viewTitle = 'TEAMSEGWAY GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamcontrol_gear':
      currentLinks = [];
      viewTitle = 'TEAMCONTROL GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamconstruct_gear':
      currentLinks = [];
      viewTitle = 'TEAMCONSTRUCT GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamrace_gear':
      currentLinks = [];
      viewTitle = 'TEAMRACE GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamtaste_gear':
      currentLinks = [];
      viewTitle = 'TEAMTASTE GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'teamaction_gear':
      currentLinks = [];
      viewTitle = 'TEAMACTION GEAR';
      viewSubtitle = 'Gear & Udstyr';
      ViewIcon = ClipboardList;
      break;
    case 'job_input':
      currentLinks = [];
      viewTitle = 'SESSION';
      viewSubtitle = 'Indtast Session ID';
      ViewIcon = Briefcase;
      break;
    case 'session_report':
      currentLinks = [];
      viewTitle = 'SESSION RAPPORT';
      viewSubtitle = activeJob?.client_name ? `#${activeJob.short_code} — ${activeJob.client_name}` : '';
      ViewIcon = Briefcase;
      break;
    case 'my_jobs':
      currentLinks = [];
      viewTitle = 'MINE OPGAVER';
      viewSubtitle = 'Tildelte sessioner';
      ViewIcon = Briefcase;
      break;
    case 'instructor_select':
      currentLinks = [];
      viewTitle = 'INSTRUKTØR';
      viewSubtitle = activeJob?.client_name || 'Vælg Instruktør';
      ViewIcon = Users;
      break;
    case 'job_overview':
      currentLinks = [];
      viewTitle = 'OPGAVE';
      viewSubtitle = activeJob?.client_name ? `${activeJob.client_name}${activeInstructor ? ` — ${activeInstructor.name}` : ''}` : '';
      ViewIcon = Briefcase;
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
    case 'teambox_guide':
      currentLinks = [];
      viewTitle = 'INSTRUKTØRGUIDE';
      viewSubtitle = 'TeamBox';
      ViewIcon = Map;
      break;
    case 'teambox_downloads':
      currentLinks = [];
      viewTitle = 'DOWNLOADS';
      viewSubtitle = 'TeamBox Filer';
      ViewIcon = Package;
      break;
    // Activity File Manager views
    case 'teamplay_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamPlay';
      ViewIcon = FolderOpen;
      break;
    case 'teamtaste_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamTaste';
      ViewIcon = FolderOpen;
      break;
    case 'teamchallenge_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamChallenge';
      ViewIcon = FolderOpen;
      break;
    case 'teamlazer_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamLazer';
      ViewIcon = FolderOpen;
      break;
    case 'teamrobin_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamRobin';
      ViewIcon = FolderOpen;
      break;
    case 'teamsegway_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamSegway';
      ViewIcon = FolderOpen;
      break;
    case 'teamconnect_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamConnect';
      ViewIcon = FolderOpen;
      break;
    case 'teambox_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamBox';
      ViewIcon = FolderOpen;
      break;
    case 'teamcontrol_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamControl';
      ViewIcon = FolderOpen;
      break;
    case 'teamaction_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamAction';
      ViewIcon = FolderOpen;
      break;
    case 'teamconstruct_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamConstruct';
      ViewIcon = FolderOpen;
      break;
    case 'teamrace_files':
      currentLinks = [];
      viewTitle = 'FILER';
      viewSubtitle = 'TeamRace';
      ViewIcon = FolderOpen;
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
    case 'teamplay':
      currentLinks = TEAMPLAY_LINKS;
      viewTitle = 'TEAMPLAY';
      viewSubtitle = '';
      ViewIcon = Users;
      break;
    case 'teamtaste':
      currentLinks = TEAMTASTE_LINKS;
      viewTitle = 'TEAMTASTE';
      viewSubtitle = '';
      ViewIcon = Utensils;
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
    case 'teamlazer_frekvenser':
      currentLinks = [];
      viewTitle = 'FREKVENSER';
      viewSubtitle = 'TeamLazer Frekvens Guide';
      ViewIcon = Zap;
      break;
    case 'teamlazer_gear':
      currentLinks = [];
      viewTitle = 'GEAR OVERSIGT';
      viewSubtitle = 'Display & Kaster';
      ViewIcon = ClipboardList;
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
    case 'teamchallenge_boxvideos':
      currentLinks = [];
      viewTitle = 'BOKSE';
      viewSubtitle = 'Gennemgang af Bokse';
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
    case 'teamlazer_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamLazer Guides';
      ViewIcon = Zap;
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
    case 'teamlazer_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamLazer';
      ViewIcon = Map;
      break;
    case 'teamrobin_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamRobin';
      ViewIcon = Map;
      break;
    case 'teamsegway_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamSegway';
      ViewIcon = Map;
      break;
    case 'teamconnect_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamConnect';
      ViewIcon = Map;
      break;
    case 'teamaction_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamAction';
      ViewIcon = Map;
      break;
    case 'teamchallenge_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamChallenge';
      ViewIcon = Map;
      break;
    // TeamPlay views
    case 'teamplay_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamPlay';
      ViewIcon = Map;
      break;
    case 'teamplay_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamPlay Guides';
      ViewIcon = Gamepad2;
      break;
    case 'teamplay_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamPlay Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamplay':
      currentLinks = [];
      viewTitle = 'FEJL & MANGLER';
      viewSubtitle = 'TeamPlay';
      ViewIcon = Wrench;
      break;
    // TeamTaste views
    case 'teamtaste_guide':
      currentLinks = [];
      viewTitle = 'CREW GUIDE';
      viewSubtitle = 'TeamTaste';
      ViewIcon = Map;
      break;
    case 'teamtaste_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamTaste Guides';
      ViewIcon = Utensils;
      break;
    case 'teamtaste_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamTaste Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'fejlsogning_teamtaste':
      currentLinks = [];
      viewTitle = 'FEJL & MANGLER';
      viewSubtitle = 'TeamTaste';
      ViewIcon = Wrench;
      break;
    // TeamChallenge new views
    case 'teamchallenge_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamChallenge Troubleshooting';
      ViewIcon = Wrench;
      break;
    // TeamConnect new views
    case 'teamconnect_video':
      currentLinks = [];
      viewTitle = 'VIDEO';
      viewSubtitle = 'TeamConnect Guides';
      ViewIcon = Users;
      break;
    case 'teamconnect_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamConnect Troubleshooting';
      ViewIcon = Wrench;
      break;
    // TeamAction new views
    case 'teamaction_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamAction Troubleshooting';
      ViewIcon = Wrench;
      break;
    // New fejlsogning views
    case 'teambox_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamBox Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'teamcontrol_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamControl Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'teamconstruct_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamConstruct Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'teamrace_fejlsogning':
      currentLinks = [];
      viewTitle = 'FEJLSØGNING';
      viewSubtitle = 'TeamRace Troubleshooting';
      ViewIcon = Wrench;
      break;
    case 'crew_hub':
      // CREW-hub'en (de fire hovedkategorier). Flyttet hertil fra 'main', som
      // nu viser instruktør-forsiden. Samme indhold/titel som den gamle forside.
      currentLinks = filterLinksByRole(HUB_LINKS);
      viewTitle = 'TEAMBATTLE';
      viewSubtitle = 'Crew Command Center';
      ViewIcon = ShieldCheck;
      break;
    case 'main':
    default:
      // Main view: just 2 buttons (ControlCenter + Office), filtered by role
      currentLinks = filterLinksByRole(HUB_LINKS);
      viewTitle = 'TEAMBATTLE';
      viewSubtitle = 'Crew Command Center';
      ViewIcon = ShieldCheck;
      break;
  }

  // Grid layout logic - Responsive for all 5 modes
  // Default grid for sub-pages
  let gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-5xl mx-auto responsive-activities-grid";

  if (currentView === 'main' || currentView === 'crew_hub') {
    // Main view: 2x2 grid layout
    gridClass = "grid grid-cols-2 gap-3 mobile-landscape:gap-3 tablet-portrait:gap-6 tablet-landscape:gap-5 desktop:gap-8 max-w-md tablet-portrait:max-w-xl tablet-landscape:max-w-2xl desktop:max-w-3xl mx-auto justify-items-center";
  } else if (currentView === 'opgaver') {
    // Opgaver: standard button grid like activities
    gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-4 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-3xl mx-auto";
  } else if (currentView === 'games') {
    // Games: sectioned layout (handled in custom render)
    gridClass = "";
  } else if (currentView === 'activities') {
    // Activities: responsive grid for 11 items
    gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-4 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-4 desktop:grid-cols-4 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-5xl mx-auto responsive-activities-grid";
  } else if (currentView === 'office') {
    // Office: responsive sections grid
    gridClass = "grid grid-cols-2 mobile-landscape:grid-cols-2 tablet-portrait:grid-cols-2 tablet-landscape:grid-cols-2 desktop:grid-cols-2 gap-2 mobile-landscape:gap-2 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-6 justify-items-center max-w-6xl mx-auto responsive-office-grid";
  }

  return (
    <div className="min-h-screen w-full bg-battle-black text-white selection:bg-battle-orange selection:text-white overflow-x-hidden flex flex-col relative">

      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

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

      {/* Top Left - Back Button + User Info + Logout */}
      <div className="absolute top-2 left-2 mobile-landscape:top-1.5 mobile-landscape:left-1.5 tablet-portrait:top-4 tablet-portrait:left-4 tablet-landscape:top-3 tablet-landscape:left-3 desktop:top-8 desktop:left-8 z-50 safe-area-top safe-area-left flex items-center gap-1.5">
        {/* Logout Button - leftmost */}
        <button
          onClick={signOut}
          className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-red-500/20 active:bg-red-500/30 border border-white/10 hover:border-red-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
          title="Log ud"
        >
          <LogOut className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-red-500 group-active:text-red-400 transition-colors" />
        </button>

        {/* User Info */}
        <div className="hidden tablet-portrait:flex items-center gap-2 bg-battle-grey/50 border border-white/10 rounded-full px-3 py-1.5 tablet-portrait:px-4 tablet-portrait:py-2">
          <User className="w-3.5 h-3.5 tablet-portrait:w-4 tablet-portrait:h-4 text-gray-400" />
          <span className="text-xs tablet-portrait:text-sm text-gray-300 max-w-[100px] tablet-portrait:max-w-[150px] truncate">{profile?.name || profile?.email}</span>
          <span className={`text-[10px] tablet-portrait:text-xs px-1.5 tablet-portrait:px-2 py-0.5 rounded-full ${
            profile?.role === 'ADMIN' ? 'bg-red-500/20 text-white' :
            profile?.role === 'GAMEMASTER' ? 'bg-purple-500/20 text-purple-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {profile?.role}
          </span>
        </div>

        {/* Back button - only when not on main */}
        {currentView !== 'main' && (
          <button
            onClick={handleBackClick}
            className="group flex items-center justify-center w-10 h-10 mobile-landscape:w-9 mobile-landscape:h-9 tablet-portrait:w-12 tablet-portrait:h-12 tablet-landscape:w-11 tablet-landscape:h-11 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-battle-orange/20 active:bg-battle-orange/30 border border-white/10 hover:border-battle-orange text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
            title="Return"
          >
            <House className="w-5 h-5 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-6 tablet-portrait:h-6 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-battle-orange group-active:text-battle-orange transition-colors" />
          </button>
        )}

        {/* Instructor Badge */}
        {activeInstructor && (
          <div className="flex items-center gap-1 bg-battle-orange/15 border border-battle-orange/30 rounded-full px-2 py-1 tablet-portrait:px-3 tablet-portrait:py-1.5">
            <User className="w-3 h-3 tablet-portrait:w-4 tablet-portrait:h-4 text-battle-orange" />
            <span className="text-[10px] tablet-portrait:text-xs text-battle-orange font-bold uppercase truncate max-w-[80px] tablet-portrait:max-w-[120px]">
              {activeInstructor.name}
            </span>
          </div>
        )}
      </div>

      {/* Center Top Clock */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Clock showVersion={profile?.role === 'ADMIN' || profile?.role === 'GAMEMASTER'} />
      </div>

      {/* Top Right - All controls */}
      <div className="absolute top-2 right-2 mobile-landscape:top-1.5 mobile-landscape:right-1.5 tablet-portrait:top-4 tablet-portrait:right-4 tablet-landscape:top-3 tablet-landscape:right-3 desktop:top-8 desktop:right-8 z-50 flex items-center gap-1.5 mobile-landscape:gap-1 tablet-portrait:gap-2 tablet-landscape:gap-2 desktop:gap-3 safe-area-top safe-area-right">
        {/* Sitemap Button - Admin Only */}
        {profile?.role === 'ADMIN' && (
          <button
            onClick={() => setIsSitemapOpen(true)}
            className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-white/10 hover:border-emerald-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
            title="Sitemap"
          >
            <MapPin className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-emerald-400 group-active:text-emerald-300 transition-colors" />
          </button>
        )}

        {/* Admin Panel Button - Admin Only */}
        {profile?.role === 'ADMIN' && (
          <button
            onClick={() => changeView('task_control')}
            className="group flex items-center justify-center w-9 h-9 mobile-landscape:w-8 mobile-landscape:h-8 tablet-portrait:w-11 tablet-portrait:h-11 tablet-landscape:w-10 tablet-landscape:h-10 desktop:w-14 desktop:h-14 bg-battle-grey/50 hover:bg-red-500/20 active:bg-red-500/30 border border-white/10 hover:border-red-500 text-white rounded-full transition-all duration-200 touch-manipulation touch-target"
            title="Admin"
          >
            <Settings className="w-4 h-4 mobile-landscape:w-4 mobile-landscape:h-4 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-5 tablet-landscape:h-5 desktop:w-7 desktop:h-7 group-hover:text-red-400 group-active:text-red-300 transition-colors" />
          </button>
        )}

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

        {/* Today's jobs button */}
        <TodayJobsButton
          onSelectJob={(job, activities) => {
            setActiveJob(job);
            setActiveJobActivities(activities);
            setActiveInstructor(null);
            changeView('session_report');
          }}
        />

        {/* Job ID search - far right */}
        <TopbarJobSearch
          onJobLoaded={(job, activities) => {
            setActiveJob(job);
            setActiveJobActivities(activities);
            setActiveInstructor(null);
            changeView('session_report');
          }}
        />
      </div>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <ClaudeDevModal isOpen={isClaudeDevOpen} onClose={() => setIsClaudeDevOpen(false)} />
      <UsersManagement isOpen={isUsersOpen} onClose={() => setIsUsersOpen(false)} />
      <ClaudeAssistant isOpen={isClaudeAssistantOpen} onClose={() => setIsClaudeAssistantOpen(false)} />
      <IdeasModal isOpen={isIdeasOpen} onClose={() => setIsIdeasOpen(false)} />
      <SitemapModal isOpen={isSitemapOpen} onClose={() => setIsSitemapOpen(false)} onNavigate={(view) => changeView(view as ViewState)} currentView={currentView} />

      {/* Main Content Container - Responsive for all 5 modes */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-start pt-14 mobile-landscape:pt-10 tablet-portrait:pt-16 tablet-landscape:pt-12 desktop:pt-20 px-2 mobile-landscape:px-3 tablet-portrait:px-4 tablet-landscape:px-4 desktop:px-6 responsive-top-spacing safe-area-top">

        {/* Header Section - Responsive for all 5 modes */}
        <header className="w-full max-w-6xl mx-auto mb-3 mobile-landscape:mb-2 tablet-portrait:mb-6 tablet-landscape:mb-4 desktop:mb-10 relative flex flex-col items-center justify-center responsive-header">

          {/* Centered Title Content - Text centered, Icon absolute left */}
          <div className="text-center flex flex-col items-center">

            <div className="relative flex items-center justify-center mb-0.5 mobile-landscape:mb-0.5 tablet-portrait:mb-2 tablet-landscape:mb-1 desktop:mb-2">
               {/* Icon Positioned Absolute Left of the Title */}
               <div className={`absolute right-full mr-2 mobile-landscape:mr-2 tablet-portrait:mr-4 tablet-landscape:mr-3 desktop:mr-6 flex items-center ${viewTitle === 'FEJLRAPPORT' || viewTitle === 'FEJLRAPPORTER' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-battle-orange drop-shadow-[0_0_10px_rgba(255,102,0,0.5)]'}`}>
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
                ) : viewTitle === 'FEJLRAPPORT' || viewTitle === 'FEJLRAPPORTER' ? (
                  <span className="text-yellow-400">{viewTitle}</span>
                ) : (
                  <span className="text-battle-orange">{viewTitle}</span>
                )}
              </h1>
            </div>

            {currentView === 'main' ? (
              <>
                <DateDisplay />
                <p className="text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-lg tracking-[0.2em] uppercase mt-0.5 mobile-landscape:mt-0.5 tablet-portrait:mt-1 responsive-subtitle">
                  <span className="text-white">CREW COM</span><span className="text-battle-orange">MAND CENTER</span>
                </p>
              </>
            ) : (
              <>
                <DateDisplay />
                {viewSubtitle && (
                  <p className="text-battle-white/50 text-[10px] mobile-landscape:text-[9px] tablet-portrait:text-sm tablet-landscape:text-xs desktop:text-lg tracking-[0.2em] uppercase mt-0.5 mobile-landscape:mt-0.5 tablet-portrait:mt-1 responsive-subtitle">
                    {viewSubtitle}
                  </p>
                )}
              </>
            )}
            <div className="h-0.5 w-12 mobile-landscape:w-10 tablet-portrait:w-24 tablet-landscape:w-20 desktop:w-32 desktop:h-1 bg-battle-orange mx-auto mt-2 mobile-landscape:mt-1.5 tablet-portrait:mt-4 tablet-landscape:mt-3 desktop:mt-6 rounded-full shadow-[0_0_15px_rgba(255,102,0,1)]"></div>
          </div>

        </header>

        {/* content */}
        <div className={`w-full max-w-6xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {currentView === 'distance_tool' ? (
            <DistanceTool />
          ) : currentView === 'teamlazer_justering' ? (
            <VideoPlayer
              title="TeamLazer Justering"
              videoId="ZkkqiV-uRRg"
            />
          ) : currentView === 'teamrobin_video' ? (
            <TeamRobinVideoGrid onBack={() => changeView('teamrobin')} />
          ) : currentView === 'teamchallenge_video' ? (
            <VideoPlayer
              title="TeamChallenge Video Guides"
              playlistId="PLq4wXYwkH9QYW4rRwBBM8xUUf_9yg6l6Z"
            />
          ) : currentView === 'teamchallenge_boxvideos' ? (
            <TeamChallengeBoxVideos onBack={() => changeView('team_challenge')} />
          ) : currentView === 'teamaction_video' ? (
            <VideoPlayer
              title="TeamAction Video Guides"
              playlistId="PLq4wXYwkH9QY14CVT_nnytn_HMX_BTnyR"
            />
          ) : currentView === 'teamsegway_video' ? (
            <TeamSegwayVideoGrid onBack={() => changeView('teamsegway')} />
          ) : currentView === 'teamconstruct_video' ? (
            <VideoPlayer
              title="TeamConstruct Video Guides"
              playlistId="PLq4wXYwkH9QaJWSzrKmj7NCWdPgJD0_zd"
              videoIndex={TEAMCONSTRUCT_VIDEO_INDEX}
            />
          ) : currentView === 'teamconstruct_guide' ? (
            <ActivityGuide activity="teamconstruct" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamconstruct_scorecard' ? (
            <TeamConstructScorecard />
          ) : currentView === 'teamcontrol_video' ? (
            <VideoPlayer
              title="TeamControl Video Guides"
              playlistId="PLq4wXYwkH9QaTPd62RD_rf3YSCw3eMdzr"
              videoIndex={TEAMCONTROL_VIDEO_INDEX}
            />
          ) : currentView === 'teamcontrol_guide' ? (
            <ActivityGuide activity="teamcontrol" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamcontrol_flybrix_manual' ? (
            <FlybrixManual />
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
            <TeamBoxVideoGrid onBack={() => changeView('teambox')} />
          ) : currentView === 'teambox_guide' ? (
            <ActivityGuide activity="teambox" onNavigate={(view) => changeView(view as ViewState)} />
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
          ) : currentView === 'teamlazer_frekvenser' ? (
            <div className="w-full max-w-6xl mx-auto px-4 py-6">
              <div className="bg-battle-grey/50 rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 text-center">
                  Gevær Frekvens - Dipswitch Indstillinger
                </h2>
                <div className="bg-white rounded-xl p-6 overflow-auto">
                  {[
                    { name: 'SET 1', gates: [
                      { g: 'G1', rows: [[0,1],[1,0],[0,1],[0,1]] },
                      { g: 'G2', rows: [[0,1],[0,1],[1,0],[0,1]] },
                      { g: 'G3', rows: [[0,1],[1,0],[1,0],[0,1]] },
                      { g: 'G4', rows: [[1,0],[0,1],[0,1],[1,0]] },
                      { g: 'G5', rows: [[0,1],[1,0],[0,1],[1,0]] },
                    ]},
                    { name: 'SET 2', gates: [
                      { g: 'G1', rows: [[0,1],[0,1],[0,1],[0,1]] },
                      { g: 'G2', rows: [[1,0],[1,0],[1,0],[1,0]] },
                      { g: 'G3', rows: [[1,0],[1,0],[0,1],[0,1]] },
                      { g: 'G4', rows: [[0,1],[0,1],[1,0],[1,0]] },
                      { g: 'G5', rows: [[1,0],[0,1],[1,0],[0,1]] },
                    ]},
                    { name: 'SET 3', gates: [
                      { g: 'G1', rows: [[0,1],[0,1],[0,1],[1,0]] },
                      { g: 'G2', rows: [[0,1],[1,0],[1,0],[1,0]] },
                      { g: 'G3', rows: [[1,0],[1,0],[1,0],[0,1]] },
                      { g: 'G4', rows: [[1,0],[1,0],[0,1],[1,0]] },
                      { g: 'G5', rows: [[1,0],[0,1],[1,0],[1,0]] },
                    ]},
                  ].map((set) => (
                    <div key={set.name} className="mb-8 last:mb-0">
                      <div className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
                        {set.name}
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {set.gates.map((gate) => (
                          <div key={gate.g} className="flex flex-col items-center">
                            <div className="text-xs font-bold text-gray-700 mb-1.5">{gate.g}</div>
                            <div className="border-2 border-gray-800 rounded">
                              {gate.rows.map((row, ri) => (
                                <div key={ri} className="flex border-b border-gray-800 last:border-b-0">
                                  {row.map((val, ci) => (
                                    <div
                                      key={ci}
                                      className={`w-10 h-8 flex items-center justify-center text-sm font-bold border-r border-gray-800 last:border-r-0 ${
                                        val === 1 ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-500'
                                      }`}
                                    >
                                      {val}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-500 text-xs">
                    GUL = 1 | GRÅ = 0
                  </p>
                  <button
                    onClick={() => {
                      const sets = [
                        { name: 'SET 1', gates: [
                          { g: 'G1', rows: [[0,1],[1,0],[0,1],[0,1]] },
                          { g: 'G2', rows: [[0,1],[0,1],[1,0],[0,1]] },
                          { g: 'G3', rows: [[0,1],[1,0],[1,0],[0,1]] },
                          { g: 'G4', rows: [[1,0],[0,1],[0,1],[1,0]] },
                          { g: 'G5', rows: [[0,1],[1,0],[0,1],[1,0]] },
                        ]},
                        { name: 'SET 2', gates: [
                          { g: 'G1', rows: [[0,1],[0,1],[0,1],[0,1]] },
                          { g: 'G2', rows: [[1,0],[1,0],[1,0],[1,0]] },
                          { g: 'G3', rows: [[1,0],[1,0],[0,1],[0,1]] },
                          { g: 'G4', rows: [[0,1],[0,1],[1,0],[1,0]] },
                          { g: 'G5', rows: [[1,0],[0,1],[1,0],[0,1]] },
                        ]},
                        { name: 'SET 3', gates: [
                          { g: 'G1', rows: [[0,1],[0,1],[0,1],[1,0]] },
                          { g: 'G2', rows: [[0,1],[1,0],[1,0],[1,0]] },
                          { g: 'G3', rows: [[1,0],[1,0],[1,0],[0,1]] },
                          { g: 'G4', rows: [[1,0],[1,0],[0,1],[1,0]] },
                          { g: 'G5', rows: [[1,0],[0,1],[1,0],[1,0]] },
                        ]},
                      ];
                      const gateHtml = (gate: { g: string; rows: number[][] }) =>
                        `<div style="display:flex;flex-direction:column;align-items:center">
                          <div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:4mm;text-align:center;min-width:30mm">${gate.g}</div>
                          <div style="display:flex;flex-direction:column;border:2px solid #333">
                            ${gate.rows.map((row, ri) =>
                              `<div style="display:flex;${ri < gate.rows.length - 1 ? 'border-bottom:1px solid #333' : ''}">
                                ${row.map((v, ci) =>
                                  `<div style="width:15mm;height:12mm;${ci === 0 ? 'border-right:1px solid #333;' : ''}display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;background:${v === 1 ? '#FFD700' : '#e8e8e8'};color:${v === 1 ? '#000' : '#333'}">${v}</div>`
                                ).join('')}
                              </div>`
                            ).join('')}
                          </div>
                        </div>`;
                      const setsHtml = sets.map(set =>
                        `<div style="margin-bottom:10mm">
                          <div style="font-size:16px;font-weight:bold;color:#333;margin-bottom:6mm;padding-bottom:2mm;border-bottom:1px solid #999">${set.name}</div>
                          <div style="display:flex;gap:8mm;align-items:flex-start;flex-wrap:wrap">
                            ${set.gates.map(g => gateHtml(g)).join('')}
                          </div>
                        </div>`
                      ).join('');
                      const html = `<!DOCTYPE html><html lang="da"><head><meta charset="UTF-8"><title>Gevær Frekvens - Dipswitch Indstillinger</title><style>@page{size:A4 landscape;margin:8mm}*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}body{font-family:Arial,sans-serif;background:white;padding:8mm;width:277mm;height:190mm;overflow:hidden}</style></head><body>
                        <div style="text-align:center;margin-bottom:8mm;border-bottom:2px solid #333;padding-bottom:4mm">
                          <h1 style="font-size:20px;margin:0">Gevær Frekvens - Dipswitch Indstillinger</h1>
                        </div>
                        ${setsHtml}
                        <div style="text-align:center;font-size:10px;color:#999;margin-top:6mm;padding-top:3mm;border-top:1px solid #ddd">GUL = 1 | GRÅ = 0 | A4 Landscape</div>
                      </body></html>`;
                      const w = window.open('', '_blank');
                      if (w) {
                        w.document.write(html);
                        w.document.close();
                        setTimeout(() => w.print(), 300);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print som PDF
                  </button>
                </div>
              </div>
            </div>
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
            <ActivityGuide activity="teamrace" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamrace_rccars' ? (
            <PDFViewer
              pdfUrl="https://shop.hoeco.at/explosionsdatein/pdf/76054-5_LaTraxTeton.pdf"
              title="LaTrax Teton Manual"
              totalPages={3}
            />
          ) : currentView === 'teamrace_instructions' ? (
            <TeamRaceInstructions totalSlides={10} />
          ) : currentView === 'teamrace_scorecard' ? (
            <TeamRaceScorecard />
          ) : currentView === 'teamlazer_guide' ? (
            <ActivityGuide activity="teamlazer" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamrobin_guide' ? (
            <ActivityGuide activity="teamrobin" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamsegway_guide' ? (
            <ActivityGuide activity="teamsegway" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamconnect_guide' ? (
            <ActivityGuide activity="teamconnect" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamaction_guide' ? (
            <ActivityGuide activity="teamaction" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamchallenge_guide' ? (
            <ActivityGuide activity="teamchallenge" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamplay_guide' ? (
            <ActivityGuide activity="teamplay" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamplay_video' ? (
            <VideoPlayer
              title="TeamPlay Video Guides"
              videoIndex={TEAMPLAY_VIDEO_INDEX}
            />
          ) : currentView === 'teamplay_fejlsogning' ? (
            <VideoPlayer
              title="TeamPlay Fejlsøgning"
              videoIndex={TEAMPLAY_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'fejlsogning_teamplay' ? (
            <FejlsogningReport activity="teamplay" />
          ) : currentView === 'teamtaste_guide' ? (
            <ActivityGuide activity="teamtaste" onNavigate={(view) => changeView(view as ViewState)} />
          ) : currentView === 'teamtaste_video' ? (
            <VideoPlayer
              title="TeamTaste Video Guides"
              videoIndex={TEAMTASTE_VIDEO_INDEX}
            />
          ) : currentView === 'teamtaste_fejlsogning' ? (
            <VideoPlayer
              title="TeamTaste Fejlsøgning"
              videoIndex={TEAMTASTE_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'fejlsogning_teamtaste' ? (
            <FejlsogningReport activity="teamtaste" />
          ) : currentView === 'teamchallenge_fejlsogning' ? (
            <VideoPlayer
              title="TeamChallenge Fejlsøgning"
              videoIndex={TEAMCHALLENGE_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamconnect_video' ? (
            <VideoPlayer
              title="TeamConnect Video Guides"
              videoIndex={TEAMCONNECT_VIDEO_INDEX}
            />
          ) : currentView === 'teamconnect_fejlsogning' ? (
            <VideoPlayer
              title="TeamConnect Fejlsøgning"
              videoIndex={TEAMCONNECT_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamaction_fejlsogning' ? (
            <VideoPlayer
              title="TeamAction Fejlsøgning"
              videoIndex={TEAMACTION_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teambox_fejlsogning' ? (
            <VideoPlayer
              title="TeamBox Fejlsøgning"
              videoIndex={TEAMBOX_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamcontrol_fejlsogning' ? (
            <VideoPlayer
              title="TeamControl Fejlsøgning"
              videoIndex={TEAMCONTROL_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamconstruct_fejlsogning' ? (
            <VideoPlayer
              title="TeamConstruct Fejlsøgning"
              videoIndex={TEAMCONSTRUCT_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamrace_fejlsogning' ? (
            <VideoPlayer
              title="TeamRace Fejlsøgning"
              videoIndex={TEAMRACE_FEJLSOGNING_VIDEO_INDEX}
            />
          ) : currentView === 'teamplay_files' ? (
            <ActivityFileManager activity="teamplay" onBack={() => changeView('teamplay')} />
          ) : currentView === 'teamtaste_files' ? (
            <ActivityFileManager activity="teamtaste" onBack={() => changeView('teamtaste')} />
          ) : currentView === 'teamchallenge_files' ? (
            <ActivityFileManager activity="teamchallenge" onBack={() => changeView('team_challenge')} />
          ) : currentView === 'teamlazer_files' ? (
            <ActivityFileManager activity="teamlazer" onBack={() => changeView('teamlazer')} />
          ) : currentView === 'teamrobin_files' ? (
            <ActivityFileManager activity="teamrobin" onBack={() => changeView('teamrobin')} />
          ) : currentView === 'teamsegway_files' ? (
            <ActivityFileManager activity="teamsegway" onBack={() => changeView('teamsegway')} />
          ) : currentView === 'teamconnect_files' ? (
            <ActivityFileManager activity="teamconnect" onBack={() => changeView('teamconnect')} />
          ) : currentView === 'teambox_files' ? (
            <ActivityFileManager activity="teambox" onBack={() => changeView('teambox')} />
          ) : currentView === 'teamcontrol_files' ? (
            <ActivityFileManager activity="teamcontrol" onBack={() => changeView('teamcontrol')} />
          ) : currentView === 'teamaction_files' ? (
            <ActivityFileManager activity="teamaction" onBack={() => changeView('teamaction')} />
          ) : currentView === 'teamconstruct_files' ? (
            <ActivityFileManager activity="teamconstruct" onBack={() => changeView('teamconstruct')} />
          ) : currentView === 'teamrace_files' ? (
            <ActivityFileManager activity="teamrace" onBack={() => changeView('teamrace')} />
          ) : currentView === 'google_photos' ? (
            <GooglePhotosView />
          ) : currentView === 'teamlazer_gear' ? (
            <TeamLazerGearList />
          ) : currentView === 'admin_reports' ? (
            <AdminReports />
          ) : currentView === 'livegps' ? (
            <LiveGPSPanel />
          ) : currentView === 'admin_oos' ? (
            <AdminGearOutOfService />
          ) : currentView === 'admin_maintenance' ? (
            <AdminMaintenance />
          ) : currentView === 'zapier_integration' ? (
            <ZapierIntegration />
          ) : currentView === 'teamchallenge_gear' ? (
            <ActivityGearList activitySlug="A1" activityName="TeamChallenge" />
          ) : currentView === 'teamrobin_gear' ? (
            <ActivityGearList activitySlug="A3" activityName="TeamRobin" />
          ) : currentView === 'teambox_gear' ? (
            <ActivityGearList activitySlug="A4" activityName="TeamBox" />
          ) : currentView === 'teamconnect_gear' ? (
            <ActivityGearList activitySlug="A5" activityName="TeamConnect" />
          ) : currentView === 'teamplay_gear' ? (
            <ActivityGearList activitySlug="A6" activityName="TeamPlay" />
          ) : currentView === 'teamsegway_gear' ? (
            <ActivityGearList activitySlug="A8" activityName="TeamSegway" />
          ) : currentView === 'teamcontrol_gear' ? (
            <ActivityGearList activitySlug="A9" activityName="TeamControl" />
          ) : currentView === 'teamconstruct_gear' ? (
            <ActivityGearList activitySlug="A10" activityName="TeamConstruct" />
          ) : currentView === 'teamrace_gear' ? (
            <ActivityGearList activitySlug="A12" activityName="TeamRace" />
          ) : currentView === 'teamtaste_gear' ? (
            <ActivityGearList activitySlug="teamtaste" activityName="TeamTaste" />
          ) : currentView === 'teamaction_gear' ? (
            <ActivityGearList activitySlug="teamaction" activityName="TeamAction" />
          ) : currentView === 'job_input' ? (
            <JobInput
              onJobLoaded={(job, activities) => {
                setActiveJob(job);
                setActiveJobActivities(activities);
                setActiveInstructor(null);
                changeView('session_report');
              }}
            />
          ) : currentView === 'session_report' && activeJob ? (
            <SessionReport
              job={activeJob}
              activities={activeJobActivities}
              onNavigateActivity={(viewState) => changeView(viewState as ViewState)}
            />
          ) : currentView === 'my_jobs' ? (
            <MyJobs
              onJobSelected={(job, activities) => {
                setActiveJob(job);
                setActiveJobActivities(activities);
                setActiveInstructor(null);
                changeView('session_report');
              }}
            />
          ) : currentView === 'instructor_select' && activeJob ? (
            <InstructorSelect
              jobId={activeJob.id}
              jobTitle={`${activeJob.short_code || ''} — ${activeJob.client_name || 'Opgave'}`}
              onSelect={(instructor) => {
                setActiveInstructor(instructor);
                changeView('job_overview');
              }}
            />
          ) : currentView === 'job_overview' && activeJob ? (
            <JobOverview
              job={activeJob}
              activities={activeJobActivities}
              onNavigateActivity={(viewState) => changeView(viewState as ViewState)}
            />
          ) : currentView === 'main' ? (
            <InstructorLanding onOpenHub={() => changeView('crew_hub')} />
          ) : (currentView === 'games') ? (
            <div className="w-full max-w-4xl mx-auto px-1 mobile-landscape:px-2 tablet-portrait:px-4">
              <div className="grid grid-cols-1 tablet-portrait:grid-cols-2 gap-2 mobile-landscape:gap-1.5 tablet-portrait:gap-4 tablet-landscape:gap-3 desktop:gap-4">
                {(() => {
                  const sections = [
                        { name: 'Spil', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', titleColor: 'text-blue-400' },
                        { name: 'Loquiz', borderColor: 'border-purple-500', bgColor: 'bg-purple-500/10', titleColor: 'text-purple-400' },
                        { name: 'Online Scoreboard', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-500/10', titleColor: 'text-yellow-400' },
                        { name: 'Upload / Download', borderColor: 'border-green-500', bgColor: 'bg-green-500/10', titleColor: 'text-green-400' },
                      ];
                  return sections.map((section) => {
                    const sectionLinks = currentLinks.filter(l => l.section === section.name);
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
                              compact={true}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
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
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-battle-grey text-xs uppercase tracking-widest mt-auto">
        <p>&copy; {new Date().getFullYear()} TeamBattle Systems.</p>
      </footer>

    </div>
  );
};

export default App;
