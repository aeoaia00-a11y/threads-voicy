"use client";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { GeneratedPost, PostPerformance } from "@/types";
import { useLocalStorageArray } from "./useLocalStorage";

export function usePosts() {
  const {
    items: posts,
    setItems: setPosts,
    addItem,
    updateItem,
    removeItem,
    findItem,
    isLoaded,
  } = useLocalStorageArray<GeneratedPost>("generatedPosts");

  const createPost = useCallback(
    (data: Omit<GeneratedPost, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newPost: GeneratedPost = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      addItem(newPost);
      return newPost;
    },
    [addItem]
  );

  const updatePost = useCallback(
    (id: string, updates: Partial<Omit<GeneratedPost, "id" | "createdAt">>) => {
      const now = new Date().toISOString();
      updateItem(id, { ...updates, updatedAt: now });
    },
    [updateItem]
  );

  const deletePost = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const setPostStatus = useCallback(
    (
      id: string,
      status: GeneratedPost["status"],
      additionalData?: Partial<GeneratedPost>
    ) => {
      const now = new Date().toISOString();
      updateItem(id, {
        status,
        ...additionalData,
        ...(status === "posted" ? { postedAt: now } : {}),
        updatedAt: now,
      });
    },
    [updateItem]
  );

  const setPerformance = useCallback(
    (postId: string, performance: Omit<PostPerformance, "id" | "postId">) => {
      const now = new Date().toISOString();
      const perf: PostPerformance = {
        ...performance,
        id: uuidv4(),
        postId,
      };
      updateItem(postId, { performance: perf, updatedAt: now });
    },
    [updateItem]
  );

  // ステータスでフィルター
  const filterByStatus = useCallback(
    (status: GeneratedPost["status"]) => {
      return posts.filter((p) => p.status === status);
    },
    [posts]
  );

  // 予約投稿を取得
  const getScheduledPosts = useCallback(() => {
    return posts
      .filter((p) => p.status === "scheduled" && p.scheduledAt)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime()
      );
  }, [posts]);

  // 投稿済みを取得
  const getPostedPosts = useCallback(() => {
    return posts
      .filter((p) => p.status === "posted")
      .sort(
        (a, b) =>
          new Date(b.postedAt || b.createdAt).getTime() -
          new Date(a.postedAt || a.createdAt).getTime()
      );
  }, [posts]);

  // ドラフトを取得
  const getDraftPosts = useCallback(() => {
    return posts
      .filter((p) => p.status === "draft" || p.status === "saved")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [posts]);

  return {
    posts,
    setPosts,
    isLoaded,
    createPost,
    updatePost,
    deletePost,
    findPost: findItem,
    setPostStatus,
    setPerformance,
    filterByStatus,
    getScheduledPosts,
    getPostedPosts,
    getDraftPosts,
  };
}
