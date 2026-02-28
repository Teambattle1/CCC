import React, { useEffect, useState } from 'react';
import {
  MapPin, Clock, Users, UserCheck, CalendarDays, FileText,
  Navigation as NavIcon, Truck, ChevronRight, Package,
  Zap, Target, CircleDot, Gamepad2, Hammer, Car, Swords,
  Utensils, Trophy, LucideIcon
} from 'lucide-react';
import { TaskJob, ResolvedActivity, CrewAssignment, fetchJobCrew } from '../lib/supabase';

interface JobOverviewProps {
  job: TaskJob;
  activities: ResolvedActivity[];
  onNavigateActivity: (viewState: string) => void;
}

// Map activity names to icons and colors (matching ACTIVITY_LINKS in constants.ts)
const ACTIVITY_STYLE: Record<string, { icon: LucideIcon; color: string }> = {
  'teamplay':       { icon: Users,    color: 'text-battle-orange' },
  'team_challenge':  { icon: Trophy,   color: 'text-pink-500' },
  'teamtaste':      { icon: Utensils,  color: 'text-yellow-500' },
  'teamlazer':      { icon: Zap,       color: 'text-blue-500' },
  'teamrobin':      { icon: Target,    color: 'text-green-400' },
  'teamsegway':     { icon: NavIcon,   color: 'text-red-800' },
  'teamconnect':    { icon: CircleDot, color: 'text-purple-500' },
  'teambox':        { icon: Package,   color: 'text-gray-400' },
  'teamcontrol':    { icon: Gamepad2,  color: 'text-white' },
  'teamaction':     { icon: Swords,    color: 'text-sky-400' },
  'teamconstruct':  { icon: Hammer,    color: 'text-yellow-400' },
  'teamrace':       { icon: Car,       color: 'text-orange-500' },
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
};

const Section: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-black/30 rounded-xl border border-white/10 p-4 space-y-2">
    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
      <Icon size={14} />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const JobOverview: React.FC<JobOverviewProps> = ({ job, activities, onNavigateActivity }) => {
  const [crew, setCrew] = useState<CrewAssignment[]>([]);

  useEffect(() => {
    fetchJobCrew(job.id).then(setCrew);
  }, [job.id]);

  const eventDate = formatDate(job.event_date);
  const startTime = formatTime(job.event_date);
  const endTime = formatTime(job.event_end);
  const getInTimeLocation = formatTime(job.get_in_time_location);
  const getInTimeStorage = formatTime(job.get_in_time_storage);

  return (
    <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        {job.short_code && (
          <span className="inline-block font-mono text-sm font-bold text-battle-orange bg-battle-orange/10 border border-battle-orange/30 px-3 py-1 rounded-lg mb-1">
            OPGAVE #{job.short_code}
          </span>
        )}
        <h2 className="text-white text-xl font-bold">
          {job.client_name || 'Ingen kunde'}
        </h2>
        {eventDate && (
          <p className="text-battle-orange text-sm font-medium">{eventDate}</p>
        )}
        {(startTime || endTime) && (
          <p className="text-gray-400 text-sm">
            {startTime}{endTime ? ` — ${endTime}` : ''}
            {job.duration_minutes ? ` (${job.duration_minutes} min)` : ''}
          </p>
        )}
        {job.status && (
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 uppercase">
            {job.status}
          </span>
        )}
      </div>

      {/* Activities - Primary section */}
      {activities.length > 0 && (
        <div className="space-y-2">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center">
            Aktiviteter
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activities.map((act) => {
              const style = ACTIVITY_STYLE[act.viewState] || { icon: ChevronRight, color: 'text-battle-orange' };
              const Icon = style.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => onNavigateActivity(act.viewState)}
                  className="flex items-center gap-3 bg-battle-grey/50 hover:bg-battle-grey/80 border border-white/10 hover:border-battle-orange/40 rounded-xl p-3 transition-all active:scale-95"
                >
                  <div className={`${style.color}`}>
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-white text-sm font-bold">
                    {act.name.startsWith('Team') ? (
                      <>
                        <span className="text-white">Team</span>
                        <span className="text-gray-300">{act.name.slice(4)}</span>
                      </>
                    ) : act.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Ingen aktiviteter tildelt denne opgave
        </div>
      )}

      {/* Location */}
      {(job.location_name || job.location_address) && (
        <Section title="Lokation" icon={MapPin}>
          {job.location_name && <p className="text-white text-sm font-medium">{job.location_name}</p>}
          {job.location_address && <p className="text-gray-400 text-xs">{job.location_address}</p>}
        </Section>
      )}

      {/* Logistics */}
      {(job.guests_count || job.instructors_count || job.assistants_count) && (
        <Section title="Bemanding" icon={Users}>
          <div className="grid grid-cols-3 gap-2">
            {job.guests_count != null && (
              <div className="text-center">
                <div className="text-white text-lg font-bold">{job.guests_count}</div>
                <div className="text-gray-500 text-[10px] uppercase">Gæster</div>
              </div>
            )}
            {job.instructors_count != null && (
              <div className="text-center">
                <div className="text-white text-lg font-bold">{job.instructors_count}</div>
                <div className="text-gray-500 text-[10px] uppercase">Instruktører</div>
              </div>
            )}
            {job.assistants_count != null && (
              <div className="text-center">
                <div className="text-white text-lg font-bold">{job.assistants_count}</div>
                <div className="text-gray-500 text-[10px] uppercase">Assistenter</div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Get-in info */}
      {(job.get_in_location || getInTimeLocation || getInTimeStorage) && (
        <Section title="Get-in" icon={Clock}>
          {job.get_in_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lokation</span>
              <span className="text-white">{job.get_in_location}</span>
            </div>
          )}
          {getInTimeStorage && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lager</span>
              <span className="text-white">{getInTimeStorage}</span>
            </div>
          )}
          {getInTimeLocation && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lokation</span>
              <span className="text-white">{getInTimeLocation}</span>
            </div>
          )}
          {job.get_back_location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Retur</span>
              <span className="text-white">{job.get_back_location}</span>
            </div>
          )}
        </Section>
      )}

      {/* Crew */}
      {crew.length > 0 && (
        <Section title="Crew" icon={UserCheck}>
          <div className="space-y-1">
            {crew.map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white">{c.employee_name}</span>
                <span className="text-gray-500 text-xs uppercase">{c.role}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Setup/Teardown */}
      {(job.lane_setup || job.lane_teardown) && (
        <Section title="Bane" icon={Truck}>
          {job.lane_setup && (
            <div>
              <div className="text-gray-500 text-[10px] uppercase mb-0.5">Opsætning</div>
              <p className="text-white text-sm">{job.lane_setup}</p>
            </div>
          )}
          {job.lane_teardown && (
            <div>
              <div className="text-gray-500 text-[10px] uppercase mb-0.5">Nedtagning</div>
              <p className="text-white text-sm">{job.lane_teardown}</p>
            </div>
          )}
        </Section>
      )}

      {/* Notes */}
      {job.notes && (
        <Section title="Noter" icon={FileText}>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{job.notes}</p>
        </Section>
      )}
    </div>
  );
};

export default JobOverview;
