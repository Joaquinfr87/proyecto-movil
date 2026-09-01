import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RatingDraft {
  rating: number | null;
  comment: string;
}

const draftKey = (userId: string) => `rating_draft:v1:${userId}`;
const cacheKey = (userId: string) => `my_ratings_cache:v1:${userId}`;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silenciar fallos de escritura local
  }
}

// ─── Borrador de la valoración (Parte 5: info temporal local) ───────────────

export async function getRatingDraft(
  userId: string,
  scenarioId: string,
): Promise<RatingDraft | null> {
  const drafts = await readJson<Record<string, RatingDraft>>(draftKey(userId));
  return drafts?.[scenarioId] ?? null;
}

export async function saveRatingDraft(
  userId: string,
  scenarioId: string,
  draft: RatingDraft,
): Promise<void> {
  const drafts = (await readJson<Record<string, RatingDraft>>(draftKey(userId))) ?? {};
  drafts[scenarioId] = draft;
  await writeJson(draftKey(userId), drafts);
}

export async function clearRatingDraft(userId: string, scenarioId: string): Promise<void> {
  const drafts = await readJson<Record<string, RatingDraft>>(draftKey(userId));
  if (!drafts) return;
  delete drafts[scenarioId];
  await writeJson(draftKey(userId), drafts);
}

// ─── Caché offline de "Mis valoraciones" (Parte 5) ─────────────────────────────

export async function getCachedMyRatings<T>(userId: string): Promise<T[]> {
  const cached = await readJson<T[]>(cacheKey(userId));
  return cached ?? [];
}

export async function saveCachedMyRatings<T>(userId: string, data: T[]): Promise<void> {
  await writeJson(cacheKey(userId), data);
}

export async function clearCachedMyRatings(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(userId));
  } catch {
    // Silenciar fallos de borrado local
  }
}
