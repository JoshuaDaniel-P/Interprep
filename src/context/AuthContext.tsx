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
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { CandidateProfile } from "@/types/candidate";
import { candidateService } from "@/services/candidate.service";

export type UserRole = "ADMIN" | "CANDIDATE";

export interface AuthResult {
  role: UserRole;
  isNewUser: boolean;
}

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
  signInWithEmail: (email: string, pass: string) => Promise<AuthResult>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<CandidateProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = "preppilot_active_user";
const LOCAL_USERS_KEY = "preppilot_local_users";

// Helper to query server-side role verification
async function verifyRoleServerSide(email?: string | null, uid?: string | null): Promise<UserRole> {
  try {
    const res = await fetch("/api/auth/verify-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, uid }),
    });
    if (res.ok) {
      const data = await res.json();
      return (data.role as UserRole) || "CANDIDATE";
    }
  } catch (e) {
    console.warn("verifyRoleServerSide error:", e);
  }
  return "CANDIDATE";
}

function createMockUser(uid: string, email: string, displayName: string): AuthUser {
  return {
    uid,
    email,
    displayName,
  };
}

interface LocalAccount {
  name: string;
  email: string;
  passwords: string[];
  role: UserRole;
  profileId: string;
}

const SEED_ACCOUNTS: Record<string, LocalAccount> = {
  "admin@preppilot.com": {
    name: "Administrator",
    email: "admin@preppilot.com",
    passwords: ["admin123", "password123", "admin"],
    role: "ADMIN",
    profileId: "admin-system-id",
  },
  "candidate@preppilot.com": {
    name: "Alex",
    email: "candidate@preppilot.com",
    passwords: ["candidate123", "password123"],
    role: "CANDIDATE",
    profileId: "candidate-demo-123",
  },
  "alex@example.com": {
    name: "Alex",
    email: "alex@example.com",
    passwords: ["password123", "candidate123"],
    role: "CANDIDATE",
    profileId: "candidate-demo-123",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [role, setRole] = useState<UserRole>("CANDIDATE");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserProfile = async (uid: string): Promise<CandidateProfile | null> => {
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

    // Failsafe timer: Ensure isLoading can NEVER remain stuck indefinitely
    const failsafe = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 400);

    // 1. Check if an active session is persisted in localStorage
    if (typeof window !== "undefined") {
      try {
        const isExplicitlyLoggedOut = sessionStorage.getItem("preppilot_logged_out") === "true";
        const cached = localStorage.getItem(LOCAL_SESSION_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (data?.uid && data?.email) {
            const mock = createMockUser(data.uid, data.email, data.displayName || "User");
            if (isMounted) {
              setUser(mock);
              setRole(data.role || "CANDIDATE");
              setIsLoading(false); // Unblock immediately! Active session is restored.
            }
            fetchUserProfile(data.uid)
              .then((p) => {
                if (isMounted && p) {
                  setProfile(p);
                }
              })
              .catch(() => {});

            if (!isFirebaseConfigured) {
              clearTimeout(failsafe);
              return;
            }
          }
        } else if (!isFirebaseConfigured && !isExplicitlyLoggedOut) {
          // Zero-config offline / demo mode: Auto-initialize demo candidate for frictionless experience
          const demo = SEED_ACCOUNTS["candidate@preppilot.com"];
          const mockUser = createMockUser(demo.profileId, demo.email, demo.name);
          if (isMounted) {
            setUser(mockUser);
            setRole("CANDIDATE");
            setIsLoading(false);
          }
          localStorage.setItem(
            LOCAL_SESSION_KEY,
            JSON.stringify({
              uid: demo.profileId,
              email: demo.email,
              displayName: demo.name,
              role: "CANDIDATE",
            })
          );
          fetchUserProfile(demo.profileId)
            .then((p) => {
              if (isMounted && p) {
                setProfile(p);
              }
            })
            .catch(() => {});
          clearTimeout(failsafe);
          return;
        }
      } catch (e) {
        console.warn("Session restore error:", e);
      }
    }

    if (!isFirebaseConfigured) {
      setIsLoading(false);
      clearTimeout(failsafe);
      return;
    }

    // 2. Real Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        setUser(firebaseUser);
        const verifiedRole = await verifyRoleServerSide(firebaseUser.email, firebaseUser.uid);
        if (isMounted) {
          setRole(verifiedRole);
        }
        await fetchUserProfile(firebaseUser.uid);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            LOCAL_SESSION_KEY,
            JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: verifiedRole,
            })
          );
        }
      } else {
        // Only clear if no local session was restored
        const cached = typeof window !== "undefined" ? localStorage.getItem(LOCAL_SESSION_KEY) : null;
        if (!cached) {
          setUser(null);
          setProfile(null);
          setRole("CANDIDATE");
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
      clearTimeout(failsafe);
    });

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
      unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<AuthResult> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Try Live Firebase Auth if configured
      if (isFirebaseConfigured) {
        try {
          const res = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
          const firebaseUser = res.user;

          const verifiedRole = await verifyRoleServerSide(firebaseUser.email, firebaseUser.uid);
          setRole(verifiedRole);

          const userProfile = await fetchUserProfile(firebaseUser.uid);
          const isNewUser = !userProfile || !userProfile.isOnboarded;

          if (typeof window !== "undefined") {
            sessionStorage.removeItem("preppilot_logged_out");
            localStorage.setItem(
              LOCAL_SESSION_KEY,
              JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: verifiedRole,
              })
            );
          }

          return { role: verifiedRole, isNewUser };
        } catch (err: any) {
          const code = err?.code;

          if (code === "auth/user-not-found" || code === "auth/invalid-email") {
            throw new Error("User not found. Enter a valid ID and password.");
          } else if (code === "auth/wrong-password") {
            throw new Error("Incorrect password.");
          } else if (code === "auth/invalid-credential") {
            try {
              const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
              if (methods && methods.length > 0) {
                throw new Error("Incorrect password.");
              } else {
                throw new Error("User not found. Enter a valid ID and password.");
              }
            } catch (mErr: any) {
              if (
                mErr.message === "User not found. Enter a valid ID and password." ||
                mErr.message === "Incorrect password."
              ) {
                throw mErr;
              }
            }
          }
          // If not a credential error (e.g. invalid API key), fall through to local demo accounts
        }
      }

      // 2. Demo / Offline Account Fallback
      const seed = SEED_ACCOUNTS[normalizedEmail];
      let localUsers: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
        } catch {
          localUsers = {};
        }
      }
      const localAcc = localUsers[normalizedEmail];

      if (seed) {
        if (!seed.passwords.includes(pass)) {
          throw new Error("Incorrect password.");
        }
        const mockUser = createMockUser(seed.profileId, seed.email, seed.name);
        setUser(mockUser);
        setRole(seed.role);
        const p = await fetchUserProfile(seed.profileId);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("preppilot_logged_out");
          localStorage.setItem(
            LOCAL_SESSION_KEY,
            JSON.stringify({
              uid: seed.profileId,
              email: seed.email,
              displayName: seed.name,
              role: seed.role,
            })
          );
        }
        return { role: seed.role, isNewUser: !p || !p.isOnboarded };
      } else if (localAcc) {
        if (localAcc.pass !== pass) {
          throw new Error("Incorrect password.");
        }
        const mockUser = createMockUser(localAcc.uid, localAcc.email, localAcc.name);
        setUser(mockUser);
        setRole(localAcc.role || "CANDIDATE");
        const p = await fetchUserProfile(localAcc.uid);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("preppilot_logged_out");
          localStorage.setItem(
            LOCAL_SESSION_KEY,
            JSON.stringify({
              uid: localAcc.uid,
              email: localAcc.email,
              displayName: localAcc.name,
              role: localAcc.role || "CANDIDATE",
            })
          );
        }
        return { role: localAcc.role || "CANDIDATE", isNewUser: !p || !p.isOnboarded };
      }

      throw new Error("User not found. Enter a valid ID and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string): Promise<AuthResult> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      let uid = `cand-${Date.now()}`;

      if (isFirebaseConfigured) {
        try {
          const res = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
          const firebaseUser = res.user;
          uid = firebaseUser.uid;

          try {
            await updateProfile(firebaseUser, { displayName: cleanName });
          } catch (profileErr) {
            console.warn("Could not set displayName on Firebase Auth:", profileErr);
          }
        } catch (err: any) {
          if (err.code === "auth/email-already-in-use") {
            throw new Error("An account with this email already exists. Please log in.");
          } else if (err.code === "auth/weak-password") {
            throw new Error("Password should be at least 6 characters long.");
          } else if (err.code === "auth/invalid-email") {
            throw new Error("Please enter a valid email address.");
          }
          console.warn("Firebase Auth registration fallback:", err?.message);
        }
      }

      // Initialize candidate profile (strictly CANDIDATE role)
      const newProfile: CandidateProfile = {
        uid,
        email: normalizedEmail,
        fullName: cleanName,
        status: "Student",
        isOnboarded: false,
        readinessPercentage: 20,
        skills: [],
        projects: [],
        experience: [],
        achievements: [],
        education: {
          highestQualification: "Bachelor's Degree",
          degree: "Computer Science",
          branch: "Engineering",
          institution: "",
          graduationYear: new Date().getFullYear(),
          cgpaOrPercentage: "",
          strongSubjects: [],
          weakSubjects: [],
        },
        targetGoal: {
          targetRole: "Software Developer",
          targetCompanyType: "Product Company",
          targetIndustry: "Technology",
          interviewType: "Mixed",
          difficulty: "Realistic",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await candidateService.saveProfile(newProfile);
      } catch (saveErr) {
        console.warn("Profile save notice:", saveErr);
      }

      // Save to local users store for offline login
      if (typeof window !== "undefined") {
        try {
          const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "{}");
          localUsers[normalizedEmail] = {
            uid,
            email: normalizedEmail,
            pass,
            name: cleanName,
            role: "CANDIDATE",
          };
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        } catch {
          // ignore
        }
      }

      const mockUser = createMockUser(uid, normalizedEmail, cleanName);
      setUser(mockUser);
      setProfile(newProfile);
      setRole("CANDIDATE");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("preppilot_logged_out");
        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({
            uid,
            email: normalizedEmail,
            displayName: cleanName,
            role: "CANDIDATE",
          })
        );
      }

      return { role: "CANDIDATE", isNewUser: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured) {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          const res = await signInWithPopup(auth, provider);
          const firebaseUser = res.user;

          const verifiedRole = await verifyRoleServerSide(firebaseUser.email, firebaseUser.uid);
          setRole(verifiedRole);

          let existingProfile = await candidateService.getProfile(firebaseUser.uid);
          const isNew = !existingProfile.fullName && !existingProfile.isOnboarded;

          if (isNew) {
            const initialProfile: CandidateProfile = {
              ...existingProfile,
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Candidate",
              isOnboarded: false,
              readinessPercentage: 20,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await candidateService.saveProfile(initialProfile);
            setProfile(initialProfile);
          } else {
            setProfile(existingProfile);
          }

          if (typeof window !== "undefined") {
            sessionStorage.removeItem("preppilot_logged_out");
            localStorage.setItem(
              LOCAL_SESSION_KEY,
              JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: verifiedRole,
              })
            );
          }

          return { role: verifiedRole, isNewUser: isNew };
        } catch (e: any) {
          console.warn("Google Auth notice, using demo candidate session:", e?.message);
        }
      }

      // Fallback to demo candidate for frictionless access
      const demoCandidate = SEED_ACCOUNTS["candidate@preppilot.com"];
      const mockUser = createMockUser(demoCandidate.profileId, demoCandidate.email, demoCandidate.name);
      setUser(mockUser);
      setRole("CANDIDATE");
      const p = await fetchUserProfile(demoCandidate.profileId);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("preppilot_logged_out");
        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({
            uid: demoCandidate.profileId,
            email: demoCandidate.email,
            displayName: demoCandidate.name,
            role: "CANDIDATE",
          })
        );
      }
      return { role: "CANDIDATE", isNewUser: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setUser(null);
    setProfile(null);
    setRole("CANDIDATE");
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      sessionStorage.clear();
      sessionStorage.setItem("preppilot_logged_out", "true");
    }
    setIsLoading(false);
  };

  const refreshProfile = async (): Promise<CandidateProfile | null> => {
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
