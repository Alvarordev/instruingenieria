export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) return null;
  return (await res.json()) as T;
}
