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
import { auth } from "@/lib/firebase";
import { CandidateProfile } from "@/types/candidate";
import { candidateService } from "@/services/candidate.service";

export type UserRole = "ADMIN" | "CANDIDATE";

interface AuthContextType {
  user: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await fetchUserProfile(res.user.uid);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        setProfile(null); // Onboarding required
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await fetchUserProfile(res.user.uid);
      }
    } catch (e) {
      console.warn("Google Auth error, falling back to demo candidate session:", e);
      await loginAsDemoCandidate();
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoCandidate = async () => {
    setRole("CANDIDATE");
    const p = await candidateService.getProfile("candidate-user-active");
    setProfile(p);
  };

  const loginAsAdmin = async () => {
    setRole("ADMIN");
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("preppilot_profile_candidate-user-active");
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
