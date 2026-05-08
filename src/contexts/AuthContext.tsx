import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  authResolved: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null; needsManualLogin?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { username: string; avatar_url?: string | null }) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const currentUserIdRef = useRef<string | null>(null);
  const profileCacheRef = useRef(new Map<string, Profile | null>());
  const inFlightProfileRef = useRef(new Map<string, Promise<Profile | null>>());

  const ensureProfileLoaded = useCallback(async (userId: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false;

    if (!force && profileCacheRef.current.has(userId)) {
      const cachedProfile = profileCacheRef.current.get(userId) ?? null;
      if (currentUserIdRef.current === userId) {
        setProfile(cachedProfile);
      }
      return cachedProfile;
    }

    if (!force) {
      const existingRequest = inFlightProfileRef.current.get(userId);
      if (existingRequest) {
        const sharedProfile = await existingRequest;
        if (currentUserIdRef.current === userId) {
          setProfile(sharedProfile);
        }
        return sharedProfile;
      }
    }

    const request = (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        profileCacheRef.current.set(userId, null);
        return null;
      }

      profileCacheRef.current.set(userId, data);
      return data;
    })();

    inFlightProfileRef.current.set(userId, request);

    try {
      const nextProfile = await request;
      if (currentUserIdRef.current === userId) {
        setProfile(nextProfile);
      }
      return nextProfile;
    } finally {
      inFlightProfileRef.current.delete(userId);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string, options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const hasCachedProfile = !force && profileCacheRef.current.has(userId);

    if (!hasCachedProfile) {
      setProfileLoading(true);
    }

    try {
      await ensureProfileLoaded(userId, { force });
    } finally {
      if (currentUserIdRef.current === userId) {
        setProfileLoading(false);
      }
    }
  }, [ensureProfileLoaded]);

  const applySession = useCallback((nextSession: Session | null, options?: { forceProfileRefresh?: boolean }) => {
    const nextUser = nextSession?.user ?? null;
    const previousUserId = currentUserIdRef.current;

    setSession(nextSession);
    setUser(nextUser);

    if (!nextUser) {
      currentUserIdRef.current = null;
      setProfile(null);
      setProfileLoading(false);
      setAuthResolved(true);
      return;
    }

    currentUserIdRef.current = nextUser.id;

    if (previousUserId && previousUserId !== nextUser.id) {
      setProfile(null);
    }

    setAuthResolved(true);
    void loadProfile(nextUser.id, {
      force: options?.forceProfileRefresh ?? false,
    });
  }, [loadProfile]);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!active) return;
      applySession(initialSession);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      applySession(nextSession, {
        forceProfileRefresh: event === 'USER_UPDATED',
      });
    });

    void initializeAuth();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signUp = async (email: string, password: string, username: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      return { error };
    }

    if (data.session) {
      return { error: null };
    }

    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: signInResult.error, needsManualLogin: !signInResult.error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password?type=recovery`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const updateProfile = async (updates: { username: string; avatar_url?: string | null }) => {
    if (!user) {
      return { error: '用户未登录' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: updates.username,
        avatar_url: updates.avatar_url ?? null,
      })
      .select('id, username, avatar_url, created_at')
      .single();

    if (error) {
      return { error: error.message };
    }

    profileCacheRef.current.set(user.id, data);
    setProfile(data);
    return { error: null };
  };

  const refreshProfile = useCallback(async () => {
    if (!currentUserIdRef.current) {
      return;
    }

    await loadProfile(currentUserIdRef.current, { force: true });
  }, [loadProfile]);

  const signOut = async () => {
    const currentUserId = currentUserIdRef.current;
    if (currentUserId) {
      profileCacheRef.current.delete(currentUserId);
      inFlightProfileRef.current.delete(currentUserId);
    }

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setAuthResolved(true);
    setProfileLoading(false);
    currentUserIdRef.current = null;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        authResolved,
        profileLoading,
        signUp,
        signIn,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
