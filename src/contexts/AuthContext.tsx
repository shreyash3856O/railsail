"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import {
  getCurrentUser,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (username: string, email: string, password: string) => { success: boolean; error?: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  const signIn = (email: string, password: string) => {
    const result = authSignIn(email, password);
    if (result.success) setUser(getCurrentUser());
    return result;
  };

  const signUp = (username: string, email: string, password: string) => {
    const result = authSignUp(username, email, password);
    if (result.success) setUser(getCurrentUser());
    return result;
  };

  const signOut = () => {
    authSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
