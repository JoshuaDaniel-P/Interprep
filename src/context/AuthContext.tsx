"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { CandidateProfile } from "@/types/candidate";
import { candidateService, defaultMockCandidateProfile } from "@/services/candidate.service";

export type UserRole = "ADMIN" | "CANDIDATE";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export type AuthUser = User | AppUser;

interface AuthContextType {
  user: AuthUser | null;
  profile: CandidateProfile | null;
  role: UserRole;
  isLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoCandidate: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<CandidateProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = "preppilot_active_auth_user";

function hashEmailToUid(email: string): string {
  let hash = 0;
  const clean = email.toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return `user-${Math.abs(hash)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [role, setRole] = useState<UserRole>("CANDIDATE");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const p = await candidateService.getProfile(uid);
      setProfile(p);
      return p;
    } catch {
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. First check if a session exists in localStorage (handles offline / other computer)
    if (typeof window !== "undefined") {
      try {
        const cachedUserStr = localStorage.getItem(LOCAL_AUTH_KEY);
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr) as AppUser;
          if (isMounted) {
            setUser(cachedUser);
          }
          fetchUserProfile(cachedUser.uid).then((p) => {
            if (isMounted) {
              setProfile(p);
              setIsLoading(false);
            }
          });

          // If Firebase is not configured, we're fully authenticated locally
          if (!isFirebaseConfigured) {
            return;
          }
        }
      } catch (e) {
        console.warn("Error restoring cached user session:", e);
      }
    }

    // 2. If Firebase is not configured and no cached user, finish loading immediately
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 3. If Firebase is configured with real credentials, attach the listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        const authUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(authUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
        }
        await fetchUserProfile(firebaseUser.uid);
      } else {
        // Only clear if there is no offline demo session active
        const localActive = typeof window !== "undefined" ? localStorage.getItem(LOCAL_AUTH_KEY) : null;
        if (!localActive) {
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const res = await signInWithEmailAndPassword(auth, email, pass);
          if (res.user) {
            const authUser: AppUser = {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName,
              photoURL: res.user.photoURL,
            };
            setUser(authUser);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            }
            await fetchUserProfile(res.user.uid);
            return;
          }
        } catch (fbErr: any) {
          const isApiKeyIssue =
            fbErr?.code === "auth/invalid-api-key" ||
            fbErr?.code === "auth/api-key-not-valid" ||
            fbErr?.message?.includes("API_KEY_INVALID") ||
            fbErr?.message?.includes("invalid-api-key");
          if (!isApiKeyIssue) {
            throw fbErr;
          }
          console.warn("Firebase key invalid; falling back to offline local auth");
        }
      }

      // Offline / Local Authentication Fallback
      const uid = hashEmailToUid(email);
      const namePart = email.split("@")[0].replace(/[._]/g, " ");
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const localUser: AppUser = {
        uid,
        email,
        displayName: formattedName,
      };

      setUser(localUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
      }

      let p = await candidateService.getProfile(uid);
      if (!p || !p.fullName) {
        p = {
          ...defaultMockCandidateProfile,
          uid,
          email,
          fullName: formattedName,
          isOnboarded: true,
        };
        await candidateService.saveProfile(p);
      }
      setProfile(p);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          if (res.user) {
            const authUser: AppUser = {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName,
            };
            setUser(authUser);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            }
            setProfile(null); // Onboarding required
            return;
          }
        } catch (fbErr: any) {
          const isApiKeyIssue =
            fbErr?.code === "auth/invalid-api-key" ||
            fbErr?.code === "auth/api-key-not-valid" ||
            fbErr?.message?.includes("API_KEY_INVALID") ||
            fbErr?.message?.includes("invalid-api-key");
          if (!isApiKeyIssue) {
            throw fbErr;
          }
          console.warn("Firebase key invalid; falling back to offline local registration");
        }
      }

      // Offline / Local Registration Fallback
      const uid = hashEmailToUid(email);
      const namePart = email.split("@")[0].replace(/[._]/g, " ");
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const localUser: AppUser = {
        uid,
        email,
        displayName: formattedName,
      };

      setUser(localUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
      }

      const freshProfile: CandidateProfile = {
        uid,
        email,
        fullName: formattedName,
        status: "Student",
        isOnboarded: false,
        readinessPercentage: 0,
        skills: [],
        projects: [],
        experience: [],
        achievements: [],
        education: {
          highestQualification: "Bachelor's Degree",
          degree: "Computer Science",
          branch: "Engineering",
          institution: "",
          graduationYear: 2026,
          cgpaOrPercentage: "",
          strongSubjects: [],
          weakSubjects: [],
        },
        targetGoal: {
          targetRole: "Software Developer",
          targetCompanyType: "Product Company",
          targetIndustry: "Technology",
          interviewType: "Behavioral",
          difficulty: "Realistic",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await candidateService.saveProfile(freshProfile);
      setProfile(null); // Triggers profile setup wizard
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const provider = new GoogleAuthProvider();
          const res = await signInWithPopup(auth, provider);
          if (res.user) {
            const authUser: AppUser = {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName,
              photoURL: res.user.photoURL,
            };
            setUser(authUser);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            }
            await fetchUserProfile(res.user.uid);
            return;
          }
        } catch (e: any) {
          console.warn("Google Auth popup failed, engaging demo candidate session:", e);
        }
      }
      // Zero-config offline fallback
      await loginAsDemoCandidate();
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoCandidate = async () => {
    setIsLoading(true);
    try {
      setRole("CANDIDATE");
      const demoUser: AppUser = {
        uid: "candidate-demo-123",
        email: "alex@example.com",
        displayName: "Alex",
      };
      setUser(demoUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser));
      }
      const p = await candidateService.getProfile("candidate-demo-123");
      setProfile(p);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setRole("ADMIN");
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      sessionStorage.clear();
    }
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      return await fetchUserProfile(user.uid);
    } else if (profile?.uid) {
      return await fetchUserProfile(profile.uid);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemoCandidate,
        loginAsAdmin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

