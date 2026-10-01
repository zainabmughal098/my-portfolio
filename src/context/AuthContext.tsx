import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase.ts';
import { PortfolioData } from '../types/portfolio.ts';

export interface ResumeListItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface StoredResumeItem {
  id: number;
  title: string;
  data: PortfolioData;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_RESUMES_KEY = 'foliocraft_multi_resumes_v2';
const GUEST_SESSION_KEY = 'foliocraft_guest_session_v2';

function getLocalStoredResumes(userId?: string): StoredResumeItem[] {
  try {
    const key = userId ? `foliocraft_multi_resumes_${userId}` : LOCAL_RESUMES_KEY;
    const raw = localStorage.getItem(key);
    if (!raw && userId) {
      const legacy = localStorage.getItem(LOCAL_RESUMES_KEY);
      if (legacy) return JSON.parse(legacy);
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredResumes(items: StoredResumeItem[], userId?: string) {
  try {
    const key = userId ? `foliocraft_multi_resumes_${userId}` : LOCAL_RESUMES_KEY;
    localStorage.setItem(key, JSON.stringify(items));
    localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage unavailable', e);
  }
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordResetWithCode: (codeOrUrl: string, newPassword: string) => Promise<void>;
  requestPasswordResetCode: (email: string) => Promise<{ expiresAt: number }>;
  verifyPasswordResetCode: (email: string, code: string, newPassword: string) => Promise<boolean>;
  continueAsGuest: () => void;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  cloudSyncState: 'idle' | 'syncing' | 'saved' | 'error';
  lastSavedAt: Date | null;
  resumesList: ResumeListItem[];
  activeResumeId: number | null;
  activeResumeTitle: string;
  setActiveResumeId: (id: number | null) => void;
  setActiveResumeTitle: (title: string) => void;
  fetchResumesList: () => Promise<ResumeListItem[]>;
  loadResumeById: (id: number) => Promise<{ id: number; title: string; data: PortfolioData } | null>;
  createResumeInCloud: (title: string, data: PortfolioData) => Promise<{ id: number; title: string } | null>;
  renameResumeInCloud: (id: number, newTitle: string) => Promise<boolean>;
  deleteResumeFromCloud: (id: number) => Promise<boolean>;
  saveResumeToCloud: (data: PortfolioData, title?: string, resumeId?: number | null) => Promise<boolean>;
  loadResumeFromCloud: () => Promise<PortfolioData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    try {
      return (
        window.location.hash.includes('type=recovery') ||
        window.location.href.includes('type=recovery') ||
        window.location.search.includes('type=recovery')
      );
    } catch {
      return false;
    }
  });
  const [cloudSyncState, setCloudSyncState] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [resumesList, setResumesList] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [activeResumeTitle, setActiveResumeTitle] = useState<string>('My Portfolio Resume');

  const userRef = useRef<AppUser | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    } catch {
      return null;
    }
  }, []);

  const fetchResumesList = useCallback(
    async (_retries = 1, overrideUser?: AppUser | null): Promise<ResumeListItem[]> => {
      const activeUser = overrideUser !== undefined ? overrideUser : userRef.current;
      if (!activeUser) {
        setResumesList([]);
        return [];
      }

      // If guest user
      if (activeUser.isAnonymous) {
        const local = getLocalStoredResumes(activeUser.uid);
        const list = local.map((r) => ({
          id: r.id,
          title: r.title,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
        setResumesList(list);
        return list;
      }

      try {
        // Query Supabase table
        const { data: dbResumes, error } = await supabase
          .from('resumes')
          .select('id, title, created_at, updated_at')
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(dbResumes) && dbResumes.length > 0) {
          const list: ResumeListItem[] = dbResumes.map((r: any) => ({
            id: Number(r.id),
            title: r.title || 'Untitled Resume',
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || new Date().toISOString(),
          }));
          setResumesList(list);
          return list;
        }
      } catch (e) {
        console.warn('Supabase fetch resumes notice, using local cache:', e);
      }

      // Fallback to local storage
      const local = getLocalStoredResumes(activeUser.uid);
      const list = local.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      setResumesList(list);
      return list;
    },
    []
  );

  // Initialize Auth & listen to Supabase Auth State
  useEffect(() => {
    // Check if URL hash or search contains recovery tokens
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setIsPasswordRecovery(true);
      }
    } catch {
      // Ignore
    }

    // 1. Initial check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const suUser = session.user;
        const appUser: AppUser = {
          uid: suUser.id,
          email: suUser.email || null,
          displayName: suUser.user_metadata?.full_name || suUser.email?.split('@')[0] || 'User',
          photoURL: suUser.user_metadata?.avatar_url || null,
          isAnonymous: false,
        };
        setUser(appUser);
        userRef.current = appUser;
        fetchResumesList(1, appUser);
      } else {
        // Check for guest session in localStorage
        try {
          const savedGuest = localStorage.getItem(GUEST_SESSION_KEY);
          if (savedGuest) {
            const parsedGuest = JSON.parse(savedGuest);
            setUser(parsedGuest);
            userRef.current = parsedGuest;
            fetchResumesList(1, parsedGuest);
          }
        } catch {
          // Ignore
        }
      }
      setLoading(false);
    });

    // 2. Listen to state changes (Sign in, Sign out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (session?.user) {
        try {
          localStorage.removeItem(GUEST_SESSION_KEY);
        } catch {
          // Ignore
        }
        const suUser = session.user;
        const appUser: AppUser = {
          uid: suUser.id,
          email: suUser.email || null,
          displayName: suUser.user_metadata?.full_name || suUser.email?.split('@')[0] || 'User',
          photoURL: suUser.user_metadata?.avatar_url || null,
          isAnonymous: false,
        };
        setUser(appUser);
        userRef.current = appUser;
        setLoading(false);
        fetchResumesList(1, appUser);
      } else {
        // If guest session active, maintain it; otherwise null
        try {
          const savedGuest = localStorage.getItem(GUEST_SESSION_KEY);
          if (savedGuest) {
            const parsedGuest = JSON.parse(savedGuest);
            setUser(parsedGuest);
            userRef.current = parsedGuest;
          } else {
            setUser(null);
            userRef.current = null;
            setResumesList([]);
            setActiveResumeId(null);
          }
        } catch {
          setUser(null);
          userRef.current = null;
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchResumesList]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });

    if (error) {
      // If user doesn't exist yet, offer helpful message or auto sign-up
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid login credentials. Did you forget your password? Click "Forgot Password" below.');
      }
      throw new Error(error.message);
    }

    if (data.user) {
      const appUser: AppUser = {
        uid: data.user.id,
        email: data.user.email || cleanEmail,
        displayName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        photoURL: data.user.user_metadata?.avatar_url || null,
        isAnonymous: false,
      };
      setUser(appUser);
      userRef.current = appUser;
      await fetchResumesList(1, appUser);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: {
          full_name: cleanEmail.split('@')[0],
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      const appUser: AppUser = {
        uid: data.user.id,
        email: data.user.email || cleanEmail,
        displayName: cleanEmail.split('@')[0],
        photoURL: null,
        isAnonymous: false,
      };
      setUser(appUser);
      userRef.current = appUser;
      await fetchResumesList(1, appUser);
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(error.message);
  };

  // Triggers Supabase to send the password reset email to the user's inbox
  const requestPasswordResetCode = async (
    email: string
  ): Promise<{ expiresAt: number }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter a valid email address.');

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      throw new Error(error.message || 'Could not send reset email.');
    }

    return { expiresAt: Date.now() + 15 * 60 * 1000 };
  };

  // Verifies the code or token from email and updates the password
  const verifyPasswordResetCode = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    let cleanCode = code.trim();
    const isFullUrl = cleanCode.startsWith('http://') || cleanCode.startsWith('https://');
    let fullUrl = isFullUrl ? cleanCode : '';

    if (!cleanCode && !isFullUrl) throw new Error('Please enter the verification code or email link.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Extract token if user pasted full email link
    if (cleanCode.includes('token=') || cleanCode.includes('token_hash=')) {
      try {
        const url = new URL(cleanCode);
        const extracted = url.searchParams.get('token_hash') || url.searchParams.get('token');
        if (extracted) cleanCode = extracted;
      } catch {
        const match = cleanCode.match(/(?:token_hash|token)=([^&#]+)/);
        if (match && match[1]) cleanCode = match[1];
      }
    }

    let verifiedUser: any = null;

    // 1. Try token_hash verification with Supabase (used when link token or pkce_ is pasted)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: cleanCode,
        type: 'recovery',
      } as any);
      if (!error && data?.user) {
        verifiedUser = data.user;
      }
    } catch (e) {
      console.warn('token_hash recovery attempt:', e);
    }

    // 2. Try email + token (used when 6-digit numeric OTP is entered)
    if (!verifiedUser && cleanEmail) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: 'recovery',
        });
        if (!error && data?.user) {
          verifiedUser = data.user;
        }
      } catch (e) {
        console.warn('email token verify attempt:', e);
      }
    }

    // 3. Try token_hash with 'email' type
    if (!verifiedUser) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: cleanCode,
          type: 'email',
        } as any);
        if (!error && data?.user) {
          verifiedUser = data.user;
        }
      } catch (e) {
        // Ignore
      }
    }

    // 4. If full URL was pasted, try exchanging it
    if (!verifiedUser && isFullUrl && fullUrl) {
      try {
        await fetch(fullUrl, { method: 'GET', mode: 'no-cors' });
        const session = (await supabase.auth.getSession()).data.session;
        if (session?.user) {
          verifiedUser = session.user;
        }
      } catch (e) {
        // Ignore
      }
    }

    // 5. Check if current session is active from clicking the recovery link in email
    if (!verifiedUser) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user) {
        verifiedUser = session.user;
      }
    }

    // 6. If OTP token failed/expired, try signing in with the provided password or creating account
    if (!verifiedUser && cleanEmail && newPassword) {
      try {
        const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: newPassword,
        });
        if (!signErr && signData?.user) {
          verifiedUser = signData.user;
        }
      } catch (e) {
        // Try sign up if user did not exist
        try {
          const { data: regData, error: regErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: newPassword,
            options: {
              data: { full_name: cleanEmail.split('@')[0] },
            },
          });
          if (!regErr && regData?.user) {
            verifiedUser = regData.user;
          }
        } catch {
          // Ignore
        }
      }
    }

    if (!verifiedUser) {
      throw new Error('This reset link has expired. You can sign in directly or enter workspace below!');
    }

    // 7. Update user password in Supabase if session exists
    try {
      await supabase.auth.updateUser({
        password: newPassword,
      });
    } catch (e) {
      // User may already have updated password during sign in
    }

    setIsPasswordRecovery(false);

    // Automatically set user session
    const appUser: AppUser = {
      uid: verifiedUser.id,
      email: verifiedUser.email || cleanEmail,
      displayName: verifiedUser.user_metadata?.full_name || cleanEmail.split('@')[0],
      photoURL: verifiedUser.user_metadata?.avatar_url || null,
      isAnonymous: false,
    };
    setUser(appUser);
    userRef.current = appUser;
    await fetchResumesList(1, appUser);

    return true;
  };

  const confirmPasswordResetWithCode = async (
    codeOrUrl: string,
    newPassword: string
  ): Promise<void> => {
    const cleanCode = codeOrUrl.trim();
    if (!cleanCode) throw new Error('Please enter the reset code.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const continueAsGuest = () => {
    const guestUser: AppUser = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@foliocraft.local',
      displayName: 'Guest Designer',
      photoURL: null,
      isAnonymous: true,
    };
    try {
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestUser));
    } catch {
      // Ignore
    }
    setUser(guestUser);
    setLoading(false);
    fetchResumesList();
  };

  const signOutUser = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    try {
      localStorage.removeItem(GUEST_SESSION_KEY);
    } catch {
      // Ignore
    }
    setUser(null);
    setLastSavedAt(null);
    setCloudSyncState('idle');
    setResumesList([]);
    setActiveResumeId(null);
    setActiveResumeTitle('My Portfolio Resume');
  };

  const loadResumeById = async (
    id: number
  ): Promise<{ id: number; title: string; data: PortfolioData } | null> => {
    if (!user) return null;

    // Check local storage first
    if (user.isAnonymous) {
      const local = getLocalStoredResumes(user.uid);
      const match = local.find((r) => r.id === id);
      if (match) {
        setActiveResumeId(match.id);
        setActiveResumeTitle(match.title || 'Untitled Resume');
        setLastSavedAt(new Date(match.updatedAt));
        return { id: match.id, title: match.title, data: match.data };
      }
      return null;
    }

    try {
      const { data: dbResume, error } = await supabase
        .from('resumes')
        .select('id, title, data, updated_at')
        .eq('id', id)
        .single();

      if (!error && dbResume) {
        const parsed = typeof dbResume.data === 'string' ? JSON.parse(dbResume.data) : dbResume.data;
        setActiveResumeId(Number(dbResume.id));
        setActiveResumeTitle(dbResume.title || 'Untitled Resume');
        if (dbResume.updated_at) {
          setLastSavedAt(new Date(dbResume.updated_at));
        }
        return {
          id: Number(dbResume.id),
          title: dbResume.title,
          data: parsed,
        };
      }
    } catch (e) {
      console.warn('Supabase loadResumeById notice:', e);
    }

    // Local fallback
    const local = getLocalStoredResumes(user.uid);
    const match = local.find((r) => r.id === id);
    if (match) {
      setActiveResumeId(match.id);
      setActiveResumeTitle(match.title || 'Untitled Resume');
      setLastSavedAt(new Date(match.updatedAt));
      return { id: match.id, title: match.title, data: match.data };
    }
    return null;
  };

  const createResumeInCloud = async (
    title: string,
    data: PortfolioData
  ): Promise<{ id: number; title: string } | null> => {
    if (!user) return null;
    const trimmedTitle = title.trim() || 'New Resume';
    const nowIso = new Date().toISOString();

    // If guest, store locally
    if (user.isAnonymous) {
      const newId = Date.now();
      const newItem: StoredResumeItem = {
        id: newId,
        title: trimmedTitle,
        data,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const current = getLocalStoredResumes(user.uid);
      saveLocalStoredResumes([newItem, ...current], user.uid);
      setActiveResumeId(newId);
      setActiveResumeTitle(trimmedTitle);
      await fetchResumesList();
      return { id: newId, title: trimmedTitle };
    }

    try {
      const { data: inserted, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.uid,
          title: trimmedTitle,
          data: data,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select('id, title')
        .single();

      if (!error && inserted) {
        const newId = Number(inserted.id);
        setActiveResumeId(newId);
        setActiveResumeTitle(inserted.title || trimmedTitle);
        await fetchResumesList();
        return { id: newId, title: inserted.title || trimmedTitle };
      }
    } catch (e) {
      console.warn('Supabase createResume notice, using local backup:', e);
    }

    // Fallback to local
    const fallbackId = (Date.now() % 100000000) + 1;
    const newItem: StoredResumeItem = {
      id: fallbackId,
      title: trimmedTitle,
      data,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const current = getLocalStoredResumes(user.uid);
    saveLocalStoredResumes([newItem, ...current], user.uid);
    setActiveResumeId(fallbackId);
    setActiveResumeTitle(trimmedTitle);
    await fetchResumesList();
    return { id: fallbackId, title: trimmedTitle };
  };

  const renameResumeInCloud = async (id: number, newTitle: string): Promise<boolean> => {
    if (!user) return false;
    const cleanTitle = newTitle.trim();
    const nowIso = new Date().toISOString();

    // Local update
    const local = getLocalStoredResumes(user.uid);
    const updatedLocal = local.map((r) =>
      r.id === id ? { ...r, title: cleanTitle, updatedAt: nowIso } : r
    );
    saveLocalStoredResumes(updatedLocal, user.uid);

    if (activeResumeId === id) {
      setActiveResumeTitle(cleanTitle);
    }

    if (!user.isAnonymous) {
      try {
        await supabase
          .from('resumes')
          .update({ title: cleanTitle, updated_at: nowIso })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase rename notice:', e);
      }
    }

    await fetchResumesList();
    return true;
  };

  const deleteResumeFromCloud = async (id: number): Promise<boolean> => {
    if (!user) return false;

    // Optimistically remove from state & local storage
    setResumesList((prev) => prev.filter((r) => r.id !== id));
    const local = getLocalStoredResumes(user.uid).filter((r) => r.id !== id);
    saveLocalStoredResumes(local, user.uid);

    if (activeResumeId === id) {
      setActiveResumeId(null);
      setActiveResumeTitle('My Portfolio Resume');
    }

    if (!user.isAnonymous) {
      try {
        await supabase.from('resumes').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete notice:', e);
      }
    }

    await fetchResumesList();
    return true;
  };

  const saveResumeToCloud = async (
    data: PortfolioData,
    customTitle?: string,
    targetResumeId?: number | null
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      setCloudSyncState('syncing');

      const resumeIdToUse = targetResumeId !== undefined ? targetResumeId : activeResumeId;
      const titleToUse =
        customTitle ||
        activeResumeTitle ||
        (data.personal?.roleTitle
          ? `${data.personal.name || 'User'} - ${data.personal.roleTitle}`
          : data.personal?.name
          ? `${data.personal.name}'s Resume`
          : 'My Portfolio Resume');

      const nowIso = new Date().toISOString();

      // Backup to local storage immediately
      const local = getLocalStoredResumes(user.uid);
      if (resumeIdToUse && local.some((r) => r.id === resumeIdToUse)) {
        const updated = local.map((r) =>
          r.id === resumeIdToUse ? { ...r, title: titleToUse, data, updatedAt: nowIso } : r
        );
        saveLocalStoredResumes(updated, user.uid);
      } else {
        const safeResumeId =
          resumeIdToUse && resumeIdToUse > 0 ? resumeIdToUse : (Date.now() % 100000000) + 1;
        const itemToSave: StoredResumeItem = {
          id: safeResumeId,
          title: titleToUse,
          data,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        saveLocalStoredResumes([itemToSave, ...local.filter((r) => r.id !== itemToSave.id)], user.uid);
      }

      // If user is logged in, sync with Supabase
      if (!user.isAnonymous) {
        try {
          if (resumeIdToUse) {
            await supabase
              .from('resumes')
              .update({
                title: titleToUse,
                data: data,
                updated_at: nowIso,
              })
              .eq('id', resumeIdToUse);
          } else {
            const { data: inserted } = await supabase
              .from('resumes')
              .insert({
                user_id: user.uid,
                title: titleToUse,
                data: data,
                created_at: nowIso,
                updated_at: nowIso,
              })
              .select('id, title')
              .single();

            if (inserted?.id) {
              setActiveResumeId(Number(inserted.id));
              if (inserted.title) setActiveResumeTitle(inserted.title);
            }
          }
        } catch (e) {
          console.warn('Supabase cloud sync notice, local backup safe:', e);
        }
      }

      setLastSavedAt(new Date());
      setCloudSyncState('saved');
      return true;
    } catch {
      setLastSavedAt(new Date());
      setCloudSyncState('saved');
      return true;
    }
  };

  const loadResumeFromCloud = async (): Promise<PortfolioData | null> => {
    if (!user) return null;

    if (!user.isAnonymous) {
      try {
        const { data: dbResumes, error } = await supabase
          .from('resumes')
          .select('id, title, data, updated_at')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!error && dbResumes && dbResumes.length > 0) {
          const item = dbResumes[0];
          const parsed = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
          setActiveResumeId(Number(item.id));
          setActiveResumeTitle(item.title || 'My Portfolio Resume');
          if (item.updated_at) setLastSavedAt(new Date(item.updated_at));
          return parsed;
        }
      } catch (e) {
        console.warn('Supabase loadResumeFromCloud notice:', e);
      }
    }

    const local = getLocalStoredResumes(user.uid);
    if (local.length > 0) {
      setActiveResumeId(local[0].id);
      setActiveResumeTitle(local[0].title || 'My Portfolio Resume');
      if (local[0].updatedAt) setLastSavedAt(new Date(local[0].updatedAt));
      return local[0].data;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        confirmPasswordResetWithCode,
        requestPasswordResetCode,
        verifyPasswordResetCode,
        continueAsGuest,
        signOutUser,
        getIdToken,
        cloudSyncState,
        lastSavedAt,
        resumesList,
        activeResumeId,
        activeResumeTitle,
        setActiveResumeId,
        setActiveResumeTitle,
        fetchResumesList,
        loadResumeById,
        createResumeInCloud,
        renameResumeInCloud,
        deleteResumeFromCloud,
        saveResumeToCloud,
        loadResumeFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
