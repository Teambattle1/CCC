import { LucideIcon } from 'lucide-react';

export interface HubLink {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  badgeColor?: 'orange' | 'pink' | 'green' | 'blue' | 'red';
  logoUrl?: string;
  color?: string;
  section?: string;
}