import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ilbjytyukicbssqftmma.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYmp5dHl1a2ljYnNzcWZ0bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzA0NjEsImV4cCI6MjA3MDQwNjQ2MX0.I_PWByMPcOYhWgeq9MxXgOo-NCZYfEuzYmo35XnBFAY';
// Service role key for admin operations (password reset)
// Find this in Supabase Dashboard > Settings > API > service_role key
// IMPORTANT: Replace this with your actual service role key
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYmp5dHl1a2ljYnNzcWZ0bW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzMDQ2MSwiZXhwIjoyMDcwNDA2NDYxfQ.eCy-vQByybGSFx5QdWQHMGo0LkGQk2LD5fU3oHXpSro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User role types
export type UserRole = 'INSTRUCTOR' | 'GAMEMASTER' | 'ADMIN';

// User interface
export interface OCCUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  created_at: string;
  last_login?: string;
}

// Activity log interface
export interface ActivityLog {
  id?: string;
  user_id: string;
  user_email: string;
  action: string;
  page?: string;
  details?: string;
  timestamp: string;
  ip_address?: string;
}

// Log user activity
export const logActivity = async (
  userId: string,
  userEmail: string,
  action: string,
  page?: string,
  details?: string
) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        action,
        page,
        details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

// Get user profile with role (with timeout)
export const getUserProfile = async (userId: string): Promise<OCCUser | null> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching user profile:', error);
          return null;
        }
        return data as OCCUser;
      });

    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    console.error('Failed to get user profile:', err);
    return null;
  }
};

// Update last login
export const updateLastLogin = async (userId: string) => {
  try {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (err) {
    console.error('Failed to update last login:', err);
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<OCCUser[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data as OCCUser[];
  } catch (err) {
    console.error('Failed to get users:', err);
    return [];
  }
};

// Get activity logs (admin only)
export const getActivityLogs = async (limit = 100): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }

    return data as ActivityLog[];
  } catch (err) {
    console.error('Failed to get activity logs:', err);
    return [];
  }
};

// Create new user (admin only)
export const createUser = async (
  email: string,
  password: string,
  role: UserRole,
  name?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: false, error: 'EMAIL_EXISTS' };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // User might exist in auth but not in users table
      if (authError.message.includes('User already registered')) {
        return { success: false, error: 'EMAIL_EXISTS' };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create user profile with role (use upsert to handle edge cases)
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        role,
        name,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to create user' };
  }
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to update user role' };
  }
};

// Update user name (admin only)
export const updateUserName = async (
  userId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ name: newName })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to update user name' };
  }
};

// Delete user (admin only)
export const deleteUser = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete user' };
  }
};

// Update user password (admin only) - requires service role key
// For this to work, you need to create a Supabase Edge Function or use service role
export const updateUserPassword = async (
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use the admin API - this requires service role key
    // We'll use a workaround: call the Supabase Auth Admin API directly
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        password: newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to update password' };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to update password:', err);
    return { success: false, error: 'Failed to update password' };
  }
};

// TeamLazer Scorecard Types
export interface TeamLazerScore {
  id?: string;
  session_name: string;
  teams_data: unknown;
  scores_data: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// Save TeamLazer Scorecard
export const saveTeamLazerScore = async (
  sessionName: string,
  teamsData: unknown,
  scoresData: unknown,
  sessionId?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (sessionId) {
      // Update existing session
      const { error } = await supabase
        .from('teamlazer_scores')
        .update({
          session_name: sessionName,
          teams_data: teamsData,
          scores_data: scoresData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: sessionId };
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('teamlazer_scores')
        .insert({
          session_name: sessionName,
          teams_data: teamsData,
          scores_data: scoresData,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: data?.id };
    }
  } catch (err) {
    console.error('Failed to save TeamLazer score:', err);
    return { success: false, error: 'Failed to save score' };
  }
};

// Load TeamLazer Scorecard
export const loadTeamLazerScore = async (
  sessionId: string
): Promise<{ success: boolean; data?: TeamLazerScore; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('teamlazer_scores')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as TeamLazerScore };
  } catch (err) {
    console.error('Failed to load TeamLazer score:', err);
    return { success: false, error: 'Failed to load score' };
  }
};

// Get all TeamLazer Scorecards
export const getAllTeamLazerScores = async (): Promise<{ success: boolean; data?: TeamLazerScore[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('teamlazer_scores')
      .select('id, session_name, created_at, updated_at, created_by')
      .order('updated_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as TeamLazerScore[] };
  } catch (err) {
    console.error('Failed to get TeamLazer scores:', err);
    return { success: false, error: 'Failed to get scores' };
  }
};

// Delete TeamLazer Scorecard
export const deleteTeamLazerScore = async (
  sessionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('teamlazer_scores')
      .delete()
      .eq('id', sessionId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to delete TeamLazer score:', err);
    return { success: false, error: 'Failed to delete score' };
  }
};

// Guide Section Types
export interface GuideSection {
  id?: string;
  activity: string;
  section_key: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  icon_key?: string;
  linked_packing_list?: string; // Format: "activity:list_type" e.g. "teamconstruct:afgang"
  order_index: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// Get all guide sections for an activity
export const getGuideSections = async (
  activity: string
): Promise<{ success: boolean; data?: GuideSection[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('guide_sections')
      .select('*')
      .eq('activity', activity)
      .order('order_index', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as GuideSection[] };
  } catch (err) {
    console.error('Failed to get guide sections:', err);
    return { success: false, error: 'Failed to get guide sections' };
  }
};

// Save or update a guide section
export const saveGuideSection = async (
  section: GuideSection
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // First, try to find existing section by activity + section_key if no id provided
    let sectionId = section.id;

    if (!sectionId) {
      const { data: existing } = await supabase
        .from('guide_sections')
        .select('id')
        .eq('activity', section.activity)
        .eq('section_key', section.section_key)
        .single();

      if (existing) {
        sectionId = existing.id;
      }
    }

    if (sectionId) {
      // Update existing section
      const updateData = {
        title: section.title,
        content: section.content,
        image_url: section.image_url ?? null,
        video_url: section.video_url ?? null,
        icon_key: section.icon_key ?? null,
        linked_packing_list: section.linked_packing_list ?? null,
        order_index: section.order_index,
        category: section.category,
        updated_at: new Date().toISOString()
      };
      console.log('Updating section with id:', sectionId, 'data:', updateData);
      const { error } = await supabase
        .from('guide_sections')
        .update(updateData)
        .eq('id', sectionId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: sectionId };
    } else {
      // Create new section
      const { data, error } = await supabase
        .from('guide_sections')
        .insert({
          activity: section.activity,
          section_key: section.section_key,
          title: section.title,
          content: section.content,
          image_url: section.image_url ?? null,
          video_url: section.video_url ?? null,
          icon_key: section.icon_key ?? null,
          linked_packing_list: section.linked_packing_list ?? null,
          order_index: section.order_index,
          category: section.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: data?.id };
    }
  } catch (err) {
    console.error('Failed to save guide section:', err);
    return { success: false, error: 'Failed to save section' };
  }
};

// Delete a guide section
export const deleteGuideSection = async (
  sectionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('guide_sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to delete guide section:', err);
    return { success: false, error: 'Failed to delete section' };
  }
};

// Upload image for guide section
export const uploadGuideImage = async (
  file: File,
  activity: string,
  sectionKey: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${activity}/${sectionKey}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('guide-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('guide-images')
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('Failed to upload guide image:', err);
    return { success: false, error: 'Failed to upload image' };
  }
};

// ============ TeamRace Scorecard Types ============
export interface TeamRaceSession {
  id?: string;
  session_name: string;
  tournament_data: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// Save TeamRace Session
export const saveTeamRaceSession = async (
  sessionName: string,
  tournamentData: unknown,
  sessionId?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (sessionId) {
      // Update existing session
      const { error } = await supabase
        .from('teamrace_sessions')
        .update({
          session_name: sessionName,
          tournament_data: tournamentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: sessionId };
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('teamrace_sessions')
        .insert({
          session_name: sessionName,
          tournament_data: tournamentData,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, id: data?.id };
    }
  } catch (err) {
    console.error('Failed to save TeamRace session:', err);
    return { success: false, error: 'Failed to save session' };
  }
};

// Load TeamRace Session
export const loadTeamRaceSession = async (
  sessionId: string
): Promise<{ success: boolean; data?: TeamRaceSession; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('teamrace_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as TeamRaceSession };
  } catch (err) {
    console.error('Failed to load TeamRace session:', err);
    return { success: false, error: 'Failed to load session' };
  }
};

// Get all TeamRace Sessions
export const getAllTeamRaceSessions = async (): Promise<{ success: boolean; data?: TeamRaceSession[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('teamrace_sessions')
      .select('id, session_name, created_at, updated_at, created_by')
      .order('updated_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as TeamRaceSession[] };
  } catch (err) {
    console.error('Failed to get TeamRace sessions:', err);
    return { success: false, error: 'Failed to get sessions' };
  }
};

// Delete TeamRace Session
export const deleteTeamRaceSession = async (
  sessionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('teamrace_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to delete TeamRace session:', err);
    return { success: false, error: 'Failed to delete session' };
  }
};

// ============ Fejlsogning Reports ============

// Get count of unread fejlsogning reports (reports from last 24 hours or unresolved)
export const getUnreadFejlsogningCount = async (): Promise<{ count: number; error?: string }> => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count, error } = await supabase
      .from('fejlsogning_reports')
      .select('*', { count: 'exact', head: true })
      .or(`resolved.is.null,resolved.eq.false`)
      .gte('created_at', oneDayAgo.toISOString());

    if (error) throw error;
    return { count: count || 0 };
  } catch (err) {
    console.error('Failed to get unread fejlsogning count:', err);
    return { count: 0, error: 'Failed to get count' };
  }
};

// Subscribe to new fejlsogning reports (realtime)
export const subscribeFejlsogningReports = (
  callback: (payload: { count: number }) => void
) => {
  const channel = supabase
    .channel('fejlsogning-reports-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'fejlsogning_reports'
      },
      async () => {
        // Get updated count when new report is inserted
        const { count } = await getUnreadFejlsogningCount();
        callback({ count });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'fejlsogning_reports'
      },
      async () => {
        // Get updated count when report is updated (e.g., resolved)
        const { count } = await getUnreadFejlsogningCount();
        callback({ count });
      }
    )
    .subscribe();

  return channel;
};

// ============ Packing List Email Notification ============

export const sendPackingEmail = async (data: {
  activity: string;
  listType: string;
  completedBy: string;
  completedByName: string;
  durationSeconds: number;
  itemsChecked: number;
  itemsTotal: number;
}): Promise<{ success: boolean; warning?: string }> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-packing-email', {
      body: data
    });

    if (error) {
      console.warn('Email notification failed:', error);
      return { success: false, warning: error.message };
    }

    return { success: result?.success ?? false, warning: result?.warning };
  } catch (err) {
    console.warn('Email notification error:', err);
    return { success: false, warning: 'Network error' };
  }
};

// ============ OCC Task Job Integration ============

// OCC Activity ID → CCC ViewState mapping
export const ACTIVITY_TO_VIEW: Record<string, string> = {
  'A1':  'team_challenge',
  'A2':  'teamlazer',
  'A3':  'teamrobin',
  'A4':  'teambox',
  'A5':  'teamconnect',
  'A6':  'teamplay',
  'A7':  'teamtaste',
  'A8':  'teamsegway',
  'A9':  'teamcontrol',
  'A10': 'teamconstruct',
  'A11': 'teamaction',
  'A12': 'teamrace',
};

export interface TaskJob {
  id: string;
  short_code: string | null;
  client_name: string | null;
  event_date: string | null;
  event_end: string | null;
  duration_minutes: number | null;
  activities: string[] | null;
  location_name: string | null;
  location_address: string | null;
  guests_count: number | null;
  instructors_count: number | null;
  assistants_count: number | null;
  get_in_location: string | null;
  get_in_time_storage: string | null;
  get_in_time_location: string | null;
  get_back_location: string | null;
  vehicle_id: string | null;
  trailer_id: string | null;
  lane_setup: string | null;
  lane_teardown: string | null;
  notes: string | null;
  status: string | null;
}

export interface ResolvedActivity {
  id: string;
  name: string;
  viewState: string;
}

export interface CrewAssignment {
  employee_name: string;
  role: string;
}

// Fetch a task job by 4-digit short_code
export const fetchTaskJobByCode = async (
  shortCode: string
): Promise<{ success: boolean; data?: TaskJob; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('task_jobs')
      .select('id, short_code, client_name, event_date, event_end, duration_minutes, activities, location_name, location_address, guests_count, instructors_count, assistants_count, get_in_location, get_in_time_storage, get_in_time_location, get_back_location, vehicle_id, trailer_id, lane_setup, lane_teardown, notes, status')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as TaskJob };
  } catch (err) {
    return { success: false, error: 'Kunne ikke hente opgave' };
  }
};

// Resolve OCC activity IDs to names + CCC view states
export const resolveActivities = async (
  activityIds: string[]
): Promise<ResolvedActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('id, name')
      .in('id', activityIds);

    if (error || !data) return [];
    return data
      .map(a => ({
        id: a.id,
        name: a.name,
        viewState: ACTIVITY_TO_VIEW[a.id] || ''
      }))
      .filter(a => a.viewState !== '');
  } catch {
    return [];
  }
};

// Fetch crew assignments for a job
export const fetchJobCrew = async (
  jobId: string
): Promise<CrewAssignment[]> => {
  try {
    const { data, error } = await supabase
      .from('job_crew_assignments')
      .select('role, employee_id')
      .eq('job_id', jobId);

    if (error || !data || data.length === 0) return [];

    const employeeIds = data.map(d => d.employee_id);
    const { data: employees } = await supabase
      .from('employees')
      .select('id, navn')
      .in('id', employeeIds);

    const nameMap: Record<string, string> = {};
    (employees || []).forEach((e: { id: string; navn: string }) => {
      nameMap[e.id] = e.navn || e.id;
    });

    return data.map(d => ({
      employee_name: nameMap[d.employee_id] || d.employee_id,
      role: d.role || 'instruktør'
    }));
  } catch {
    return [];
  }
};

// Fetch all employees (for instructor selection)
export interface Employee {
  id: string;
  name: string;
}

export const fetchAllEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, navn')
      .order('navn');

    if (error || !data) return [];
    return data.map((e: { id: string; navn: string }) => ({
      id: e.id,
      name: e.navn
    }));
  } catch {
    return [];
  }
};

// Shared select fields for task_jobs queries
const TASK_JOB_SELECT = 'id, short_code, client_name, event_date, event_end, duration_minutes, activities, location_name, location_address, guests_count, instructors_count, assistants_count, get_in_location, get_in_time_storage, get_in_time_location, get_back_location, vehicle_id, trailer_id, lane_setup, lane_teardown, notes, status';

// Fetch all jobs scheduled for today
export const fetchTodayJobs = async (): Promise<TaskJob[]> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const { data, error } = await supabase
      .from('task_jobs')
      .select(TASK_JOB_SELECT)
      .gte('event_date', startOfDay.toISOString())
      .lte('event_date', endOfDay.toISOString())
      .order('event_date', { ascending: true });

    if (error) {
      console.error('fetchTodayJobs error:', error.message);
      return [];
    }
    return (data as TaskJob[]) || [];
  } catch (err) {
    console.error('fetchTodayJobs exception:', err);
    return [];
  }
};
