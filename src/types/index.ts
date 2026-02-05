// ユーザープロフィール
export interface UserProfile {
  id: string;
  genre: string;
  targetAudience: string;
  backendProduct: string;
  toneSettings: ToneSettings;
  createdAt: string;
  updatedAt: string;
}

// 口調設定（詳細）
export interface ToneSettings {
  id: string;
  name: string;
  baseStyle: "casual" | "professional" | "friendly" | "educational" | "provocative";
  politenessLevel: number; // 0: タメ口, 50: 丁寧語, 100: 敬語
  emojiUsage: number; // 0: なし, 50: 適度, 100: 多め
  sentenceEnding: "standard" | "soft" | "energetic" | "questioning" | "assertive";
  firstPerson: "私" | "僕" | "俺" | "わたし" | "custom";
  customFirstPerson?: string;
  audienceAddress: "あなた" | "みなさん" | "きみ" | "フォロワーさん" | "custom";
  customAudienceAddress?: string;
  lineBreakFrequency: number; // 0: 少なめ, 50: 普通, 100: 多め
  sentenceLength: number; // 0: 短文, 50: 普通, 100: 長文
  customPhrases: string[];
  ngWords: string[];
}

// 競合リサーチ
export interface ResearchPost {
  id: string;
  content: string;
  sourceType: "manual" | "url";
  sourceUrl?: string;
  authorName?: string;
  authorFollowers?: number;
  postedAt?: string;
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  engagementRate?: number;
  tags: string[];
  analysis?: PostAnalysis;
  createdAt: string;
  updatedAt: string;
}

// 生成した投稿
export interface GeneratedPost {
  id: string;
  content: string;
  type: "ai" | "template";
  templateId?: string;
  referencePostIds: string[];
  status: "draft" | "saved" | "scheduled" | "posted" | "failed";
  scheduledAt?: string;
  postedAt?: string;
  threadsPostId?: string;
  performance?: PostPerformance;
  createdAt: string;
  updatedAt: string;
}

// Threads認証情報
export interface ThreadsAuth {
  accessToken: string;
  userId: string;
  username: string;
  expiresAt: string;
}

// 投稿パフォーマンス
export interface PostPerformance {
  id: string;
  postId: string;
  recordedAt: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  profileVisits?: number;
  follows?: number;
}

// 投稿構造分析
export interface PostAnalysis {
  id: string;
  postId: string;
  pattern: "hook" | "story" | "list" | "question" | "empathy" | "results" | "contrast";
  hookType?: string;
  structure: string[];
  ctaType?: string;
  emojiCount: number;
  lineBreaks: number;
  charCount: number;
  hashtags: string[];
  keyPhrases: string[];
}

// 分析結果
export interface AnalyticsInsight {
  id: string;
  type: "trend" | "recommendation" | "warning";
  title: string;
  description: string;
  relatedPostIds: string[];
  suggestions?: string[];
  createdAt: string;
}

// テンプレート
export interface PostTemplate {
  id: string;
  name: string;
  pattern: string;
  structure: string;
  example: string;
  avgEngagementRate?: number;
  basedOnPostIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 競合アカウント
export interface CompetitorAccount {
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  followers: number;
  followersHistory: { date: string; count: number }[];
  avgEngagementRate: number;
  postFrequency: number;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

// A/Bテスト
export interface ABTest {
  id: string;
  name: string;
  originalPostId: string;
  variants: ABTestVariant[];
  status: "draft" | "running" | "completed";
  winner?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  content: string;
  variationType: "hook" | "cta" | "emoji" | "tone";
  performance?: PostPerformance;
}

// トレンド
export interface TrendItem {
  id: string;
  keyword: string;
  source: "google" | "twitter" | "threads";
  volume: number;
  trend: "rising" | "stable" | "falling";
  relatedTopics: string[];
  suggestedPosts: string[];
  fetchedAt: string;
}

// AI学習データ
export interface LearningData {
  id: string;
  type: "success_pattern" | "user_edit" | "preference";
  originalContent?: string;
  editedContent?: string;
  performanceScore?: number;
  learnedAt: string;
}

// AIプロバイダー
export type AIProvider = "openai" | "anthropic" | "google";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export const AI_PROVIDER_INFO: Record<AIProvider, { name: string; defaultModel: string; keyPrefix: string; keyUrl: string }> = {
  openai: {
    name: "OpenAI (ChatGPT)",
    defaultModel: "gpt-4o-mini",
    keyPrefix: "sk-",
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    name: "Anthropic (Claude)",
    defaultModel: "claude-3-5-sonnet-20241022",
    keyPrefix: "sk-ant-",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  google: {
    name: "Google (Gemini)",
    defaultModel: "gemini-1.5-flash",
    keyPrefix: "AI",
    keyUrl: "https://aistudio.google.com/app/apikey",
  },
};

// ストレージキー
export type StorageKey =
  | "userProfile"
  | "researchPosts"
  | "generatedPosts"
  | "threadsAuth"
  | "templates"
  | "competitors"
  | "abTests"
  | "trends"
  | "learningData"
  | "tonePresets"
  | "aiProvider";

// デフォルト口調設定
export const DEFAULT_TONE_SETTINGS: ToneSettings = {
  id: "",
  name: "デフォルト",
  baseStyle: "friendly",
  politenessLevel: 50,
  emojiUsage: 30,
  sentenceEnding: "standard",
  firstPerson: "私",
  audienceAddress: "あなた",
  lineBreakFrequency: 50,
  sentenceLength: 50,
  customPhrases: [],
  ngWords: [],
};
