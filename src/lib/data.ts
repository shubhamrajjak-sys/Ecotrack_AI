import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { indexFactors, type EmissionFactor } from "@/lib/carbon";

export const factorsQuery = queryOptions({
  queryKey: ["emission_factors"],
  staleTime: 1000 * 60 * 30,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("emission_factors")
      .select("*")
      .order("category");
    if (error) throw error;
    const rows = (data ?? []) as EmissionFactor[];
    return { rows, index: indexFactors(rows) };
  },
});

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const calculationsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["calculations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carbon_calculations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

export const goalsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["goals", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const travelQuery = (userId: string) =>
  queryOptions({
    queryKey: ["travel", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

export const achievementsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });

export const leaderboardQuery = queryOptions({
  queryKey: ["leaderboard"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("leaderboard", { _limit: 25 });
    if (error) throw error;
    return data ?? [];
  },
});

export const campusQuery = queryOptions({
  queryKey: ["campus_analytics"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("campus_analytics");
    if (error) throw error;
    return data?.[0] ?? null;
  },
});

export async function awardBadge(userId: string, badgeCode: string) {
  await supabase.from("achievements").insert({ user_id: userId, badge_code: badgeCode });
}

export async function addEcoPoints(userId: string, current: number, points: number) {
  await supabase
    .from("profiles")
    .update({ eco_points: current + points })
    .eq("id", userId);
}
