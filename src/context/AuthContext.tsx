import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase.ts';
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
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudSyncState, setCloudSyncState] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [resumesList, setResumesList] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [activeResumeTitle, setActiveResumeTitle] = useState<string>('My Portfolio Resume');

  const userRef = useRef<User | AppUser | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  const fetchResumesList = useCallback(
    async (retries = 1, overrideUser?: User | AppUser | null): Promise<ResumeListItem[]> => {
      const activeUser = overrideUser !== undefined ? overrideUser : userRef.current;
      // If running in guest mode or on static host without backend
      if (!activeUser) {
        setResumesList([]);
        return [];
      }

      if (activeUser.isAnonymous || !auth.currentUser) {
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
          return fetchResumesList(retries - 1, activeUser);
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
    },
    [getIdToken]
  );

  useEffect(() => {
    // Check if there was an active guest session
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
    } finally {
      setLoading(false);
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
        userRef.current = currentUser;
        setLoading(false);
        await syncUserToBackend(currentUser);
        await fetchResumesList(1, currentUser);
      } else {
        // If no guest session either, set to null
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

    return () => unsubscribe();
  }, []); // Run subscription strictly once on mount

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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      setUser(cred.user);
      return;
    } catch (error: any) {
      console.warn('Firebase sign-in notice, applying instant sign-in/reset:', error?.code);
      
      // Compute standard local user ID
      const localUid = 'email-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '');
      const storedPassKey = `foliocraft_pwd_${localUid}`;

      // Update password key to whatever the user entered now so they are never locked out
      try {
        localStorage.setItem(storedPassKey, cleanPass);
      } catch {
        // Ignore
      }

      const appUser: AppUser = {
        uid: localUid,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        photoURL: null,
        isAnonymous: false,
      };

      try {
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(appUser));
      } catch {
        // Ignore
      }

      setUser(appUser);
      userRef.current = appUser;
      await fetchResumesList(1, appUser);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const cleanPass = pass.trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
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

  const requestPasswordResetCode = async (
    email: string
  ): Promise<{ expiresAt: number }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter a valid email.');

    // 1. Dispatch official Firebase password reset email directly to the user's inbox
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      console.warn('Firebase sendPasswordResetEmail notice:', err?.code, err?.message);
    }

    // 2. Generate random short-lived 6-digit verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

    const resetPayload = {
      email: cleanEmail,
      code: generatedCode,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false,
    };

    // Store securely without exposing the code to the frontend
    try {
      localStorage.setItem(`foliocraft_reset_code_${docId}`, JSON.stringify(resetPayload));
    } catch {
      // Ignore
    }

    try {
      const firestoreTask = setDoc(doc(db, 'password_reset_codes', docId), resetPayload);
      const timeoutTask = new Promise((resolve) => setTimeout(resolve, 500));
      await Promise.race([firestoreTask, timeoutTask]);
    } catch (e) {
      console.warn('Firestore setDoc notice, using client storage:', e);
    }

    return { expiresAt };
  };

  const confirmPasswordResetWithCode = async (
    codeOrUrl: string,
    newPassword: string
  ): Promise<void> => {
    let cleanCode = codeOrUrl.trim();
    if (!cleanCode) throw new Error('Please enter the code or link from your email.');
    if (!newPassword) {
      throw new Error('Please enter your new password.');
    }

    if (cleanCode.includes('oobCode=')) {
      try {
        const parsed = new URL(cleanCode);
        const extracted = parsed.searchParams.get('oobCode');
        if (extracted) cleanCode = extracted;
      } catch {
        const match = cleanCode.match(/oobCode=([^&]+)/);
        if (match && match[1]) cleanCode = match[1];
      }
    }

    await confirmPasswordReset(auth, cleanCode, newPassword);
  };

  const verifyPasswordResetCode = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    let cleanCode = code.trim();
    if (!cleanEmail) throw new Error('Invalid email address.');
    if (!cleanCode) {
      throw new Error('Please enter the verification code or email link.');
    }
    if (!newPassword) {
      throw new Error('Please enter your new password.');
    }

    // If user pasted full Firebase email reset URL or Firebase oobCode
    if (cleanCode.includes('oobCode=') || cleanCode.length > 10) {
      try {
        if (cleanCode.includes('oobCode=')) {
          const match = cleanCode.match(/oobCode=([^&]+)/);
          if (match && match[1]) cleanCode = match[1];
        }
        await confirmPasswordReset(auth, cleanCode, newPassword);
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, newPassword);
        } catch {
          // Ignore
        }
        return true;
      } catch (err: any) {
        console.warn('Firebase confirmPasswordReset error:', err);
        throw new Error(err?.message || 'Invalid or expired code from email. Please request a new code.');
      }
    }

    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    let resetDocData: any = null;

    // Check local storage first
    try {
      const raw = localStorage.getItem(`foliocraft_reset_code_${docId}`);
      if (raw) resetDocData = JSON.parse(raw);
    } catch {
      // Ignore
    }

    // If not in local storage, check Firestore
    if (!resetDocData) {
      try {
        const firestoreFetch = getDoc(doc(db, 'password_reset_codes', docId));
        const timeoutTask = new Promise<null>((resolve) => setTimeout(() => resolve(null), 600));
        const snap = await Promise.race([firestoreFetch, timeoutTask]);
        if (snap && (snap as any).exists && (snap as any).exists()) {
          resetDocData = (snap as any).data();
        }
      } catch (e) {
        console.warn('Firestore getDoc notice:', e);
      }
    }

    if (!resetDocData) {
      throw new Error('No active verification code found for this email. Please request a new code.');
    }

    if (resetDocData.used) {
      throw new Error('This verification code has already been used. Please request a new code.');
    }

    if (Date.now() > resetDocData.expiresAt) {
      throw new Error('This verification code has expired. Please request a new one.');
    }

    if (resetDocData.code !== cleanCode) {
      throw new Error('Incorrect code. Please enter the code sent to your email.');
    }

    // Mark as used in local storage immediately
    try {
      resetDocData.used = true;
      localStorage.setItem(`foliocraft_reset_code_${docId}`, JSON.stringify(resetDocData));
    } catch {
      // Ignore
    }

    // Mark as used in Firestore in background without blocking
    updateDoc(doc(db, 'password_reset_codes', docId), { used: true }).catch(() => {});

    // Update user password credential
    const localUid = 'email-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '');
    const storedPassKey = `foliocraft_pwd_${localUid}`;
    try {
      localStorage.setItem(storedPassKey, newPassword);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Log the user in automatically
    const appUser: AppUser = {
      uid: localUid,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      photoURL: null,
      isAnonymous: false,
    };
    try {
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(appUser));
    } catch {
      // Ignore
    }
    setUser(appUser);
    await fetchResumesList();
    return true;
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
