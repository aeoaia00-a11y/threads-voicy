"use client";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ResearchPost } from "@/types";
import { useLocalStorageArray } from "./useLocalStorage";

export function useResearch() {
  const {
    items: posts,
    setItems: setPosts,
    addItem,
    updateItem,
    removeItem,
    findItem,
    isLoaded,
  } = useLocalStorageArray<ResearchPost>("researchPosts");

  const createPost = useCallback(
    (
      data: Omit<ResearchPost, "id" | "createdAt" | "updatedAt" | "engagementRate">
    ) => {
      const now = new Date().toISOString();

      // エンゲージメント率を計算
      let engagementRate: number | undefined;
      if (data.likes !== undefined && data.authorFollowers) {
        const totalEngagement =
          (data.likes || 0) +
          (data.comments || 0) +
          (data.shares || 0) +
          (data.saves || 0);
        engagementRate = (totalEngagement / data.authorFollowers) * 100;
      }

      const newPost: ResearchPost = {
        ...data,
        id: uuidv4(),
        engagementRate,
        createdAt: now,
        updatedAt: now,
      };
      addItem(newPost);
      return newPost;
    },
    [addItem]
  );

  const updatePost = useCallback(
    (id: string, updates: Partial<Omit<ResearchPost, "id" | "createdAt">>) => {
      const now = new Date().toISOString();

      // エンゲージメント率を再計算
      const existingPost = findItem(id);
      if (existingPost) {
        const mergedData = { ...existingPost, ...updates };
        if (
          mergedData.likes !== undefined &&
          mergedData.authorFollowers
        ) {
          const totalEngagement =
            (mergedData.likes || 0) +
            (mergedData.comments || 0) +
            (mergedData.shares || 0) +
            (mergedData.saves || 0);
          updates.engagementRate =
            (totalEngagement / mergedData.authorFollowers) * 100;
        }
      }

      updateItem(id, { ...updates, updatedAt: now });
    },
    [updateItem, findItem]
  );

  const deletePost = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  // 高エンゲージメント投稿を取得
  const getTopPosts = useCallback(
    (limit: number = 10) => {
      return [...posts]
        .filter((p) => p.engagementRate !== undefined)
        .sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0))
        .slice(0, limit);
    },
    [posts]
  );

  // タグでフィルター
  const filterByTags = useCallback(
    (tags: string[]) => {
      if (tags.length === 0) return posts;
      return posts.filter((p) => tags.some((tag) => p.tags.includes(tag)));
    },
    [posts]
  );

  // 全タグを取得
  const getAllTags = useCallback(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [posts]);

  return {
    posts,
    setPosts,
    isLoaded,
    createPost,
    updatePost,
    deletePost,
    findPost: findItem,
    getTopPosts,
    filterByTags,
    getAllTags,
  };
}
