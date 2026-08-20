import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Favorite, Scenario } from '../types';
import type { ScenarioImage } from './useScenarios';

export interface FavoriteWithScenario extends Favorite {
  scenarios: Scenario & {
    scenario_images: ScenarioImage[];
  };
}

async function fetchFavorites(userId: string): Promise<FavoriteWithScenario[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      *,
      scenarios(
        *,
        scenario_images(url, is_primary, storage_path)
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as FavoriteWithScenario[];
}

async function checkIsFavorite(userId: string, scenarioId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('user_id, scenario_id')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

async function addFavorite(userId: string, scenarioId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, scenario_id: scenarioId });

  if (error) {
    throw new Error(error.message);
  }
}

async function removeFavorite(userId: string, scenarioId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId);

  if (error) {
    throw new Error(error.message);
  }
}

export function useFavorites(userId: string) {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => fetchFavorites(userId),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
}

export function useIsFavorite(userId: string, scenarioId: string) {
  return useQuery({
    queryKey: ['favorite', userId, scenarioId],
    queryFn: () => checkIsFavorite(userId, scenarioId),
    staleTime: 1000 * 60 * 2,
    enabled: !!userId && !!scenarioId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = async (userId: string, scenarioId: string) => {
    setIsToggling(true);
    try {
      const isFav = await checkIsFavorite(userId, scenarioId);

      if (isFav) {
        await removeFavorite(userId, scenarioId);
      } else {
        await addFavorite(userId, scenarioId);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favorites', userId] }),
        queryClient.invalidateQueries({ queryKey: ['favorite', userId, scenarioId] }),
      ]);
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleFavorite, isToggling };
}
