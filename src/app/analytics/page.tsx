"use client";

import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { usePosts, useResearch } from "@/hooks";

export default function AnalyticsPage() {
  const { posts, isLoaded: postsLoaded } = usePosts();
  const { posts: researchPosts, isLoaded: researchLoaded } = useResearch();

  const isLoading = !postsLoaded || !researchLoaded;

  // 投稿済みの投稿
  const postedPosts = posts.filter((p) => p.status === "posted");

  // パフォーマンスがある投稿
  const postsWithPerformance = postedPosts.filter((p) => p.performance);

  // 平均エンゲージメント率
  const avgEngagementRate =
    postsWithPerformance.length > 0
      ? postsWithPerformance.reduce(
          (sum, p) => sum + (p.performance?.engagementRate || 0),
          0
        ) / postsWithPerformance.length
      : 0;

  // 総いいね数
  const totalLikes = postsWithPerformance.reduce(
    (sum, p) => sum + (p.performance?.likes || 0),
    0
  );

  // 競合の平均ER
  const competitorAvgER =
    researchPosts.filter((p) => p.engagementRate).length > 0
      ? researchPosts.reduce((sum, p) => sum + (p.engagementRate || 0), 0) /
        researchPosts.filter((p) => p.engagementRate).length
      : 0;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分析</h1>
        <p className="mt-1 text-gray-500">
          投稿パフォーマンスと競合との比較
        </p>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">投稿数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {postedPosts.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">平均ER</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgEngagementRate.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">総いいね数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLikes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Users className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">競合平均ER</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitorAvgER.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* パフォーマンス入力案内 */}
      {postsWithPerformance.length === 0 && postedPosts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <h3 className="font-semibold text-blue-900">
              パフォーマンスデータを入力しましょう
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              投稿管理ページから各投稿のエンゲージメント数を入力すると、
              詳細な分析が可能になります。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 詳細分析（将来実装） */}
      <Card>
        <CardHeader>
          <CardTitle>パフォーマンス推移</CardTitle>
          <CardDescription>
            投稿ごとのエンゲージメント推移グラフ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">
              {postsWithPerformance.length > 0
                ? "グラフを表示（将来実装）"
                : "パフォーマンスデータがありません"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 投稿別パフォーマンス */}
      {postsWithPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>投稿別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {postsWithPerformance.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span>❤️ {post.performance?.likes}</span>
                    <span>💬 {post.performance?.comments}</span>
                    <span>🔄 {post.performance?.shares}</span>
                    <span className="text-green-700 font-medium">
                      ER: {post.performance?.engagementRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
