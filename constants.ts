import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  MapPin,
  QrCode,
  Cloud,
  Mail,
  Target,
  Swords,
  Zap,
  Trophy,
  Navigation,
  Users,
  CircleDot,
  Package,
  Utensils,
  Hammer,
  Banknote,
  Landmark,
  Wallet,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Code,
  Bot,
  ClipboardList,
  Wrench,
  Map,
  ListChecks,
  Terminal,
  Database,
  Camera,
  Play,
  LucideProps
} from 'lucide-react';
import { HubLink } from './types';

// Custom E-conomics Logo Component
const EconomicLogo = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
  return React.createElement('svg', {
    ref,
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: props.size || 24,
    height: props.size || 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: props.strokeWidth || 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
    React.createElement('path', { d: "M16 11H7a4 4 0 0 0 0 8h5a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4h-1" }),
    React.createElement('path', { d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z", strokeOpacity: "0.3" })
  );
});
EconomicLogo.displayName = 'EconomicLogo';

// Task Control Submenu Links (ADMIN)
export const TASK_CONTROL_LINKS: HubLink[] = [
  {
    id: 't2',
    title: 'CODE',
    url: '#code',
    icon: Code,
    description: 'Development Tools',
    color: 'purple'
  },
  {
    id: '15',
    title: 'USERS',
    url: '#users',
    icon: Users,
    description: 'User Management',
    color: 'red'
  }
];

// Tools Submenu Links (hidden)
export const TOOLS_LINKS: HubLink[] = [];

// Code/Development Submenu Links
export const CODE_LINKS: HubLink[] = [
  {
    id: 'c1',
    title: 'Builder.io',
    url: 'https://builder.io/app/projects',
    icon: Hammer,
    description: 'Visual CMS',
    color: 'purple'
  },
  {
    id: 'c2',
    title: 'AI STUDIO',
    url: 'https://aistudio.google.com/',
    icon: Bot,
    description: 'Google Gemini',
    color: 'purple'
  },
  {
    id: 'c3',
    title: 'CLAUDE',
    url: '#claude_dev',
    icon: Terminal,
    description: 'Dev Environment',
    color: 'purple'
  },
  {
    id: 'c4',
    title: 'SUPABASE',
    url: 'https://supabase.com/dashboard/project/ilbjytyukicbssqftmma',
    icon: Database,
    description: 'Database',
    color: 'green'
  },
  {
    id: 'c5',
    title: 'NETLIFY',
    url: 'https://app.netlify.com/projects/crewcenter/overview',
    icon: Cloud,
    description: 'Hosting',
    color: 'lightblue'
  }
];

// TeamChallenge Submenu Links
export const TEAM_CHALLENGE_LINKS: HubLink[] = [
  {
    id: 'tc1',
    title: 'LOQUIZ',
    url: '#loquiz',
    icon: MapPin,
    description: 'GPS Games',
    logoUrl: 'https://loquiz.com/wpmainpage/wp-content/uploads/2020/02/loquiz-favicon.png',
    color: 'lightblue'
  },
  {
    id: 'tc3',
    title: 'TEAMTRACK',
    url: 'https://action.eventday.dk',
    icon: Navigation,
    description: 'Live Tracking'
  },
  {
    id: 'tc4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'tc5',
    title: 'VIDEO',
    url: '#teamchallenge_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// Loquiz Submenu Links
export const LOQUIZ_LINKS: HubLink[] = [
  {
    id: 'lq1',
    title: 'RESULTPAGE',
    url: 'https://service-2026-loquiz-results-viewer-476701928390.us-west1.run.app/',
    icon: ListChecks,
    description: 'Game Standings'
  },
  {
    id: 'lq2',
    title: 'SETUP GAME',
    url: 'https://beta.loquiz.com/dashboard',
    icon: Wrench,
    description: 'Game Configuration'
  },
  {
    id: 'lq3',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  }
];

// TeamLazer Submenu Links
export const TEAMLAZER_LINKS: HubLink[] = [
  {
    id: 'tl1',
    title: 'SCORECARD',
    url: '#teamlazer_scorecard',
    icon: ListChecks,
    description: 'Point Tracking',
    color: 'red',
    badge: 'new'
  },
  {
    id: 'tl2',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tl6',
    title: 'VIDEO',
    url: '#teamlazer_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  },
  {
    id: 'tl3',
    title: 'FEJLSØGNING',
    url: '#teamlazer_fejlsogning',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow',
    badge: 'new'
  },
  {
    id: 'tl4',
    title: 'PAKKELISTER',
    url: '#teamlazer_packing',
    icon: Package,
    description: 'Packing Lists',
    color: 'green',
    badge: 'new'
  }
];

// TeamLazer Fejlsøgning Submenu
export const TEAMLAZER_FEJLSOGNING_LINKS: HubLink[] = [
  {
    id: 'tlf1',
    title: 'JUSTERING',
    url: '#teamlazer_justering',
    icon: Play,
    description: 'Video Guide',
    color: 'red'
  }
];

// TeamSegway Submenu Links
export const TEAMSEGWAY_LINKS: HubLink[] = [
  {
    id: 'ts1',
    title: 'SCORECARD',
    url: '#',
    icon: ListChecks,
    description: 'Point Tracking',
    color: 'red'
  },
  {
    id: 'ts2',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'ts3',
    title: 'PAKKELISTE',
    url: '#teamsegway_packing',
    icon: Package,
    description: 'Packing List',
    color: 'green',
    badge: 'new'
  },
  {
    id: 'ts4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'ts5',
    title: 'VIDEO',
    url: '#teamsegway_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// TeamBox Submenu Links
export const TEAMBOX_LINKS: HubLink[] = [
  {
    id: 'tb1',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tb2',
    title: 'PAKKELISTE',
    url: '#',
    icon: ListChecks,
    description: 'Packing List',
    color: 'green'
  },
  {
    id: 'tb3',
    title: 'NULSTIL BOX',
    url: '#',
    icon: Wrench,
    description: 'Reset Box'
  },
  {
    id: 'tb4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'tb5',
    title: 'VIDEO',
    url: '#teambox_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// TeamConstruct Submenu Links
export const TEAMCONSTRUCT_LINKS: HubLink[] = [
  {
    id: 'tcons1',
    title: 'SCORECARD',
    url: '#',
    icon: ListChecks,
    description: 'Point Tracking',
    color: 'red'
  },
  {
    id: 'tcons2',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tcons3',
    title: 'PAKKELISTE',
    url: '#',
    icon: Package,
    description: 'Packing List',
    color: 'green'
  },
  {
    id: 'tcons4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'tcons5',
    title: 'VIDEO',
    url: '#teamconstruct_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// TeamControl Submenu Links
export const TEAMCONTROL_LINKS: HubLink[] = [
  {
    id: 'tctrl1',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tctrl2',
    title: 'FLYBRIX',
    url: 'intent://flybrix/#Intent;scheme=app;package=com.flybrix.app;end',
    icon: Gamepad2,
    description: 'Tablet App'
  },
  {
    id: 'tctrl3',
    title: 'PAKKELISTE',
    url: '#',
    icon: Package,
    description: 'Packing List',
    color: 'green'
  },
  {
    id: 'tctrl4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'tctrl5',
    title: 'VIDEO',
    url: '#teamcontrol_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// TeamConnect Submenu Links
export const TEAMCONNECT_LINKS: HubLink[] = [
  {
    id: 'tc1',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tc2',
    title: 'PAKKELISTER',
    url: '#',
    icon: Package,
    description: 'Packing Lists',
    color: 'green'
  },
  {
    id: 'tc3',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  }
];

// TeamRobin Submenu Links
export const TEAMROBIN_LINKS: HubLink[] = [
  {
    id: 'tr1',
    title: 'SCORECARD',
    url: '#',
    icon: ListChecks,
    description: 'Point Tracking',
    color: 'red'
  },
  {
    id: 'tr2',
    title: 'GUIDE',
    url: '#',
    icon: Map,
    description: 'Instructions',
    color: 'blue'
  },
  {
    id: 'tr3',
    title: 'PAKKELISTER',
    url: '#teamrobin_packing',
    icon: Package,
    description: 'Packing Lists',
    color: 'green',
    badge: 'new'
  },
  {
    id: 'tr4',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'tr5',
    title: 'VIDEO',
    url: '#teamrobin_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// TeamRobin Packing Submenu
export const TEAMROBIN_PACKING_LINKS: HubLink[] = [
  {
    id: 'trp1',
    title: 'FØR OPGAVEN',
    url: '#teamrobin_packing_before',
    icon: Package,
    description: 'Afgang',
    color: 'green'
  },
  {
    id: 'trp2',
    title: 'EFTER OPGAVEN',
    url: '#teamrobin_packing_after',
    icon: ListChecks,
    description: 'Hjemkomst',
    color: 'blue'
  }
];

// TeamAction Submenu Links
export const TEAMACTION_LINKS: HubLink[] = [
  {
    id: 'ta1',
    title: 'LOQUIZ',
    url: '#loquiz',
    icon: MapPin,
    description: 'GPS Games',
    logoUrl: 'https://loquiz.com/wpmainpage/wp-content/uploads/2020/02/loquiz-favicon.png',
    color: 'lightblue'
  },
  {
    id: 'ta2',
    title: 'TEAMTRACK',
    url: 'https://action.eventday.dk',
    icon: Navigation,
    description: 'Live Tracking'
  },
  {
    id: 'ta3',
    title: 'FEJLSØGNING',
    url: '#',
    icon: Wrench,
    description: 'Troubleshooting',
    color: 'yellow'
  },
  {
    id: 'ta4',
    title: 'VIDEO',
    url: '#teamaction_video',
    icon: Play,
    description: 'Video Guides',
    color: 'red',
    badge: 'new'
  }
];

// Office Submenu Links
export const OFFICE_LINKS: HubLink[] = [
  // CrewControlCenter section
  {
    id: '8',
    title: 'SEGWAY APP',
    url: 'https://app.teambattle.dk/mainpage.aspx',
    icon: Target,
    description: 'Operations',
    color: 'blue',
    section: 'CrewControlCenter'
  },
  // Office section
  {
    id: '6',
    title: 'OUTLOOK',
    url: 'https://outlook.office.com/mail/',
    icon: Mail,
    description: 'Company email',
    color: 'red',
    section: 'Office'
  },
  {
    id: '5',
    title: 'OneDrive',
    url: 'https://segway-my.sharepoint.com/',
    icon: Cloud,
    description: 'File storage',
    color: 'blue',
    section: 'Office'
  },
  {
    id: '12',
    title: 'EXCEL 2025',
    url: 'https://segway.sharepoint.com/:x:/r/_layouts/15/doc2.aspx?sourcedoc=%7B1AC01354-27AF-4226-9201-9AD803A8BE30%7D&file=TeamBattle%202025%20(OK%201.0).xlsx&action=default&mobileredirect=true&DefaultItemOpen=1',
    icon: FileSpreadsheet,
    description: 'Planning',
    color: 'green',
    section: 'Office'
  },
  {
    id: '14',
    title: 'EXCEL 2026',
    url: '#',
    icon: FileSpreadsheet,
    description: 'Future Planning',
    color: 'yellow',
    badge: 'new',
    section: 'Office'
  },
  // Economy section
  {
    id: 'e1',
    title: 'E-conomics',
    url: 'https://connect.visma.com/password?clientId=economic&returnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Deconomic%26redirect_uri%3Dhttps%253A%252F%252Fid.e-conomic.com%252Fsignin-visma-connect%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520email%2520idp_claims%26code_challenge%3DlZoA4c0ZvvK2tE5pTe3MpbQh1tvMnHnxIRpvY-WrnmU%26code_challenge_method%3DS256%26response_mode%3Dform_post%26nonce%3D639013079883742153.NmNlMTYwYjQtNzEwMi00MTBlLTk3ZDgtNThjYTZmOTE2MThmZDAzMTQwZWQtZjQyNS00NmY2LThmNWEtNDliMjAyNWJiNmFl%26state%3DCfDJ8D2TA8BDXn1HkmTBRGIPpGxnewcMYQTBlyGha62Ha0MP87kgIcOJAaW6ITPhxAkEV2i6fm_5M3FrIWuIUlcvsLGsVF709Fjmons1WK6Diq4UKqcj0w6nGN37U7_S-7OFsevIf_SdXar8Tg1c7s8AqCDqKEv65qih8eLF77kO1T22cLjepzSTBB0WOKcTVs-I741xmIV1y4w3JMz4jIcxe2DGSeFcjy2AFZEDJ58cRQ6wqqLYsthtZdaTPm61NL_gNQq7MmyEqSeM8mUHs6H27OTIWxtbQYB7bxjdA_VKFAbs71TvpWqxJaZhXLbX-7icpnTosabK9h6OeNbYsJodxgwwEHvtEk-i8ncGaalFGz7iHi8WEHLKIgJejJ2IecqkHFNrdmYIAEavXGDJib77SctiJ65628qWwM08eUs9FnuJ1gESmZwjbcu9h2tbKaRY6Lt3oN6v471UnXeKIos4wSsizWjxFLeiU3vvFa5tsykBi_gR_nK6W9c2xE6a3fqhzrZxoR2IQg6MFxWov0Ztds9PJmmcpix1bGTz9RnQymQdq9h5W40liyyNP8KrOrfW3rpP0VlWTAaehREgnv7Gle-LGDf4FcJAWOu7d24o0ykR_lq3naX1243weTlRdiZ3G59dafX43QIOzXs_g8HiLvqH2w7miHC26BAeB4H_039kumOrB7B-IKt-jkb7jYZbIC_zLPR1bKWdCM3TXuoiNF80R21nNkt2dNrhkRtP9R29igufU-PbYi9cKFeBhKWZjxHq2Mzph3RiZmk--QMoSqTWqLp0oRC5zI2R6PuqBcSM-fCShCk5Sz4r9_2mk3uc6ffS00yt3iJwi-YcWw-N6QPnwUkqoCZmLOkWn8m2XPlY2lRh4JNIbp3WKEWsUI55LtExBwmqX-P3AdmGmDPuqgFgWBywDwtDJ5HxBtlxu7oshYSmhaq7s_fn6zcmmORS4h4emsgYdHNt93Zj5irfGAOycD2h1FapFwOaUxv425UQ75nFlqmrMxiKtCUp-sue_S3W8acLiYHdVhrW3xmTM29aBMvZZWbgsy4mGp122YT0sLUzBZ1RJD-OluV39OP6UQ%26x-client-SKU%3DID_NET9_0%26x-client-ver%3D8.0.1.0',
    icon: EconomicLogo,
    description: 'Accounting',
    section: 'Economy'
  },
  {
    id: 'e2',
    title: 'BANK',
    url: 'https://jyskebank.mitid.dk/client/start?client_id=mb_051&curity_client_id=netbank_erhverv&redirect_uri=https%3A%2F%2Fauth.jyskebank.dk%2Fauthentication%2Fmitid_erhverv_twofactor%2Fcallback&state=6c4a251f-b9a6-48eb-96b7-0be079a24aa4&response_type=code&code_challenge_method=S256&code_challenge=0vwK3E5maoiVsFaDItBoBXlCZsAQ1sA0wdGniQ01iEI&scope=mitid&bankno=51&customerType=E&isTwoFactor=true&isBankCustomer=true&isPsd2=true&ui_locales=DA&acr=mitid_erhverv_twofactor&explicit_acr=true&curity_acr=mitid_erhverv_twofactor&ts=1765711377&sessionId=bkaghmvr7MPHlwGZgSF6f9N16Gjuy34V&hmac=NEj0Pds076RHziGHzQ6Y_FwXm4qlU19wCIwZ09lRT8s',
    icon: Landmark,
    description: 'Jyske Bank',
    section: 'Economy'
  },
  // Google Tools section
  {
    id: '13',
    title: 'MY MAPS',
    url: 'https://www.google.com/maps/d/edit?mid=1kk3NNhrq_jToiol2_X6-_ExAh88Z55I&ll=55.642030146113406%2C12.52053131216431&z=16',
    icon: Map,
    description: 'Location Planning',
    color: 'green',
    section: 'Google Tools'
  },
  {
    id: 't1',
    title: 'PHOTO',
    url: 'https://photos.google.com/albums?pli=1',
    icon: Camera,
    description: 'Google Photos',
    color: 'red',
    section: 'Google Tools'
  },
  {
    id: 'forms',
    title: 'FORMS',
    url: 'https://docs.google.com/forms/u/0/?pli=1',
    icon: FileText,
    description: 'Google Forms',
    color: 'purple',
    section: 'Google Tools'
  },
  {
    id: '4',
    title: 'QR Generator',
    url: 'https://login.qr-code-generator.com/',
    icon: QrCode,
    description: 'Code Generator',
    color: 'lightblue',
    section: 'Google Tools'
  }
];

// Google Tools Submenu Links
export const GOOGLE_TOOLS_LINKS: HubLink[] = [
  {
    id: '13',
    title: 'MY MAPS',
    url: 'https://www.google.com/maps/d/edit?mid=1kk3NNhrq_jToiol2_X6-_ExAh88Z55I&ll=55.642030146113406%2C12.52053131216431&z=16',
    icon: Map,
    description: 'Location Planning',
    color: 'green'
  },
  {
    id: 't1',
    title: 'PHOTO',
    url: 'https://photos.google.com/albums?pli=1',
    icon: Camera,
    description: 'Google Photos',
    color: 'red'
  },
  {
    id: 'forms',
    title: 'FORMS',
    url: 'https://docs.google.com/forms/u/0/?pli=1',
    icon: FileText,
    description: 'Google Forms',
    color: 'purple'
  }
];

// Main Hub Links (Categories)
export const HUB_LINKS: HubLink[] = [
  {
    id: '1',
    title: 'ControlCenter',
    url: 'https://eventday.dk',
    icon: LayoutDashboard,
    description: 'ADMIN',
    color: 'yellow'
  },
  {
    id: 'cat3',
    title: 'OFFICE',
    url: '#office',
    icon: Briefcase,
    description: 'Communication',
    color: 'red'
  },
  {
    id: '2',
    title: 'ACTIVITIES',
    url: '#activities',
    icon: Gamepad2,
    description: 'Event Catalog',
    color: 'yellow'
  },
  {
    id: 'cat1',
    title: 'ADMIN',
    url: '#task_control',
    icon: ClipboardList,
    description: 'Admin & Ops',
    color: 'green'
  }
];

// Activity Submenu Links
export const ACTIVITY_LINKS: HubLink[] = [
  // Group 1
  { id: 'a1', title: 'TEAMPLAY', url: 'https://play.eventday.dk', icon: Users, description: 'Cooperation', badge: 'ACTIVE' },
  { id: 'a2', title: 'TEAMCHALLENGE', url: '#team_challenge', icon: Trophy, description: 'Competition', badge: 'ACTIVE', color: 'hotpink' },
  { id: 'a3', title: 'TEAMTASTE', url: 'https://taste.eventday.dk', icon: Utensils, description: 'Culinary', badge: 'ACTIVE', color: 'gold' },
  
  // Group 2
  { id: 'a4', title: 'TEAMLAZER', url: '#teamlazer', icon: Zap, description: 'Laser Combat', color: 'blue' },
  { id: 'a5', title: 'TEAMROBIN', url: '#teamrobin', icon: Target, description: 'Archery', color: 'lightgreen', badge: 'new' },
  { id: 'a6', title: 'TEAMSEGWAY', url: '#teamsegway', icon: Navigation, description: 'Transporters', color: 'red' },
  
  // Group 3
  { id: 'a7', title: 'TEAMCONNECT', url: '#teamconnect', icon: CircleDot, description: 'Networking', color: 'purple' },
  { id: 'a8', title: 'TEAMBOX', url: '#teambox', icon: Package, description: 'Portable Events', color: 'gray' },
  { id: 'a9', title: 'TEAMCONTROL', url: '#teamcontrol', icon: Gamepad2, description: 'Strategy', color: 'white' },
  
  // Group 4
  { id: 'a10', title: 'TEAMACTION', url: '#teamaction', icon: Swords, description: 'High Intensity', color: 'lightblue' },
  { id: 'a11', title: 'TEAMCONSTRUCT', url: '#teamconstruct', icon: Hammer, description: 'Building', color: 'yellow' },
];

// Economy Submenu Links
export const ECONOMY_LINKS: HubLink[] = [
  {
    id: 'e1',
    title: 'E-conomics',
    url: 'https://connect.visma.com/password?clientId=economic&returnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Deconomic%26redirect_uri%3Dhttps%253A%252F%252Fid.e-conomic.com%252Fsignin-visma-connect%26response_type%3Dcode%26scope%3Dopenid%2520profile%2520email%2520idp_claims%26code_challenge%3DlZoA4c0ZvvK2tE5pTe3MpbQh1tvMnHnxIRpvY-WrnmU%26code_challenge_method%3DS256%26response_mode%3Dform_post%26nonce%3D639013079883742153.NmNlMTYwYjQtNzEwMi00MTBlLTk3ZDgtNThjYTZmOTE2MThmZDAzMTQwZWQtZjQyNS00NmY2LThmNWEtNDliMjAyNWJiNmFl%26state%3DCfDJ8D2TA8BDXn1HkmTBRGIPpGxnewcMYQTBlyGha62Ha0MP87kgIcOJAaW6ITPhxAkEV2i6fm_5M3FrIWuIUlcvsLGsVF709Fjmons1WK6Diq4UKqcj0w6nGN37U7_S-7OFsevIf_SdXar8Tg1c7s8AqCDqKEv65qih8eLF77kO1T22cLjepzSTBB0WOKcTVs-I741xmIV1y4w3JMz4jIcxe2DGSeFcjy2AFZEDJ58cRQ6wqqLYsthtZdaTPm61NL_gNQq7MmyEqSeM8mUHs6H27OTIWxtbQYB7bxjdA_VKFAbs71TvpWqxJaZhXLbX-7icpnTosabK9h6OeNbYsJodxgwwEHvtEk-i8ncGaalFGz7iHi8WEHLKIgJejJ2IecqkHFNrdmYIAEavXGDJib77SctiJ65628qWwM08eUs9FnuJ1gESmZwjbcu9h2tbKaRY6Lt3oN6v471UnXeKIos4wSsizWjxFLeiU3vvFa5tsykBi_gR_nK6W9c2xE6a3fqhzrZxoR2IQg6MFxWov0Ztds9PJmmcpix1bGTz9RnQymQdq9h5W40liyyNP8KrOrfW3rpP0VlWTAaehREgnv7Gle-LGDf4FcJAWOu7d24o0ykR_lq3naX1243weTlRdiZ3G59dafX43QIOzXs_g8HiLvqH2w7miHC26BAeB4H_039kumOrB7B-IKt-jkb7jYZbIC_zLPR1bKWdCM3TXuoiNF80R21nNkt2dNrhkRtP9R29igufU-PbYi9cKFeBhKWZjxHq2Mzph3RiZmk--QMoSqTWqLp0oRC5zI2R6PuqBcSM-fCShCk5Sz4r9_2mk3uc6ffS00yt3iJwi-YcWw-N6QPnwUkqoCZmLOkWn8m2XPlY2lRh4JNIbp3WKEWsUI55LtExBwmqX-P3AdmGmDPuqgFgWBywDwtDJ5HxBtlxu7oshYSmhaq7s_fn6zcmmORS4h4emsgYdHNt93Zj5irfGAOycD2h1FapFwOaUxv425UQ75nFlqmrMxiKtCUp-sue_S3W8acLiYHdVhrW3xmTM29aBMvZZWbgsy4mGp122YT0sLUzBZ1RJD-OluV39OP6UQ%26x-client-SKU%3DID_NET9_0%26x-client-ver%3D8.0.1.0',
    icon: EconomicLogo,
    description: 'Accounting'
  },
  {
    id: 'e2',
    title: 'BANK',
    url: 'https://jyskebank.mitid.dk/client/start?client_id=mb_051&curity_client_id=netbank_erhverv&redirect_uri=https%3A%2F%2Fauth.jyskebank.dk%2Fauthentication%2Fmitid_erhverv_twofactor%2Fcallback&state=6c4a251f-b9a6-48eb-96b7-0be079a24aa4&response_type=code&code_challenge_method=S256&code_challenge=0vwK3E5maoiVsFaDItBoBXlCZsAQ1sA0wdGniQ01iEI&scope=mitid&bankno=51&customerType=E&isTwoFactor=true&isBankCustomer=true&isPsd2=true&ui_locales=DA&acr=mitid_erhverv_twofactor&explicit_acr=true&curity_acr=mitid_erhverv_twofactor&ts=1765711377&sessionId=bkaghmvr7MPHlwGZgSF6f9N16Gjuy34V&hmac=NEj0Pds076RHziGHzQ6Y_FwXm4qlU19wCIwZ09lRT8s',
    icon: Landmark,
    description: 'Jyske Bank'
  }
];

// TeamLazer Video Index - matches YouTube playlist order
export const TEAMLAZER_VIDEO_INDEX = [
  { title: 'Den STORE kasse', index: 0 },
  { title: 'Alt det andet gear', index: 1 },
  { title: 'Ring til 114!', index: 2 },
  { title: 'Ledning (Controler)', index: 3 },
  { title: 'Ledning (kaster + board)', index: 4 },
  { title: 'Gevær 4 / Batterier i gevær', index: 5 },
  { title: 'Hvordan sigter man gevær?', index: 6 },
  { title: 'Pointtavle 1 / autosave & have a go', index: 7 },
  { title: 'Pointtavle 2 / Forbind kaster', index: 8 },
  { title: 'Pointtavle 3 / knapperne bagpå', index: 9 },
  { title: 'Pointtavle 4 / Håndcontroler', index: 10 },
  { title: 'Pointtavle 5 / point i spil', index: 11 },
  { title: 'Pointtavle 6 / Setup hurtig', index: 12 },
  { title: 'Pointtavle 7 / Vælg spil', index: 13 },
  { title: 'Kaster 1 / fjeder spændes op', index: 14 },
  { title: 'Kaster / Duerne i kasteren', index: 15 },
  { title: 'Kaster 2 / ledning + testskud', index: 16 },
  { title: 'Kaster 3 / FEJLSØGNING!', index: 17 },
  { title: 'Kaster 4 / Prøveskud & knapper', index: 18 },
  { title: 'Gevær 1 / Hvordan lader man', index: 19 },
  { title: 'Opsætning af bane før opgave', index: 20 },
  { title: 'Point / Sådan giver du point', index: 21 },
  { title: 'Lerdue event promo', index: 22 },
  { title: 'Lerdue Skydning 2017', index: 23 },
  { title: 'Range ajuster', index: 24 },
  { title: 'Sammenkobling 2+ displays', index: 25 },
  { title: 'Sammenkobling 2 kastere', index: 26 },
  { title: 'Pointgivning flere displays', index: 27 },
];