"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { useSupabase } from "@/components/providers/supabase-provider";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // Re-reads the signed-in user's profile. Needed after creating the profile
  // row, since the auth-state listener loads it before the row exists.
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: Profile | null;
}) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialUser);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
    setProfile((data as Profile | null) ?? null);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(currentUser: User | null) {
      if (!currentUser) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        // Surface it instead of silently leaving the UI stuck on "Loading…" —
        // this is exactly how the RLS recursion bug hid itself before.
        console.error("Failed to load profile:", error.message);
      }

      if (isMounted) {
        setProfile((data as Profile | null) ?? null);
        setLoading(false);
      }
    }

    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user: fetchedUser } }) => {
        if (isMounted) setUser(fetchedUser);
        loadProfile(fetchedUser);
      });
    } else {
      loadProfile(initialUser);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      loadProfile(nextUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
