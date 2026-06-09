import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ilbjytyukicbssqftmma.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYmp5dHl1a2ljYnNzcWZ0bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzA0NjEsImV4cCI6MjA3MDQwNjQ2MX0.I_PWByMPcOYhWgeq9MxXgOo-NCZYfEuzYmo35XnBFAY';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

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

// ============ CCC Permissions ============

// Fetch CCC permissions for current user from database
export const fetchCCCPermissions = async (
  userId: string
): Promise<Record<string, boolean>> => {
  try {
    const { data, error } = await supabase
      .from('ccc_permissions')
      .select('permission_key, granted')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching CCC permissions:', error);
      return {};
    }

    const perms: Record<string, boolean> = {};
    (data || []).forEach((row: { permission_key: string; granted: boolean }) => {
      perms[row.permission_key] = row.granted;
    });
    return perms;
  } catch (err) {
    console.error('Failed to fetch CCC permissions:', err);
    return {};
  }
};

// ============ My Jobs (per-user) ============

// Fetch jobs assigned to a user (via email → employees → job_crew_assignments)
export const fetchMyJobs = async (
  userEmail: string
): Promise<TaskJob[]> => {
  try {
    // Find employee by email
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('id')
      .ilike('email', userEmail)
      .single();

    if (empError || !emp) return [];

    // Find job IDs assigned to this employee
    const { data: assignments, error: assignError } = await supabase
      .from('job_crew_assignments')
      .select('job_id')
      .eq('employee_id', emp.id);

    if (assignError || !assignments || assignments.length === 0) return [];

    const jobIds = assignments.map(a => a.job_id);

    // Fetch those jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('task_jobs')
      .select(TASK_JOB_SELECT)
      .in('id', jobIds)
      .order('event_date', { ascending: false });

    if (jobsError || !jobs) return [];
    return jobs as TaskJob[];
  } catch {
    return [];
  }
};

// ============ Job Packing Items ============

export interface JobPackingItem {
  id: string;
  job_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  activity_id: string | null;
}

export const fetchJobPackingItems = async (
  jobId: string
): Promise<JobPackingItem[]> => {
  try {
    const { data, error } = await supabase
      .from('job_packing_items')
      .select('*')
      .eq('job_id', jobId);

    if (error || !data) return [];
    return data as JobPackingItem[];
  } catch {
    return [];
  }
};

// Fetch vehicle assignments for a job
export interface VehicleAssignment {
  vehicle_id: string | null;
  trailer_id: string | null;
  car_name: string | null;
  car_reg: string | null;
  car_team_id: number | null;
  trailer_name: string | null;
  trailer_reg: string | null;
  trailer_team_id: number | null;
}

export const fetchJobVehicles = async (
  jobId: string
): Promise<VehicleAssignment[]> => {
  try {
    const { data, error } = await supabase
      .from('job_vehicle_assignments')
      .select('vehicle_id, trailer_id')
      .eq('job_id', jobId);

    if (error || !data || data.length === 0) return [];

    const vehicleIds = data.map(d => d.vehicle_id).filter(Boolean);
    const trailerIds = data.map(d => d.trailer_id).filter(Boolean);

    const [carsRes, trailersRes] = await Promise.all([
      vehicleIds.length > 0
        ? supabase.from('cars').select('id, registreringsnr, model, team_id').in('id', vehicleIds)
        : { data: [] },
      trailerIds.length > 0
        ? supabase.from('trailers').select('id, registreringsnr, brand, model, nickname, team_id').in('id', trailerIds)
        : { data: [] },
    ]);

    const carMap: Record<string, { reg: string; model: string; team_id: number | null }> = {};
    ((carsRes.data as any[]) || []).forEach(c => {
      carMap[c.id] = { reg: c.registreringsnr || '', model: c.model || '', team_id: c.team_id };
    });

    const trailerMap: Record<string, { reg: string; name: string; team_id: number | null }> = {};
    ((trailersRes.data as any[]) || []).forEach(t => {
      trailerMap[t.id] = {
        reg: t.registreringsnr || '',
        name: t.nickname || `${t.brand || ''} ${t.model || ''}`.trim(),
        team_id: t.team_id,
      };
    });

    return data.map(d => ({
      vehicle_id: d.vehicle_id,
      trailer_id: d.trailer_id,
      car_name: d.vehicle_id ? `${carMap[d.vehicle_id]?.reg || ''}${carMap[d.vehicle_id]?.model ? ` (${carMap[d.vehicle_id].model})` : ''}` : null,
      car_reg: d.vehicle_id ? carMap[d.vehicle_id]?.reg || null : null,
      car_team_id: d.vehicle_id ? carMap[d.vehicle_id]?.team_id || null : null,
      trailer_name: d.trailer_id ? trailerMap[d.trailer_id]?.name || trailerMap[d.trailer_id]?.reg || null : null,
      trailer_reg: d.trailer_id ? trailerMap[d.trailer_id]?.reg || null : null,
      trailer_team_id: d.trailer_id ? trailerMap[d.trailer_id]?.team_id || null : null,
    }));
  } catch {
    return [];
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
  client_contact_name: string | null;
  client_contact_phone: string | null;
  client_contact_email: string | null;
  client_logo_url: string | null;
  client_website: string | null;
  agency: string | null;
  customer_number: string | null;
  customer_type: string | null;
  lead_source: string | null;
  language: string | null;
  kun_tilbud: boolean | null;
  privat: boolean | null;
  event_date: string | null;
  event_end: string | null;
  event_time: string | null;
  duration_minutes: number | null;
  activities: string[] | null;
  activity_counts: Record<string, string> | null;
  activity_sessions: Record<string, string> | null;
  location_name: string | null;
  location_address: string | null;
  location_city: string | null;
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
  task_notes: string | null;
  timing_note: string | null;
  crew_note: string | null;
  aktiviteter_note: string | null;
  gear_note: string | null;
  transport_note: string | null;
  location_note: string | null;
  payment_note: string | null;
  bil_tankes: boolean | null;
  bil_oplades: boolean | null;
  bord_skaere_80: number | null;
  bord_folde_180: number | null;
  bord_folde_240: number | null;
  hoeje_cafeborde: number | null;
  dug_180: number | null;
  dug_240: number | null;
  dug_rund_80: number | null;
  opgave_id: number | null;
  opgave_status: string | null;
  status: string | null;
  skal_evalueres: boolean | null;
  evaluation_score: number | null;
  evaluation_notes: string | null;
  // Payment fields
  payment_method: string | null;
  payment_amount: string | null;
  payment_card_fee: string | null;
  payment_contact: string | null;
  faktura_sendt: boolean | null;
  mobilepay: boolean | null;
  mobilepay_amount: string | null;
  mobilepay_received: string | null;
  mobilepay_note: string | null;
  kontant_amount: string | null;
  kontant_received: string | null;
  kontant_note: string | null;
  ub_note: string | null;
  // Kontaktet fields
  kunde_kontaktet: boolean | null;
  kunde_kontaktet_dato: string | null;
  kunde_kontaktet_note: string | null;
  location_kontaktet: boolean | null;
  location_kontaktet_dato: string | null;
  hotel_kontaktet: string | null;
  hotel_kontaktet_dato: string | null;
  hotel_kontaktet_note: string | null;
  // Extra
  firma_info: string | null;
  sms_sendt: string | null;
}

export interface ResolvedActivity {
  id: string;
  name: string;
  viewState: string;
}

export interface ActivityInfo {
  id: string;
  name: string;
  pack_time_minutes: number | null;
  setup_time_minutes: number | null;
  unpack_time_minutes: number | null;
  default_duration: number | null;
  default_rounds: number | null;
}

// Fetch activity logistics info (pack/setup/unpack times)
export const fetchActivityInfo = async (
  activityIds: string[]
): Promise<ActivityInfo[]> => {
  if (!activityIds.length) return [];
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('id, name, pack_time_minutes, setup_time_minutes, unpack_time_minutes, default_duration, default_rounds')
      .in('id', activityIds);

    if (error || !data) return [];
    return data as ActivityInfo[];
  } catch {
    return [];
  }
};

export interface CrewAssignment {
  employee_name: string;
  employee_phone: string | null;
  role: string;
}

// Fetch a task job by 4-digit short_code
export const fetchTaskJobByCode = async (
  shortCode: string
): Promise<{ success: boolean; data?: TaskJob; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('task_jobs')
      .select(TASK_JOB_SELECT)
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
      .select('id, navn, telefon')
      .in('id', employeeIds);

    const empMap: Record<string, { navn: string; telefon: string | null }> = {};
    (employees || []).forEach((e: { id: string; navn: string; telefon?: string | null }) => {
      empMap[e.id] = { navn: e.navn || e.id, telefon: e.telefon || null };
    });

    return data.map(d => ({
      employee_name: empMap[d.employee_id]?.navn || d.employee_id,
      employee_phone: empMap[d.employee_id]?.telefon || null,
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
const TASK_JOB_SELECT = 'id, short_code, client_name, client_contact_name, client_contact_phone, client_contact_email, client_logo_url, client_website, agency, customer_number, customer_type, language, lead_source, kun_tilbud, privat, event_date, event_end, event_time, duration_minutes, activities, activity_counts, activity_sessions, location_name, location_address, location_city, guests_count, instructors_count, assistants_count, get_in_location, get_in_time_storage, get_in_time_location, get_back_location, vehicle_id, trailer_id, lane_setup, lane_teardown, notes, task_notes, timing_note, crew_note, aktiviteter_note, gear_note, transport_note, location_note, payment_note, bil_tankes, bil_oplades, bord_skaere_80, bord_folde_180, bord_folde_240, hoeje_cafeborde, dug_180, dug_240, dug_rund_80, opgave_id, opgave_status, status, skal_evalueres, evaluation_score, evaluation_notes, payment_method, payment_amount, payment_card_fee, payment_contact, faktura_sendt, mobilepay, mobilepay_amount, mobilepay_received, mobilepay_note, kontant_amount, kontant_received, kontant_note, ub_note, kunde_kontaktet, kunde_kontaktet_dato, kunde_kontaktet_note, location_kontaktet, location_kontaktet_dato, hotel_kontaktet, hotel_kontaktet_dato, hotel_kontaktet_note, firma_info, sms_sendt';

// Fetch all jobs scheduled for today
export const fetchTodayJobs = async (
  userEmail?: string,
  isAdmin?: boolean
): Promise<TaskJob[]> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Admin/Gamemaster sees ALL jobs today
    if (isAdmin) {
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
    }

    // Non-admin: only show jobs assigned to this user
    if (!userEmail) return [];

    // Find employee by email
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('id')
      .ilike('email', userEmail)
      .single();

    if (empError || !emp) return [];

    // Find today's job IDs assigned to this employee
    const { data: assignments, error: assignError } = await supabase
      .from('job_crew_assignments')
      .select('job_id')
      .eq('employee_id', emp.id);

    if (assignError || !assignments || assignments.length === 0) return [];

    const jobIds = assignments.map(a => a.job_id);

    // Fetch those jobs filtered to today
    const { data: jobs, error: jobsError } = await supabase
      .from('task_jobs')
      .select(TASK_JOB_SELECT)
      .in('id', jobIds)
      .gte('event_date', startOfDay.toISOString())
      .lte('event_date', endOfDay.toISOString())
      .order('event_date', { ascending: true });

    if (jobsError || !jobs) return [];
    return jobs as TaskJob[];
  } catch (err) {
    console.error('fetchTodayJobs exception:', err);
    return [];
  }
};

// ─── IDEAS (stored as TODOs in OCC todos table) ─────────────────────────────

const MARIA_EMPLOYEE_ID = 'emp_z4ftvagjq';

export interface IdeaTodo {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  created_at: string;
  resolved: boolean;
  priority: string | null;
  category: string | null;
}

export const submitIdea = async (
  ideaText: string,
  authorName: string,
  authorEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const { error } = await supabase
      .from('todos')
      .insert({
        title: `💡 IDÉBOKS: ${ideaText.substring(0, 80)}${ideaText.length > 80 ? '...' : ''}`,
        description: `<p><strong>Idé:</strong> ${ideaText}</p><p><strong>Fra:</strong> ${authorName} (${authorEmail})</p><p><strong>Dato:</strong> ${dateStr}</p>`,
        assigned_to: MARIA_EMPLOYEE_ID,
        priority: 'Normal',
        category: 'IDEER',
        resolved: false,
        is_error: false,
      });

    if (error) {
      console.error('submitIdea error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('submitIdea exception:', err);
    return { success: false, error: 'Uventet fejl' };
  }
};

export const fetchIdeas = async (): Promise<IdeaTodo[]> => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('id, title, description, assigned_to, created_at, resolved, priority, category')
      .eq('category', 'IDEER')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as IdeaTodo[];
  } catch (err) {
    console.error('fetchIdeas exception:', err);
    return [];
  }
};

// ─── FEJLRAPPORTER → TODO Integration ────────────────────────────────────────

// Admin employee IDs for notifications
const ADMIN_EMPLOYEE_IDS = ['emp_z4ftvagjq', 'emp_0yyp87nsx', 'emp_g441rvbk5']; // Maria, Thomas, Kim

export interface FejlrapportData {
  activity: string;
  activityName: string;
  gear: string;
  date: string;
  description: string;
  imageUrls: string[];
  reporterName: string;
  reporterEmail: string;
  haster: boolean;
}

export const submitFejlrapportAsTodo = async (
  data: FejlrapportData
): Promise<{ success: boolean; todoId?: string; error?: string }> => {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // 1. Save to fejlsogning_reports table
    const { data: report, error: reportError } = await supabase
      .from('fejlsogning_reports')
      .insert({
        activity: data.activity,
        activity_name: data.activityName,
        date: data.date,
        gear: data.gear,
        description: data.description,
        image_url: data.imageUrls.length > 0 ? data.imageUrls[0] : null,
        image_urls: data.imageUrls,
        haster: data.haster,
        reported_by: data.reporterEmail,
        reported_by_name: data.reporterName,
        created_at: now.toISOString()
      })
      .select('id')
      .single();

    if (reportError) {
      console.error('fejlrapport insert error:', reportError);
    }

    // 2. Build image HTML for todo description
    const imageHtml = data.imageUrls.length > 0
      ? data.imageUrls.map(url =>
          `<img class="max-w-full h-auto rounded-lg border shadow-sm my-2" src="${url}" />`
        ).join('')
      : '';

    // 3. Create TODO assigned to Maria
    const { data: todo, error: todoError } = await supabase
      .from('todos')
      .insert({
        title: `⚠️ FEJLRAPPORT: ${data.activityName} — ${data.gear}`,
        description: `<p><strong>Aktivitet:</strong> ${data.activityName}</p><p><strong>Gear:</strong> ${data.gear}</p><p><strong>Dato:</strong> ${data.date}</p><p><strong>Rapporteret af:</strong> ${data.reporterName} (${data.reporterEmail})</p><p><strong>Tidspunkt:</strong> ${dateStr}</p><hr><p><strong>Beskrivelse:</strong></p><p>${data.description}</p>${imageHtml}`,
        assigned_to: MARIA_EMPLOYEE_ID,
        priority: data.haster ? 'HASTER' : 'Normal',
        category: 'FEJLRAPPORT',
        is_error: true,
        resolved: false,
      })
      .select('id')
      .single();

    if (todoError) {
      console.error('todo insert error:', todoError);
      return { success: false, error: todoError.message };
    }

    const todoId = todo?.id;

    // 4. Create notifications for admins
    const notifyRecipients = data.haster ? ADMIN_EMPLOYEE_IDS : [MARIA_EMPLOYEE_ID];
    const urgencyPrefix = data.haster ? '🚨 HASTER: ' : '';

    for (const recipientId of notifyRecipients) {
      await supabase.from('notifications').insert({
        recipient: recipientId,
        message: `${urgencyPrefix}Ny fejlrapport: ${data.activityName} — ${data.gear} |||todo_id:${todoId}`,
        type: data.haster ? 'urgent_issue' : 'todo',
        is_read: false,
        created_at: now.toISOString(),
      });
    }

    // 5. If HASTER — send email to maria@teambattle.dk via edge function
    if (data.haster) {
      try {
        const { error: emailError } = await supabase.functions.invoke('send-fejlrapport-email', {
          body: {
            activity: data.activity,
            activityName: data.activityName,
            gear: data.gear,
            date: data.date,
            description: data.description,
            imageUrls: data.imageUrls,
            reporterName: data.reporterName,
            reporterEmail: data.reporterEmail,
            haster: true,
          }
        });
        if (emailError) {
          console.warn('HASTER email failed (non-blocking):', emailError);
        }
      } catch (emailErr) {
        console.warn('HASTER email error (non-blocking):', emailErr);
      }
    }

    return { success: true, todoId };
  } catch (err) {
    console.error('submitFejlrapportAsTodo exception:', err);
    return { success: false, error: 'Uventet fejl ved indsendelse' };
  }
};

// ─── Landing sites (delt app-katalog) ────────────────────────────────────────
// Bruges af instruktør-forsiden til at vise app-ikoner (samme logoer som
// app.eventday.dk). Tabellen ejes af APP/Toolbox — vi LÆSER kun. Offentlig
// read via RLS (active=true).

export interface LandingSite {
  key: string;
  name: string;
  url: string;
  color: string | null;
  icon: string | null; // data-URL eller http-URL til logo-badge
}

// Hent app-katalog-rækker for et sæt keys, mappet som { key: LandingSite }
export const fetchLandingSites = async (
  keys: string[]
): Promise<Record<string, LandingSite>> => {
  try {
    const { data, error } = await supabase
      .from('landing_sites')
      .select('key, name, url, color, icon')
      .in('key', keys)
      .eq('active', true);

    if (error || !data) return {};

    const map: Record<string, LandingSite> = {};
    (data as LandingSite[]).forEach((s) => {
      map[s.key] = s;
    });
    return map;
  } catch (err) {
    console.error('Failed to fetch landing sites:', err);
    return {};
  }
};

// ── WELCOME-håndbog (delt) ──────────────────────────────────────────────
// CREW GUIDE viser de samme knapper som WELCOME's "Du er klar"-trin
// (welcome_step_buttons hvor step_id='klar'). Tabellen ejes af WELCOME — vi
// LÆSER kun, så admin redigerer håndbogen ét sted (i WELCOME's trin-editor).
export interface WelcomeGuideButton {
  position: number;
  title: string;
  body: string;
  image: string | null;
}

export const fetchWelcomeGuideButtons = async (): Promise<WelcomeGuideButton[]> => {
  try {
    const { data, error } = await supabase
      .from('welcome_step_buttons')
      .select('position, title, body, image')
      .eq('step_id', 'klar')
      .order('position');

    if (error || !data) return [];
    // Spring tomme pladser over (kun knapper med titel eller billede)
    return (data as WelcomeGuideButton[]).filter((b) => b.title || b.image);
  } catch (err) {
    console.error('Failed to fetch welcome guide buttons:', err);
    return [];
  }
};
