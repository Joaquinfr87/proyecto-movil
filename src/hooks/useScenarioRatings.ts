import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { ScenarioRating, ScenarioRatingStats } from '../types';
import type { ScenarioWithDetails } from './useScenarios';
import { resolveScenarioImages } from './useScenarios';
import { getCachedMyRatings, saveCachedMyRatings } from '../utils/ratingDraft';

export interface RatingWithProfile extends ScenarioRating {
  profiles: { id: string; full_name: string } | null;
}

export interface MyRatingWithScenario extends ScenarioRating {
  scenarios: ScenarioWithDetails;
}

export type RatingStatsMap = Record<string, ScenarioRatingStats>;

export interface UpsertRatingInput {
  scenario_id: string;
  user_id: string;
  rating: number;
  comment: string;
}

// ─── Funciones de API ────────────────────────────────────────────────────────

export async function fetchRatingStats(): Promise<RatingStatsMap> {
  const { data, error } = await supabase.rpc('scenario_rating_stats');

  if (error) {
    throw new Error(error.message);
  }

  const map: RatingStatsMap = {};
  for (const row of (data ?? []) as ScenarioRatingStats[]) {
    map[row.scenario_id] = {
      scenario_id: row.scenario_id,
      average: Number(row.average),
      count: Number(row.count),
    };
  }
  return map;
}

async function fetchScenarioRatings(scenarioId: string): Promise<RatingWithProfile[]> {
  const { data, error } = await supabase
    .from('scenario_ratings')
    .select(`*, profiles(id, full_name)`)
    .eq('scenario_id', scenarioId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RatingWithProfile[];
}

async function fetchMyRatings(userId: string): Promise<MyRatingWithScenario[]> {
  const { data, error } = await supabase
    .from('scenario_ratings')
    .select(
      `
      *,
      scenarios(
        *,
        scenario_images(url, is_primary, storage_path, display_order)
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((row) => row.scenarios && row.scenarios.estado === 'activo')
    .map((row) => ({
      ...row,
      scenarios: resolveScenarioImages(row.scenarios as ScenarioWithDetails),
    })) as MyRatingWithScenario[];
}

async function upsertRating(input: UpsertRatingInput): Promise<void> {
  const { error } = await supabase.from('scenario_ratings').upsert(
    {
      scenario_id: input.scenario_id,
      user_id: input.user_id,
      rating: input.rating,
      comment: input.comment,
    },
    { onConflict: 'user_id,scenario_id' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteRating(ratingId: string): Promise<void> {
  const { error } = await supabase.from('scenario_ratings').delete().eq('id', ratingId);

  if (error) {
    throw new Error(error.message);
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useRatingStats() {
  return useQuery({
    queryKey: ['rating-stats'],
    queryFn: fetchRatingStats,
    staleTime: 1000 * 60 * 5,
  });
}

export function useScenarioRatings(scenarioId: string) {
  return useQuery({
    queryKey: ['scenario-ratings', scenarioId],
    queryFn: () => fetchScenarioRatings(scenarioId),
    staleTime: 1000 * 60 * 2,
    enabled: !!scenarioId,
  });
}

export function useMyRatings(userId: string) {
  const queryClient = useQueryClient();

  // Semilla con caché offline (Parte 5: consulta de info local antes del servidor)
  useEffect(() => {
    if (!userId) return;
    getCachedMyRatings(userId).then((cached) => {
      if (cached.length > 0 && !queryClient.getQueryData(['my-ratings', userId])) {
        queryClient.setQueryData(['my-ratings', userId], cached);
      }
    });
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['my-ratings', userId],
    queryFn: async () => {
      const data = await fetchMyRatings(userId);
      await saveCachedMyRatings(userId, data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

function invalidateRatingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  input: UpsertRatingInput,
) {
  queryClient.invalidateQueries({ queryKey: ['scenario-ratings', input.scenario_id] });
  queryClient.invalidateQueries({ queryKey: ['my-ratings', input.user_id] });
  queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
}

export function useUpsertRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertRating,
    onSuccess: (_, variables) => invalidateRatingQueries(queryClient, variables),
  });
}

export function useDeleteRating(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings', userId] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}
