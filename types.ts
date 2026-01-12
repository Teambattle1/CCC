import { LucideIcon } from 'lucide-react';

export interface HubLink {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  logoUrl?: string;
  color?: string;
}