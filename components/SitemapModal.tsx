import React, { useState } from 'react';
import {
  X, ChevronRight, ChevronDown, ExternalLink,
  Home, ClipboardList, Gamepad2, Trophy, Briefcase,
  Users, Target, Zap, Navigation, CircleDot, Package,
  Swords, Hammer, Car, Utensils, MapPin,
  Play, Map, Wrench, ListChecks, FolderOpen,
  FileText, Radio, Code, Database, Cloud, Bot, Terminal,
  Wallet, Mail, Camera, Download, Upload,
  HelpCircle, Calendar, Ruler, MessageSquare, ShieldCheck
} from 'lucide-react';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

interface TreeNode {
  id: string;
  label: string;
  view?: string;        // internal view state
  url?: string;         // external URL
  icon?: React.ElementType;
  color?: string;
  children?: TreeNode[];
  isModal?: boolean;    // opens a modal overlay
  badge?: string;
}

const ACTIVITY_COLORS: Record<string, string> = {
  teamplay: '#f97316',
  teamchallenge: '#ec4899',
  teamtaste: '#eab308',
  teamlazer: '#3b82f6',
  teamrobin: '#86efac',
  teamsegway: '#ef4444',
  teamconnect: '#a855f7',
  teambox: '#9ca3af',
  teamcontrol: '#ffffff',
  teamaction: '#67e8f9',
  teamconstruct: '#facc15',
  teamrace: '#f97316',
};

// Build the full site tree
const buildSiteTree = (): TreeNode[] => [
  {
    id: 'main',
    label: 'LANDING PAGE',
    view: 'main',
    icon: Home,
    color: '#f97316',
    children: [
      {
        id: 'opgaver',
        label: 'OPGAVER',
        view: 'opgaver',
        icon: ClipboardList,
        color: '#22c55e',
        children: [
          {
            id: 'job_input',
            label: 'HENT OPGAVE',
            view: 'job_input',
            icon: Briefcase,
            children: [
              { id: 'session_report', label: 'SESSION RAPPORT', view: 'session_report', icon: FileText }
            ]
          },
          {
            id: 'my_jobs',
            label: 'VIS MINE OPGAVER',
            view: 'my_jobs',
            icon: Users,
            children: [
              { id: 'session_report_2', label: 'SESSION RAPPORT', view: 'session_report', icon: FileText }
            ]
          },
          {
            id: 'task_control',
            label: 'ADMIN',
            view: 'task_control',
            icon: ShieldCheck,
            color: '#ef4444',
            badge: 'ADMIN',
            children: [
              {
                id: 'code',
                label: 'CODE',
                view: 'code',
                icon: Code,
                color: '#a855f7',
                children: [
                  { id: 'builderio', label: 'Builder.io', url: 'https://builder.io', icon: Hammer },
                  { id: 'aistudio', label: 'AI Studio', url: 'https://aistudio.google.com', icon: Bot },
                  { id: 'claude_dev', label: 'CLAUDE DEV', icon: Terminal, isModal: true },
                  { id: 'supabase', label: 'SUPABASE', url: 'https://supabase.com', icon: Database },
                  { id: 'netlify', label: 'NETLIFY', url: 'https://app.netlify.com', icon: Cloud },
                ]
              },
              { id: 'users_mgmt', label: 'USERS', icon: Users, isModal: true },
              { id: 'admin_reports', label: 'FEJLRAPPORTER', view: 'admin_reports', icon: Wrench },
              { id: 'admin_packing', label: 'PAKKELISTER', view: 'admin_packing_editor', icon: Package },
            ]
          },
        ]
      },
      {
        id: 'activities',
        label: 'AKTIVITETER',
        view: 'activities',
        icon: Gamepad2,
        color: '#f97316',
        children: [
          buildActivityNode('teamplay', 'TEAMPLAY', Users, [
            { id: 'tplay_game', label: 'GAME', url: 'https://play.eventday.dk', icon: Play },
          ], true),
          buildActivityNode('team_challenge', 'TEAMCHALLENGE', Trophy, [
            { id: 'tc_loquiz', label: 'LOQUIZ', view: 'loquiz', icon: MapPin, children: [
              { id: 'lq_results', label: 'LOQUIZ RESULTS', url: 'https://service-2026-loquiz-results-viewer-476701928390.us-west1.run.app/', icon: ListChecks },
              { id: 'lq_setup', label: 'LOQUIZ SETUP', url: 'https://beta.loquiz.com/dashboard', icon: Wrench },
            ]},
            { id: 'tc_track', label: 'TEAMTRACK', url: 'https://action.eventday.dk', icon: Navigation },
            { id: 'tc_boxvideos', label: 'BOKSE', view: 'teamchallenge_boxvideos', icon: Package },
          ], true, 'teamchallenge'),
          buildActivityNode('teamtaste', 'TEAMTASTE', Utensils, [
            { id: 'ttaste_game', label: 'GAME', url: 'https://taste.eventday.dk', icon: Play },
          ], true),
          buildActivityNode('teamlazer', 'TEAMLAZER', Zap, [
            { id: 'tl_scorecard', label: 'SCORECARD', view: 'teamlazer_scorecard', icon: ListChecks, color: '#ef4444' },
            { id: 'tl_frekvenser', label: 'FREKVENSER', view: 'teamlazer_frekvenser', icon: Radio },
          ], false, 'teamlazer'),
          buildActivityNode('teamrobin', 'TEAMROBIN', Target, [], false),
          buildActivityNode('teamsegway', 'TEAMSEGWAY', Navigation, [], false),
          buildActivityNode('teamconnect', 'TEAMCONNECT', CircleDot, [], false),
          buildActivityNode('teambox', 'TEAMBOX', Package, [
            { id: 'tb_checklist', label: 'NULSTIL BOX', view: 'teambox_checklist', icon: Wrench },
          ], false),
          buildActivityNode('teamcontrol', 'TEAMCONTROL', Gamepad2, [
            { id: 'tctrl_musik', label: 'MUSIK', view: 'teamcontrol_musik', icon: Play },
            { id: 'tctrl_flybrix', label: 'FLYBRIX', view: 'teamcontrol_flybrix', icon: Gamepad2, children: [
              { id: 'tctrl_flybrix_manual', label: 'SAMLEVEJLEDNING', view: 'teamcontrol_flybrix_manual', icon: Map },
            ]},
          ], false),
          buildActivityNode('teamaction', 'TEAMACTION', Swords, [
            { id: 'ta_track', label: 'TEAMTRACK', url: 'https://action.eventday.dk', icon: Navigation },
            { id: 'ta_loquiz', label: 'LOQUIZ', view: 'loquiz', icon: MapPin },
          ], true),
          buildActivityNode('teamconstruct', 'TEAMCONSTRUCT', Hammer, [
            { id: 'tcons_scorecard', label: 'SCORECARD', view: 'teamconstruct_scorecard', icon: ListChecks, color: '#ef4444' },
          ], false, 'teamconstruct'),
          buildActivityNode('teamrace', 'TEAMRACE', Car, [
            { id: 'trace_scorecard', label: 'SCORECARD', view: 'teamrace_scorecard', icon: ListChecks, color: '#ef4444' },
            { id: 'trace_rccars', label: 'RC CARS', view: 'teamrace_rccars', icon: Gamepad2 },
            { id: 'trace_instructions', label: 'INSTRUCTIONS', view: 'teamrace_instructions', icon: Map },
          ], false, 'teamrace'),
        ]
      },
      {
        id: 'games',
        label: 'GAMES',
        view: 'games',
        icon: Trophy,
        color: '#3b82f6',
        children: [
          { id: 'g_play', label: 'PLAY', url: 'https://play.eventday.dk', icon: Play },
          { id: 'g_taste', label: 'TASTE', url: 'https://taste.eventday.dk', icon: Utensils },
          { id: 'g_track', label: 'TRACK', url: 'https://track.eventday.dk', icon: Navigation },
          { id: 'g_loquiz_results', label: 'LOQUIZ RESULTS', url: 'https://service-2026-loquiz-results-viewer-476701928390.us-west1.run.app/', icon: ListChecks },
          { id: 'g_loquiz_setup', label: 'LOQUIZ SETUP', url: 'https://beta.loquiz.com/dashboard', icon: Wrench },
        ]
      },
    ]
  },
  {
    id: 'topbar',
    label: 'TOPBAR',
    icon: ShieldCheck,
    color: '#6b7280',
    children: [
      { id: 'topbar_job', label: 'JOB SØGNING', icon: Briefcase, isModal: true },
      { id: 'topbar_today', label: 'DAGENS OPGAVER', icon: Calendar, isModal: true },
      { id: 'topbar_claude', label: 'CLAUDE AI', icon: MessageSquare, isModal: true, badge: 'ADMIN' },
      { id: 'topbar_ideas', label: 'IDEER & FORSLAG', icon: HelpCircle, isModal: true },
      { id: 'topbar_distance', label: 'AFSTANDSBEREGNER', view: 'distance_tool', icon: Ruler },
      { id: 'topbar_calendar', label: 'KALENDER', icon: Calendar, isModal: true },
    ]
  }
];

function buildActivityNode(
  viewName: string,
  label: string,
  icon: React.ElementType,
  extraChildren: TreeNode[],
  hasScorecard: boolean = false,
  activityKey?: string,
): TreeNode {
  const key = activityKey || viewName;
  const prefix = key.replace('team_', 'team');

  const standardChildren: TreeNode[] = [
    { id: `${key}_guide`, label: 'GUIDE', view: `${prefix}_guide`, icon: Map },
    { id: `${key}_video`, label: 'VIDEO', view: `${prefix}_video`, icon: Play },
    {
      id: `${key}_packing`, label: 'PAKKELISTER', view: `${prefix}_packing`, icon: Package,
      children: [
        { id: `${key}_pack_af`, label: 'FØR OPGAVEN', view: `${prefix}_packing_afgang`, icon: Package },
        { id: `${key}_pack_hj`, label: 'EFTER OPGAVEN', view: `${prefix}_packing_hjemkomst`, icon: ListChecks },
        { id: `${key}_pack_edit`, label: 'RET PAKKELISTE', view: 'edit_packing', icon: Wrench },
      ]
    },
    { id: `${key}_fejlsogning`, label: 'FEJLSØGNING', view: `${prefix}_fejlsogning`, icon: Wrench },
    { id: `${key}_fejl`, label: 'FEJL & MANGLER', view: `fejlsogning_${prefix}`, icon: Wrench },
    { id: `${key}_files`, label: 'FILER', view: `${prefix}_files`, icon: FolderOpen, color: '#a855f7' },
  ];

  if (hasScorecard) {
    standardChildren.push({ id: `${key}_scorecard_placeholder`, label: 'SCORECARD', icon: ListChecks, color: '#ef4444', badge: 'Snart' });
  }

  return {
    id: viewName,
    label,
    view: viewName === 'team_challenge' ? 'team_challenge' : viewName,
    icon,
    color: ACTIVITY_COLORS[prefix] || '#f97316',
    children: [...extraChildren, ...standardChildren],
  };
}

// TreeNodeComponent
const TreeNodeItem: React.FC<{
  node: TreeNode;
  depth: number;
  onNavigate: (view: string) => void;
  onClose: () => void;
  currentView: string;
  defaultExpanded?: boolean;
}> = ({ node, depth, onNavigate, onClose, currentView, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded || depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.view === currentView;
  const isExternal = !!node.url;
  const isModal = !!node.isModal;
  const Icon = node.icon;

  const handleClick = () => {
    if (isExternal) {
      window.open(node.url, '_blank');
    } else if (node.view && !isModal) {
      onNavigate(node.view);
      onClose();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const nodeColor = node.color || '#9ca3af';

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer transition-all duration-150 group ${
          isActive ? 'bg-battle-orange/20 border border-battle-orange/30' : 'hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Arrow */}
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
          </span>
        )}

        {/* Icon */}
        {Icon && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: nodeColor }}>
            <Icon className="w-4 h-4" />
          </span>
        )}

        {/* Label */}
        <span className={`text-sm font-medium truncate ${
          isActive ? 'text-battle-orange' :
          isExternal ? 'text-blue-400 group-hover:text-blue-300' :
          isModal ? 'text-gray-500' :
          node.view ? 'text-gray-200 group-hover:text-white' :
          'text-gray-500'
        }`}>
          {node.label}
        </span>

        {/* Badges */}
        {node.badge && (
          <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
            node.badge === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            node.badge === 'Snart' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {node.badge}
          </span>
        )}

        {/* External link indicator */}
        {isExternal && (
          <ExternalLink className="flex-shrink-0 w-3 h-3 text-blue-500/50" />
        )}

        {/* Modal indicator */}
        {isModal && (
          <span className="flex-shrink-0 text-[9px] text-gray-600 uppercase">modal</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute top-0 bottom-0 border-l border-white/5"
            style={{ left: `${depth * 20 + 18}px` }}
          />
          {node.children!.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
              onClose={onClose}
              currentView={currentView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SitemapModal: React.FC<SitemapModalProps> = ({ isOpen, onClose, onNavigate, currentView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const tree = buildSiteTree();

  if (!isOpen) return null;

  // Count total nodes
  const countNodes = (nodes: TreeNode[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countNodes(node.children) : 0);
    }, 0);
  };

  const totalNodes = countNodes(tree);

  // Filter tree based on search
  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query.trim()) return nodes;
    const q = query.toLowerCase();

    return nodes.reduce<TreeNode[]>((acc, node) => {
      const matchesLabel = node.label.toLowerCase().includes(q);
      const filteredChildren = node.children ? filterTree(node.children, query) : [];

      if (matchesLabel || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: matchesLabel ? node.children : filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const filteredTree = filterTree(tree, searchQuery);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-battle-black border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-battle-orange/20 rounded-lg border border-battle-orange/30">
              <MapPin className="w-5 h-5 text-battle-orange" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Sitemap</h2>
              <p className="text-xs text-gray-500">{totalNodes} sider & funktioner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-white/5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søg sider..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-battle-orange/50"
            autoFocus
          />
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-200" /> Side
          </span>
          <span className="flex items-center gap-1">
            <ExternalLink className="w-2.5 h-2.5 text-blue-500" /> Eksternt link
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-600" /> Modal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-battle-orange" /> Aktiv
          </span>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filteredTree.map(node => (
            <TreeNodeItem
              key={node.id}
              node={node}
              depth={0}
              onNavigate={onNavigate}
              onClose={onClose}
              currentView={currentView}
              defaultExpanded={true}
            />
          ))}

          {filteredTree.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Ingen sider fundet for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitemapModal;
