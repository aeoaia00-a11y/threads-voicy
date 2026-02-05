"use client";

import Link from "next/link";
import {
  PenSquare,
  Search,
  BarChart3,
  Calendar,
  TrendingUp,
  Settings,
  ArrowRight,
  Zap,
  Flame,
  Heart,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { useUserProfile, useResearch, usePosts } from "@/hooks";

const quickActions = [
  {
    href: "/generate",
    icon: PenSquare,
    title: "投稿を作成",
    description: "AIまたはテンプレートで投稿を生成",
    color: "bg-blue-500",
  },
  {
    href: "/research",
    icon: Search,
    title: "競合リサーチ",
    description: "競合の投稿を分析",
    color: "bg-purple-500",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    title: "分析を見る",
    description: "パフォーマンスを確認",
    color: "bg-green-500",
  },
  {
    href: "/calendar",
    icon: Calendar,
    title: "カレンダー",
    description: "投稿スケジュールを管理",
    color: "bg-orange-500",
  },
];

export default function Home() {
  const { profile, isLoaded: profileLoaded, hasProfile } = useUserProfile();
  const { posts: researchPosts, isLoaded: researchLoaded } = useResearch();
  const { posts: generatedPosts, isLoaded: postsLoaded } = usePosts();

  const isLoading = !profileLoaded || !researchLoaded || !postsLoaded;

  const scheduledCount = generatedPosts.filter(
    (p) => p.status === "scheduled"
  ).length;
  const draftCount = generatedPosts.filter(
    (p) => p.status === "draft" || p.status === "saved"
  ).length;
  const postedCount = generatedPosts.filter(
    (p) => p.status === "posted"
  ).length;

  // 伸びている投稿を取得（エンゲージメント率でソート）
  const getTopPerformingPosts = () => {
    // エンゲージメント率が設定されている投稿のみをフィルタ
    const postsWithEngagement = researchPosts.filter(
      (p) => p.engagementRate !== undefined && p.engagementRate > 0
    );

    // ユーザーのジャンルに合う投稿を優先
    const userGenre = profile?.genre?.toLowerCase() || "";

    const scored = postsWithEngagement.map((post) => {
      let score = post.engagementRate || 0;
      // 同じジャンルのタグがあればスコアをブースト
      if (userGenre && post.tags.some((tag) => tag.toLowerCase().includes(userGenre))) {
        score *= 1.5;
      }
      return { ...post, score };
    });

    // スコア順にソートして上位5件
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const topPosts = getTopPerformingPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-gray-500">Threads投稿を効率的に管理しよう</p>
        </div>
        {!hasProfile && (
          <Link href="/settings">
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              初期設定をする
            </Button>
          </Link>
        )}
      </div>

      {/* 初期設定の案内 */}
      {!hasProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  はじめに設定を完了しましょう
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ジャンル、ターゲット層、口調を設定すると、より精度の高い投稿が生成されます
                </p>
              </div>
              <Link href="/settings">
                <Button>
                  設定する
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ステータスカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">リサーチ投稿</p>
                <p className="text-2xl font-bold text-gray-900">
                  {researchPosts.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">下書き</p>
                <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <PenSquare className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">予約中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduledCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">投稿済み</p>
                <p className="text-2xl font-bold text-gray-900">{postedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 伸びている投稿 */}
      {topPosts.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                伸びている投稿
              </h2>
              <Badge variant="warning" size="sm">
                高エンゲージメント
              </Badge>
            </div>
            <Link href="/research">
              <Button variant="ghost" size="sm">
                すべて見る
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topPosts.map((post, index) => (
              <Card
                key={post.id}
                className={`relative ${
                  index === 0
                    ? "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50"
                    : ""
                }`}
              >
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="warning" size="sm" className="shadow-md">
                      <Flame className="w-3 h-3 mr-1" />
                      TOP
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {post.authorName && (
                        <p className="text-xs text-gray-500 mb-1">
                          @{post.authorName}
                          {post.authorFollowers && (
                            <span className="ml-2">
                              {post.authorFollowers.toLocaleString()} フォロワー
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {post.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          {post.likes.toLocaleString()}
                        </span>
                      )}
                      {post.comments !== undefined && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          {post.comments.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {post.engagementRate !== undefined && (
                        <Badge
                          variant={post.engagementRate >= 5 ? "success" : "info"}
                          size="sm"
                        >
                          ER {post.engagementRate.toFixed(1)}%
                        </Badge>
                      )}
                      {post.sourceUrl && (
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 投稿参考にするボタン */}
          <div className="mt-4 flex justify-center">
            <Link href="/generate">
              <Button variant="outline">
                <PenSquare className="w-4 h-4 mr-2" />
                これらの投稿を参考に生成する
              </Button>
            </Link>
          </div>
        </div>
      ) : researchPosts.length === 0 ? (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  伸びている投稿をチェックしよう
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  競合の投稿をリサーチすると、高エンゲージメントの投稿がここに表示されます
                </p>
              </div>
              <Link href="/research/new">
                <Button>
                  リサーチを始める
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* クイックアクション */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div
                      className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 最近のリサーチ */}
      {researchPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              最近のリサーチ
            </h2>
            <Link href="/research">
              <Button variant="ghost" size="sm">
                すべて見る
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchPosts.slice(0, 3).map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-800 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    {post.likes !== undefined && (
                      <Badge variant="info" size="sm">
                        {post.likes} いいね
                      </Badge>
                    )}
                    {post.engagementRate !== undefined && (
                      <Badge variant="success" size="sm">
                        {post.engagementRate.toFixed(2)}% ER
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* プロフィール情報 */}
      {hasProfile && profile && (
        <Card>
          <CardHeader>
            <CardTitle>現在の設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">ジャンル</p>
                <p className="font-medium text-gray-900">
                  {profile.genre || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ターゲット層</p>
                <p className="font-medium text-gray-900">
                  {profile.targetAudience || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">口調スタイル</p>
                <p className="font-medium text-gray-900">
                  {profile.toneSettings.baseStyle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
