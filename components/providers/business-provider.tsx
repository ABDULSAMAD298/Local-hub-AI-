"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Business } from "@/lib/types";

interface BusinessContextValue {
  businesses: Business[];
  business: Business | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue>({
  businesses: [],
  business: null,
  loading: true,
  refetch: async () => {},
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setBusinesses((data as Business[]) ?? []);
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        business: businesses[0] ?? null,
        loading,
        refetch: fetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
