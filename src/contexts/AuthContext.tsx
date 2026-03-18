import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'administrador' | 'executivo' | 'marketing' | 'comercial';
  created_at: string;
  updated_at: string;
}

type AppRole = 'super_admin' | 'user';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'executivo' | 'marketing' | 'comercial', receiveEmailUpdates?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: AppRole | null;
  refetchUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
        setIsSuperAdmin(false);
      } else if (data) {
        const role = data.role as AppRole;
        setUserRole(role);
        setIsSuperAdmin(role === 'super_admin');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
      setIsSuperAdmin(false);
    }
  }, []);

  const refetchUserRole = useCallback(async () => {
    if (user?.id) {
      await fetchUserRole(user.id);
    }
  }, [user?.id, fetchUserRole]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist, try to create one
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const fullName = userData.user.user_metadata?.full_name || 
                          userData.user.email?.split('@')[0] || 
                          'Usuário';
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: fullName,
              role: 'marketing' as const
            })
            .select()
            .single();
          
          if (!insertError && newProfile) {
            setProfile(newProfile);
          } else {
            console.error('Error creating profile:', insertError);
            setProfile(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // Defer profile and role fetching to avoid blocking
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setIsSuperAdmin(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'executivo' | 'marketing' | 'comercial', receiveEmailUpdates?: boolean) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data?.user) {
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update profile with role
          if (role !== 'marketing') {
            await supabase
              .from('profiles')
              .update({ role, full_name: fullName })
              .eq('user_id', user.id);
          }

          // If user opted in for email updates, create subscriber entry
          if (receiveEmailUpdates) {
            await supabase
              .from('profiles')
              .update({ receive_email_updates: true })
              .eq('user_id', user.id);

            // Also add to email_subscribers table
            await supabase.from('email_subscribers').insert({
              email: email,
              name: fullName,
              user_id: user.id,
              is_active: true,
              receive_instant_alerts: true,
              receive_weekly_digest: true,
              entities_filter: { competitors: true, prospects: true, clients: true },
            });
          }
        }
      }, 1000);
    }

    return { error };
  };

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local state
    setUser(null);
    setProfile(null);
    setUserRole(null);
    setIsSuperAdmin(false);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Função isAdmin removida - não existe mais role de administrador
  const isAdmin = false;

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isSuperAdmin,
    userRole,
    refetchUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
