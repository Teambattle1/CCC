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
  Code,
  Bot,
  ClipboardList,
  Wrench,
  Map,
  ListChecks,
  LucideProps
} from 'lucide-react';
import { HubLink } from './types';

// Custom E-conomics Logo Component
const EconomicLogo = (props: LucideProps) => {
  return React.createElement('svg', {
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
};

// Task Control Submenu Links
export const TASK_CONTROL_LINKS: HubLink[] = [
  {
    id: '1',
    title: 'ControlCenter',
    url: 'https://eventday.dk',
    icon: LayoutDashboard,
    description: 'ADMIN'
  },
  {
    id: '12',
    title: 'EXCEL 2025',
    url: 'https://segway.sharepoint.com/:x:/r/_layouts/15/doc2.aspx?sourcedoc=%7B1AC01354-27AF-4226-9201-9AD803A8BE30%7D&file=TeamBattle%202025%20(OK%201.0).xlsx&action=default&mobileredirect=true&DefaultItemOpen=1',
    icon: FileSpreadsheet,
    description: 'Planning'
  },
  {
    id: '14',
    title: 'EXCEL 2026',
    url: '#',
    icon: FileSpreadsheet,
    description: 'Future Planning'
  },
  {
    id: '8',
    title: 'SEGWAY APP',
    url: 'https://app.teambattle.dk/mainpage.aspx',
    icon: Target,
    description: 'Operations'
  }
];

// Tools Submenu Links
export const TOOLS_LINKS: HubLink[] = [
  {
    id: '3',
    title: 'Loquiz',
    url: 'https://beta.loquiz.com/dashboard',
    icon: MapPin,
    description: 'GPS game'
  },
  {
    id: '4',
    title: 'QR',
    url: 'https://login.qr-code-generator.com/',
    icon: QrCode,
    description: 'Code Generator'
  },
  {
    id: '13',
    title: 'MY MAPS',
    url: 'https://www.google.com/maps/d/edit?mid=1kk3NNhrq_jToiol2_X6-_ExAh88Z55I&ll=55.642030146113406%2C12.52053131216431&z=16',
    icon: Map,
    description: 'Location Planning'
  },
  {
    id: '15',
    title: 'DISTANCE',
    url: '#distance_tool',
    icon: Navigation,
    description: 'Calculator'
  }
];

// TeamChallenge Submenu Links
export const TEAM_CHALLENGE_LINKS: HubLink[] = [
  {
    id: 'tc1',
    title: 'RESULTPAGE',
    url: 'https://service-2026-loquiz-results-viewer-476701928390.us-west1.run.app/',
    icon: ListChecks,
    description: 'Game Standings'
  },
  {
    id: 'tc2',
    title: 'SETUP GAME',
    url: 'https://beta.loquiz.com/dashboard',
    icon: Wrench,
    description: 'Game Configuration'
  }
];

// Office Submenu Links
export const OFFICE_LINKS: HubLink[] = [
  {
    id: '6',
    title: 'OUTLOOK',
    url: 'https://outlook.office.com/mail/',
    icon: Mail,
    description: 'Company email'
  },
  {
    id: '5',
    title: 'OneDrive',
    url: 'https://segway-my.sharepoint.com/',
    icon: Cloud,
    description: 'File storage'
  },
  {
    id: '10',
    title: 'ECONOMY',
    url: '#economy',
    icon: Wallet,
    description: 'Finance & Banking'
  }
];

// Main Hub Links (Categories)
export const HUB_LINKS: HubLink[] = [
  {
    id: 'cat1',
    title: 'ADMIN',
    url: '#task_control',
    icon: ClipboardList,
    description: 'Admin & Ops'
  },
  {
    id: 'cat3',
    title: 'OFFICE',
    url: '#office',
    icon: Briefcase,
    description: 'Communication'
  },
  {
    id: '2',
    title: 'ACTIVITIES',
    url: '#activities',
    icon: Gamepad2,
    description: 'Event Catalog'
  },
  {
    id: 'cat2',
    title: 'TOOLS',
    url: '#tools',
    icon: Wrench,
    description: 'Utilities'
  },
  {
    id: '11',
    title: 'CODING',
    url: '#coding',
    icon: Code,
    description: 'Dev Tools'
  }
];

// Activity Submenu Links
export const ACTIVITY_LINKS: HubLink[] = [
  // Group 1
  { id: 'a1', title: 'TEAMPLAY', url: 'https://play.eventday.dk', icon: Users, description: 'Cooperation', badge: 'ACTIVE' },
  { id: 'a2', title: 'TEAMCHALLENGE', url: '#team_challenge', icon: Trophy, description: 'Competition', badge: 'ACTIVE' },
  { id: 'a2_2', title: 'TEAMCHALLENGE 2', url: 'https://teamaction.netlify.app/', icon: Trophy, description: 'Competition', badge: 'ACTIVE' },
  { id: 'a3', title: 'TEAMTASTE', url: 'https://taste.eventday.dk', icon: Utensils, description: 'Culinary', badge: 'ACTIVE' },
  
  // Group 2
  { id: 'a4', title: 'TEAMLAZER', url: '#', icon: Zap, description: 'Laser Combat' },
  { id: 'a5', title: 'TEAMROBIN', url: '#', icon: Target, description: 'Archery' },
  { id: 'a6', title: 'TEAMSEGWAY', url: '#', icon: Navigation, description: 'Transporters' },
  
  // Group 3
  { id: 'a7', title: 'TEAMCONNECT', url: '#', icon: CircleDot, description: 'Networking' },
  { id: 'a8', title: 'TEAMBOX', url: '#', icon: Package, description: 'Portable Events' },
  { id: 'a9', title: 'TEAMCONTROL', url: '#', icon: Gamepad2, description: 'Strategy' },
  
  // Group 4
  { id: 'a10', title: 'TEAMACTION', url: '#', icon: Swords, description: 'High Intensity' },
  { id: 'a11', title: 'TEAMCONSTRUCT', url: '#', icon: Hammer, description: 'Building' },
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

// Coding Submenu Links
export const CODING_LINKS: HubLink[] = [
  {
    id: 'c1',
    title: 'Builder.io',
    url: 'https://builder.io/app/projects',
    icon: Hammer,
    description: 'Visual CMS'
  },
  {
    id: 'c2',
    title: 'AI STUDIO',
    url: 'https://aistudio.google.com/',
    icon: Bot,
    description: 'Google Gemini'
  }
];