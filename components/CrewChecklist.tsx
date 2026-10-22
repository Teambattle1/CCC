import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { version } from '../package.json';
import ChecklistMode from './ChecklistMode';
import { CREW_SCREENS } from '../lib/cmScreens';

// Checklist mode i CREW — fælles modul med FLOW og EventDay (se ChecklistMode.tsx).
// Skærmen = `?view=` (nuqs-routeren); kun en ADMIN-profil får laget.
const routeKey = (): string => new URLSearchParams(window.location.search).get('view') || 'main';

const CrewChecklist: React.FC = () => {
  const { profile } = useAuth();
  return (
    <ChecklistMode
      app="crew"
      appName="CREW"
      version={version}
      isAdmin={profile?.role === 'ADMIN'}
      supabase={supabase}
      screens={CREW_SCREENS}
      routeKey={routeKey}
      getContext={() => ({ user: profile?.email || undefined, role: profile?.role })}
    />
  );
};

export default CrewChecklist;
