"use client";

import { useState, useEffect, useCallback } from "react";
import { StorageKey } from "@/types";
import { getItem, setItem } from "@/lib/storage";

export function useLocalStorage<T>(
  key: StorageKey,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初期化時にlocalStorageから値を読み込む
  useEffect(() => {
    const item = getItem<T>(key);
    if (item !== null) {
      setStoredValue(item);
    }
    setIsLoaded(true);
  }, [key]);

  // 値を更新する関数
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        setItem(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue, isLoaded];
}

// 配列データ用のカスタムフック
export function useLocalStorageArray<T extends { id: string }>(
  key: StorageKey
) {
  const [items, setItems, isLoaded] = useLocalStorage<T[]>(key, []);

  const addItem = useCallback(
    (item: T) => {
      setItems((prev) => [...prev, item]);
    },
    [setItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<T>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [setItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const findItem = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    findItem,
    isLoaded,
  };
}
