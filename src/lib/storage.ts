import { StorageKey } from "@/types";

const STORAGE_PREFIX = "threads_voicy_";

export function getStorageKey(key: StorageKey): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getItem<T>(key: StorageKey): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(getStorageKey(key));
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

export function setItem<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

export function removeItem(key: StorageKey): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

// 配列データの操作ヘルパー
export function addToArray<T extends { id: string }>(
  key: StorageKey,
  item: T
): T[] {
  const items = getItem<T[]>(key) || [];
  const newItems = [...items, item];
  setItem(key, newItems);
  return newItems;
}

export function updateInArray<T extends { id: string }>(
  key: StorageKey,
  id: string,
  updates: Partial<T>
): T[] {
  const items = getItem<T[]>(key) || [];
  const newItems = items.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  setItem(key, newItems);
  return newItems;
}

export function removeFromArray<T extends { id: string }>(
  key: StorageKey,
  id: string
): T[] {
  const items = getItem<T[]>(key) || [];
  const newItems = items.filter((item) => item.id !== id);
  setItem(key, newItems);
  return newItems;
}

export function findInArray<T extends { id: string }>(
  key: StorageKey,
  id: string
): T | undefined {
  const items = getItem<T[]>(key) || [];
  return items.find((item) => item.id === id);
}
