import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { UserProfile, ProfileRow } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileStats: (stats: { filesProcessed?: number; savedBytes?: number }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or initialize profile from Supabase profiles table
  const fetchProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data && !error) {
        const pRow = data as ProfileRow;
        setProfile({
          id: pRow.id,
          name: pRow.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: pRow.email || authUser.email || '',
          plan: (pRow.plan as 'free' | 'pro') || 'pro',
          monthlyUsage: pRow.monthly_usage || 0,
          filesProcessed: pRow.files_processed || 0,
          savedBytes: pRow.saved_bytes || 0,
          emailVerified: !!authUser.email_confirmed_at,
          avatarUrl: pRow.avatar_url || undefined,
        });
      } else {
        // Fallback to auth metadata & upsert default profile
        const defaultProfile: UserProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          plan: 'pro',
          monthlyUsage: 1,
          filesProcessed: 0,
          savedBytes: 0,
          emailVerified: !!authUser.email_confirmed_at,
        };
        setProfile(defaultProfile);

        // Best effort create profile row in Supabase
        try {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: defaultProfile.name,
            email: defaultProfile.email,
            plan: defaultProfile.plan,
            monthly_usage: defaultProfile.monthlyUsage,
            files_processed: defaultProfile.filesProcessed,
            saved_bytes: defaultProfile.savedBytes,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
      if (authUser) {
        setProfile({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          plan: 'pro',
          monthlyUsage: 0,
          filesProcessed: 0,
          savedBytes: 0,
          emailVerified: !!authUser.email_confirmed_at,
        });
      }
    }
  };

  useEffect(() => {
    // 1. Initial active session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // 2. Listen for Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            await fetchProfile(newSession.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (event === 'PASSWORD_RECOVERY') {
          window.location.hash = 'reset-password';
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign Up with Supabase Auth
  const signUp = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          return { 
            success: false, 
            error: 'Email rate limit exceeded. Supabase built-in mailer limits to 3-4 emails/hr. Please wait a few minutes or use custom SMTP.' 
          };
        }
        return { success: false, error: error.message };
      }

      // Check if email confirmation OTP is required
      const requiresVerification = !data.session && !!data.user;
      return { success: true, requiresVerification };
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit')) {
        return { 
          success: false, 
          error: 'Email rate limit exceeded. Please wait a few minutes before trying again.' 
        };
      }
      return { success: false, error: msg || 'Signup failed' };
    }
  };

  // Verify Email OTP using Supabase Auth
  const verifyEmailOtp = async (email: string, token: string) => {
    try {
      // 1. Attempt signup OTP verification
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'signup',
      });

      // 2. Fallback to 'email' type if needed
      if (error) {
        const fallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: 'email',
        });
        if (!fallback.error) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfile(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  };

  // Sign In with Email & Password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Detect unconfirmed email error
        if (
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('not verified')
        ) {
          // Auto trigger resend OTP so user can verify immediately
          await supabase.auth.resend({ type: 'signup', email: email.trim() }).catch(() => {});
          return {
            success: false,
            requiresVerification: true,
            error: 'Your email is not verified yet. We have sent a verification code to your Gmail/Email.',
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Signout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  // Password Reset Email
  const sendPasswordReset = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/#reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          return { 
            success: false, 
            error: 'Email rate limit reached (Supabase allows max 3-4 emails/hr on default mailer). Please wait a few minutes or configure custom SMTP in Supabase.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit')) {
        return { 
          success: false, 
          error: 'Email rate limit reached. Please wait a few minutes before requesting another email.' 
        };
      }
      return { success: false, error: msg || 'Password reset request failed' };
    }
  };

  // Reset Password using 6-Digit Email OTP + New Password
  const resetPasswordWithOtp = async (email: string, token: string, newPassword: string) => {
    try {
      // 1. Verify Recovery OTP with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // 2. Set new password for the authenticated user session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data.user) {
        await fetchProfile(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed' };
    }
  };

  // Update Password (after reset / when session exists)
  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        await fetchProfile(data.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed' };
    }
  };

  // Resend OTP
  const resendVerificationOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          return { 
            success: false, 
            error: 'Email rate limit reached. Please wait a few minutes before requesting another OTP.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit')) {
        return { 
          success: false, 
          error: 'Email rate limit reached. Please wait a few minutes.' 
        };
      }
      return { success: false, error: msg || 'Failed to resend OTP' };
    }
  };

  // Update profile usage statistics
  const updateProfileStats = async (stats: { filesProcessed?: number; savedBytes?: number }) => {
    if (!user || !profile) return;

    const newFilesProcessed = profile.filesProcessed + (stats.filesProcessed || 1);
    const newSavedBytes = profile.savedBytes + (stats.savedBytes || 0);
    const newMonthlyUsage = profile.monthlyUsage + 1;

    setProfile({
      ...profile,
      filesProcessed: newFilesProcessed,
      savedBytes: newSavedBytes,
      monthlyUsage: newMonthlyUsage,
    });

    try {
      await supabase.from('profiles').update({
        files_processed: newFilesProcessed,
        saved_bytes: newSavedBytes,
        monthly_usage: newMonthlyUsage,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
    } catch (err) {
      console.warn('Profile stats update note:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        verifyEmailOtp,
        signIn,
        signInWithGoogle,
        signOut,
        sendPasswordReset,
        resetPasswordWithOtp,
        updatePassword,
        resendVerificationOtp,
        updateProfileStats,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
