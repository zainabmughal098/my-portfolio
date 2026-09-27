import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
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

const LOCAL_RESUMES_KEY = 'foliocraft_multi_resumes_store_v1';
const GUEST_SESSION_KEY = 'foliocraft_guest_session_v1';

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
  user: User | AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudSyncState, setCloudSyncState] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [resumesList, setResumesList] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [activeResumeTitle, setActiveResumeTitle] = useState<string>('My Portfolio Resume');

  // Synchronize user profile with backend on login
  const syncUserToBackend = useCallback(async (currentUser: User | AppUser) => {
    if (currentUser.isAnonymous) return;
    try {
      if ('getIdToken' in currentUser && typeof currentUser.getIdToken === 'function') {
        const token = await currentUser.getIdToken();
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: currentUser.displayName,
            email: currentUser.email,
            picture: currentUser.photoURL,
          }),
        });
      }
    } catch {
      // Backend may be offline or static host (Vercel)
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const fetchResumesList = useCallback(async (retries = 1): Promise<ResumeListItem[]> => {
    // If running in guest mode or on static host without backend
    if (!user) {
      setResumesList([]);
      return [];
    }

    if (user.isAnonymous || !auth.currentUser) {
      const local = getLocalStoredResumes();
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
      const token = await getIdToken();
      if (!token) throw new Error('No token');
      const res = await fetch('/api/resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.resumes || [];
        setResumesList(list);
        return list;
      } else if (res.status === 404) {
        // Backend not mounted (e.g., Vercel static deployment)
        const local = getLocalStoredResumes();
        const list = local.map((r) => ({
          id: r.id,
          title: r.title,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
        setResumesList(list);
        return list;
      }
    } catch {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 800));
        return fetchResumesList(retries - 1);
      }
      // Fallback to local storage
      const local = getLocalStoredResumes();
      const list = local.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      setResumesList(list);
      return list;
    }
    return [];
  }, [user, getIdToken]);

  useEffect(() => {
    // Check if there was an active guest session
    try {
      const savedGuest = localStorage.getItem(GUEST_SESSION_KEY);
      if (savedGuest) {
        const parsedGuest = JSON.parse(savedGuest);
        setUser(parsedGuest);
        setLoading(false);
      }
    } catch {
      // Ignore
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Clear guest session if logged in with real account
        try {
          localStorage.removeItem(GUEST_SESSION_KEY);
        } catch {
          // Ignore
        }
        setUser(currentUser);
        setLoading(false);
        await syncUserToBackend(currentUser);
        await fetchResumesList();
      } else {
        // If no guest session either, set to null
        try {
          const savedGuest = localStorage.getItem(GUEST_SESSION_KEY);
          if (!savedGuest) {
            setUser(null);
            setResumesList([]);
            setActiveResumeId(null);
          }
        } catch {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncUserToBackend, fetchResumesList]);

  const signInWithGoogle = async () => {
    try {
      googleAuthProvider.setCustomParameters({
        prompt: 'select_account',
      });
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', error);
        throw error;
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
    } catch (error: any) {
      if (
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/network-request-failed' ||
        error?.code === 'auth/configuration-not-found'
      ) {
        const localUid = 'email-' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
        const storedPassKey = `foliocraft_pwd_${localUid}`;
        const storedHash = localStorage.getItem(storedPassKey);
        if (storedHash && storedHash !== pass) {
          throw { code: 'auth/wrong-password', message: 'Incorrect password for this email.' };
        }
        const appUser: AppUser = {
          uid: localUid,
          email: email.trim(),
          displayName: email.split('@')[0],
          photoURL: null,
          isAnonymous: false,
        };
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(appUser));
        setUser(appUser);
        fetchResumesList();
        return;
      }
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
    } catch (error: any) {
      if (
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/network-request-failed' ||
        error?.code === 'auth/configuration-not-found'
      ) {
        const localUid = 'email-' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
        const storedPassKey = `foliocraft_pwd_${localUid}`;
        localStorage.setItem(storedPassKey, pass);
        const appUser: AppUser = {
          uid: localUid,
          email: email.trim(),
          displayName: email.split('@')[0],
          photoURL: null,
          isAnonymous: false,
        };
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(appUser));
        setUser(appUser);
        fetchResumesList();
        return;
      }
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      if (
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/network-request-failed' ||
        error?.code === 'auth/configuration-not-found'
      ) {
        // Fallback for custom domains/offline
        return;
      }
      console.error('Password reset error:', error);
      throw error;
    }
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
      await signOut(auth);
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

    // Check local storage first if guest or static host
    if (user.isAnonymous || !auth.currentUser) {
      const local = getLocalStoredResumes();
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
      const token = await getIdToken();
      if (!token) throw new Error('No token');

      const res = await fetch(`/api/resumes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.data) {
          const parsed = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
          setActiveResumeId(payload.id);
          setActiveResumeTitle(payload.title || 'Untitled Resume');
          if (payload.updatedAt) {
            setLastSavedAt(new Date(payload.updatedAt));
          }
          return {
            id: payload.id,
            title: payload.title,
            data: parsed,
          };
        }
      }
    } catch {
      // Fallback to local
    }

    const local = getLocalStoredResumes();
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

    if (user.isAnonymous || !auth.currentUser) {
      const newId = Date.now();
      const newItem: StoredResumeItem = {
        id: newId,
        title: trimmedTitle,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const current = getLocalStoredResumes();
      saveLocalStoredResumes([newItem, ...current]);
      setActiveResumeId(newId);
      setActiveResumeTitle(trimmedTitle);
      await fetchResumesList();
      return { id: newId, title: trimmedTitle };
    }

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          data,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const newResume = json.resume;
        setActiveResumeId(newResume.id);
        setActiveResumeTitle(newResume.title);
        await fetchResumesList();
        return { id: newResume.id, title: newResume.title };
      }
    } catch {
      // Fallback to local
    }

    const newId = Date.now();
    const newItem: StoredResumeItem = {
      id: newId,
      title: trimmedTitle,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocalStoredResumes();
    saveLocalStoredResumes([newItem, ...current]);
    setActiveResumeId(newId);
    setActiveResumeTitle(trimmedTitle);
    await fetchResumesList();
    return { id: newId, title: trimmedTitle };
  };

  const renameResumeInCloud = async (id: number, newTitle: string): Promise<boolean> => {
    if (!user) return false;
    const cleanTitle = newTitle.trim();

    // Update in local store
    const local = getLocalStoredResumes();
    const updatedLocal = local.map((r) => (r.id === id ? { ...r, title: cleanTitle, updatedAt: new Date().toISOString() } : r));
    saveLocalStoredResumes(updatedLocal);

    if (activeResumeId === id) {
      setActiveResumeTitle(cleanTitle);
    }

    if (user.isAnonymous || !auth.currentUser) {
      await fetchResumesList();
      return true;
    }

    try {
      const token = await getIdToken();
      if (!token) return true;

      await fetch(`/api/resumes/${id}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: cleanTitle }),
      });
      await fetchResumesList();
      return true;
    } catch {
      await fetchResumesList();
      return true;
    }
  };

  const deleteResumeFromCloud = async (id: number): Promise<boolean> => {
    if (!user) return false;

    // Optimistically remove from state and local storage immediately
    setResumesList((prev) => prev.filter((r) => r.id !== id));
    const local = getLocalStoredResumes().filter((r) => r.id !== id);
    saveLocalStoredResumes(local);

    if (activeResumeId === id) {
      setActiveResumeId(null);
      setActiveResumeTitle('My Portfolio Resume');
    }

    if (user.isAnonymous || !auth.currentUser) {
      await fetchResumesList();
      return true;
    }

    try {
      const token = await getIdToken();
      if (token) {
        await fetch(`/api/resumes/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Local is already purged
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

      // Always backup to local storage first for instant safety
      const local = getLocalStoredResumes();
      const nowIso = new Date().toISOString();
      if (resumeIdToUse && local.some((r) => r.id === resumeIdToUse)) {
        const updated = local.map((r) =>
          r.id === resumeIdToUse ? { ...r, title: titleToUse, data, updatedAt: nowIso } : r
        );
        saveLocalStoredResumes(updated);
      } else {
        const itemToSave: StoredResumeItem = {
          id: resumeIdToUse || Date.now(),
          title: titleToUse,
          data,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        saveLocalStoredResumes([itemToSave, ...local.filter((r) => r.id !== itemToSave.id)]);
      }

      // If anonymous or no auth token, local save is sufficient
      if (user.isAnonymous || !auth.currentUser) {
        setLastSavedAt(new Date());
        setCloudSyncState('saved');
        return true;
      }

      const token = await getIdToken();
      if (!token) {
        setLastSavedAt(new Date());
        setCloudSyncState('saved');
        return true;
      }

      const endpoint = resumeIdToUse ? `/api/resumes/${resumeIdToUse}` : '/api/resume';
      const method = resumeIdToUse ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: titleToUse,
          data,
          resumeId: resumeIdToUse,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const savedResume = json.resume;
        if (savedResume) {
          if (!activeResumeId && savedResume.id) {
            setActiveResumeId(savedResume.id);
          }
          if (savedResume.title) {
            setActiveResumeTitle(savedResume.title);
          }
        }
        setLastSavedAt(new Date());
        setCloudSyncState('saved');
        return true;
      } else {
        // Fallback saved locally
        setLastSavedAt(new Date());
        setCloudSyncState('saved');
        return true;
      }
    } catch {
      setLastSavedAt(new Date());
      setCloudSyncState('saved');
      return true;
    }
  };

  const loadResumeFromCloud = async (): Promise<PortfolioData | null> => {
    if (!user) return null;

    if (user.isAnonymous || !auth.currentUser) {
      const local = getLocalStoredResumes();
      if (local.length > 0) {
        setActiveResumeId(local[0].id);
        setActiveResumeTitle(local[0].title || 'My Portfolio Resume');
        if (local[0].updatedAt) {
          setLastSavedAt(new Date(local[0].updatedAt));
        }
        return local[0].data;
      }
      return null;
    }

    try {
      const token = await getIdToken();
      if (!token) return null;

      const res = await fetch('/api/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.data) {
          const parsed = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
          if (payload.id) {
            setActiveResumeId(payload.id);
          }
          if (payload.title) {
            setActiveResumeTitle(payload.title);
          }
          if (payload.updatedAt) {
            setLastSavedAt(new Date(payload.updatedAt));
          }
          return parsed;
        }
      }
    } catch {
      // Local fallback
    }

    const local = getLocalStoredResumes();
    if (local.length > 0) {
      setActiveResumeId(local[0].id);
      setActiveResumeTitle(local[0].title || 'My Portfolio Resume');
      if (local[0].updatedAt) {
        setLastSavedAt(new Date(local[0].updatedAt));
      }
      return local[0].data;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
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
