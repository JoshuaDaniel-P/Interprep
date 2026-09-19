"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CandidateProfile } from "@/types/candidate";
import { candidateService } from "@/services/candidate.service";

export type UserRole = "ADMIN" | "CANDIDATE";

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  role: UserRole;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoCandidate: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    } catch {
      setProfile(candidateService.getProfile("candidate-demo-123") as any);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        // Fallback to default demo profile for frictionless demo access
        const p = await candidateService.getProfile("candidate-demo-123");
        setProfile(p);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await fetchUserProfile(res.user.uid);
      }
    } catch (e) {
      console.warn("Google Sign In error, falling back to demo session:", e);
      await loginAsDemoCandidate();
    }
  };

  const loginAsDemoCandidate = async () => {
    setRole("CANDIDATE");
    const p = await candidateService.getProfile("candidate-demo-123");
    setProfile(p);
  };

  const loginAsAdmin = async () => {
    setRole("ADMIN");
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    if (profile?.uid) {
      const updated = await candidateService.getProfile(profile.uid);
      setProfile(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
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
