// lib/client/story.ts
import { StoryActSchema, type StoryAct } from "@/lib/story/schema";

const cache = new Map<number, StoryAct>();

export async function fetchStory(act = 1): Promise<StoryAct> {
  const cached = cache.get(act);
  if (cached) return cached;
  const res = await fetch(`/api/story?act=${act}`);
  if (!res.ok) throw new Error(`Falha ao carregar a história (HTTP ${res.status}).`);
  const json = await res.json();
  const story = StoryActSchema.parse(json);
  cache.set(act, story);
  return story;
}
