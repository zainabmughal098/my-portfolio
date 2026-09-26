import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudSyncState, setCloudSyncState] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [resumesList, setResumesList] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [activeResumeTitle, setActiveResumeTitle] = useState<string>('My Portfolio Resume');

  // Synchronize user profile with Cloud SQL backend on login
  const syncUserToBackend = useCallback(async (currentUser: User) => {
    try {
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
    } catch (err) {
      console.error('Failed to sync user profile to backend:', err);
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }, []);

  const fetchResumesList = useCallback(async (): Promise<ResumeListItem[]> => {
    if (!auth.currentUser) return [];
    try {
      const token = await getIdToken();
      if (!token) return [];
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
      }
    } catch (err) {
      console.error('Failed to fetch resumes list:', err);
    }
    return [];
  }, [getIdToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await syncUserToBackend(currentUser);
        await fetchResumesList();
      } else {
        setResumesList([]);
        setActiveResumeId(null);
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

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setLastSavedAt(null);
      setCloudSyncState('idle');
      setActiveResumeId(null);
      setResumesList([]);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const loadResumeById = async (id: number): Promise<{ id: number; title: string; data: PortfolioData } | null> => {
    if (!user) return null;
    try {
      const token = await getIdToken();
      if (!token) return null;

      const res = await fetch(`/api/resumes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return null;

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
      return null;
    } catch (err) {
      console.error('Error fetching resume by id:', err);
      return null;
    }
  };

  const createResumeInCloud = async (
    title: string,
    data: PortfolioData
  ): Promise<{ id: number; title: string } | null> => {
    if (!user) return null;
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
          title: title.trim() || 'New Resume',
          data,
        }),
      });

      if (!res.ok) throw new Error('Failed to create resume');

      const json = await res.json();
      const newResume = json.resume;
      setActiveResumeId(newResume.id);
      setActiveResumeTitle(newResume.title);
      await fetchResumesList();
      return { id: newResume.id, title: newResume.title };
    } catch (err) {
      console.error('Create resume error:', err);
      return null;
    }
  };

  const renameResumeInCloud = async (id: number, newTitle: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const token = await getIdToken();
      if (!token) return false;

      const res = await fetch(`/api/resumes/${id}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        if (activeResumeId === id) {
          setActiveResumeTitle(newTitle);
        }
        await fetchResumesList();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Rename resume error:', err);
      return false;
    }
  };

  const deleteResumeFromCloud = async (id: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const token = await getIdToken();
      if (!token) return false;

      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (activeResumeId === id) {
          setActiveResumeId(null);
        }
        await fetchResumesList();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete resume error:', err);
      return false;
    }
  };

  const saveResumeToCloud = async (
    data: PortfolioData,
    customTitle?: string,
    targetResumeId?: number | null
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      setCloudSyncState('syncing');
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const resumeIdToUse = targetResumeId !== undefined ? targetResumeId : activeResumeId;
      const titleToUse =
        customTitle ||
        activeResumeTitle ||
        (data.personal?.roleTitle
          ? `${data.personal.name || 'User'} - ${data.personal.roleTitle}`
          : data.personal?.name
          ? `${data.personal.name}'s Resume`
          : 'My Portfolio Resume');

      // Resilient fetch with automatic retries for temporary network/server restarts
      const attemptFetch = async (retriesLeft = 2): Promise<Response> => {
        try {
          const res = resumeIdToUse
            ? await fetch(`/api/resumes/${resumeIdToUse}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: titleToUse,
                  data,
                }),
              })
            : await fetch('/api/resume', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: titleToUse,
                  data,
                }),
              });

          if (!res.ok && res.status >= 500 && retriesLeft > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return attemptFetch(retriesLeft - 1);
          }
          return res;
        } catch (fetchErr) {
          if (retriesLeft > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            return attemptFetch(retriesLeft - 1);
          }
          throw fetchErr;
        }
      };

      const res = await attemptFetch();

      if (!res.ok) {
        throw new Error(`Failed to save to cloud: status ${res.status}`);
      }

      const json = await res.json();
      if (json.resume) {
        setActiveResumeId(json.resume.id);
        if (json.resume.title) {
          setActiveResumeTitle(json.resume.title);
        }
      }

      setCloudSyncState('saved');
      setLastSavedAt(new Date());
      fetchResumesList().catch(() => {});
      return true;
    } catch (err) {
      console.warn('Cloud save will retry on next edit or reconnection:', err);
      setCloudSyncState('error');
      return false;
    }
  };

  const loadResumeFromCloud = async (): Promise<PortfolioData | null> => {
    if (!user) return null;
    try {
      const token = await getIdToken();
      if (!token) return null;

      const res = await fetch('/api/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch resume');
      }

      const payload = await res.json();
      if (payload && payload.data) {
        const parsed = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
        setActiveResumeId(payload.id);
        setActiveResumeTitle(payload.title || 'My Portfolio Resume');
        if (payload.updatedAt) {
          setLastSavedAt(new Date(payload.updatedAt));
        }
        return parsed;
      }
      return null;
    } catch (err) {
      console.error('Error fetching resume from cloud:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
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
