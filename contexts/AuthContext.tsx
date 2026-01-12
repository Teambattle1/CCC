import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, OCCUser, UserRole, getUserProfile, updateLastLogin, logActivity } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: OCCUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logPageVisit: (page: string) => void;
  logAction: (action: string, details?: string) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy: ADMIN > GAMEMASTER > INSTRUCTOR
const roleHierarchy: Record<UserRole, number> = {
  'INSTRUCTOR': 1,
  'GAMEMASTER': 2,
  'ADMIN': 3
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OCCUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Set fallback profile immediately
          setProfile({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
            role: 'ADMIN' as UserRole,
            created_at: new Date().toISOString()
          });

          // Try to fetch real profile in background
          getUserProfile(initialSession.user.id).then(userProfile => {
            if (userProfile) {
              setProfile(userProfile);
            }
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Set fallback profile immediately
          setProfile({
            id: newSession.user.id,
            email: newSession.user.email || '',
            role: 'ADMIN' as UserRole,
            created_at: new Date().toISOString()
          });

          // Non-blocking background tasks
          getUserProfile(newSession.user.id).then(userProfile => {
            if (userProfile) setProfile(userProfile);
          }).catch(console.error);

          if (event === 'SIGNED_IN') {
            updateLastLogin(newSession.user.id).catch(console.error);
            logActivity(
              newSession.user.id,
              newSession.user.email || '',
              'LOGIN',
              undefined,
              'User logged in'
            ).catch(console.error);
          }
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create immediate fallback profile - don't wait for DB
        const fallbackProfile: OCCUser = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'ADMIN' as UserRole, // Default to ADMIN for now
          created_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        setIsLoading(false);

        // Try to get real profile in background (non-blocking)
        getUserProfile(data.user.id).then(dbProfile => {
          if (dbProfile) {
            setProfile(dbProfile);
          }
        }).catch(console.error);
      } else {
        setIsLoading(false);
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const signOut = async () => {
    if (user && profile) {
      await logActivity(
        user.id,
        profile.email,
        'LOGOUT',
        undefined,
        'User logged out'
      );
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const logPageVisit = (page: string) => {
    if (user && profile) {
      logActivity(user.id, profile.email, 'PAGE_VISIT', page);
    }
  };

  const logAction = (action: string, details?: string) => {
    if (user && profile) {
      logActivity(user.id, profile.email, action, undefined, details);
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!profile) return false;

    const userRoleLevel = roleHierarchy[profile.role];

    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => userRoleLevel >= roleHierarchy[role]);
    }

    return userRoleLevel >= roleHierarchy[requiredRole];
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user && !!profile,
    userRole: profile?.role ?? null,
    signIn,
    signOut,
    logPageVisit,
    logAction,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
