"use client";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { UserProfile, ToneSettings, DEFAULT_TONE_SETTINGS } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_PROFILE: UserProfile = {
  id: "",
  genre: "",
  targetAudience: "",
  backendProduct: "",
  toneSettings: DEFAULT_TONE_SETTINGS,
  createdAt: "",
  updatedAt: "",
};

export function useUserProfile() {
  const [profile, setProfile, isLoaded] = useLocalStorage<UserProfile | null>(
    "userProfile",
    null
  );

  const createProfile = useCallback(
    (data: Omit<UserProfile, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        ...data,
        id: uuidv4(),
        toneSettings: {
          ...data.toneSettings,
          id: uuidv4(),
        },
        createdAt: now,
        updatedAt: now,
      };
      setProfile(newProfile);
      return newProfile;
    },
    [setProfile]
  );

  const updateProfile = useCallback(
    (updates: Partial<Omit<UserProfile, "id" | "createdAt">>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [setProfile]
  );

  const updateToneSettings = useCallback(
    (updates: Partial<ToneSettings>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          toneSettings: {
            ...prev.toneSettings,
            ...updates,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [setProfile]
  );

  const resetProfile = useCallback(() => {
    setProfile(null);
  }, [setProfile]);

  return {
    profile,
    isLoaded,
    hasProfile: !!profile?.id,
    createProfile,
    updateProfile,
    updateToneSettings,
    resetProfile,
    defaultProfile: DEFAULT_PROFILE,
  };
}
