"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Trash2,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
} from "@/components/ui";
import { useResearch } from "@/hooks";

export default function ResearchPage() {
  const { posts, isLoaded, deletePost, getTopPosts, getAllTags, filterByTags } =
    useResearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "engagement" | "likes">("latest");

  const allTags = getAllTags();

  // フィルタリングとソート
  let filteredPosts = selectedTags.length > 0 ? filterByTags(selectedTags) : posts;

  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy === "engagement") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => (b.engagementRate || 0) - (a.engagementRate || 0)
    );
  } else if (sortBy === "likes") {
    filteredPosts = [...filteredPosts].sort(
      (a, b) => (b.likes || 0) - (a.likes || 0)
    );
  } else {
    filteredPosts = [...filteredPosts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const topPosts = getTopPosts(3);

  if (!isLoaded) {
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
          <h1 className="text-2xl font-bold text-gray-900">競合リサーチ</h1>
          <p className="mt-1 text-gray-500">
            競合の投稿を収集・分析して、伸びるパターンを見つけよう
          </p>
        </div>
        <Link href="/research/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>
        </Link>
      </div>

      {/* トップパフォーマンス */}
      {topPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            高エンゲージメント投稿
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPosts.map((post, index) => (
              <Card
                key={post.id}
                className={`relative ${
                  index === 0 ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    TOP
                  </div>
                )}
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-800 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="success">
                      {post.engagementRate?.toFixed(2)}% ER
                    </Badge>
                    {post.authorName && (
                      <span className="text-xs text-gray-500">
                        @{post.authorName}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* フィルター */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="投稿内容や投稿者名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "latest" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSortBy("latest")}
              >
                新着順
              </Button>
              <Button
                variant={sortBy === "likes" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSortBy("likes")}
              >
                いいね順
              </Button>
              <Button
                variant={sortBy === "engagement" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSortBy("engagement")}
              >
                ER順
              </Button>
            </div>
          </div>

          {/* タグフィルター */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Filter className="w-4 h-4 text-gray-400 mt-1" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 投稿一覧 */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {posts.length === 0
                ? "まだリサーチ投稿がありません"
                : "該当する投稿が見つかりません"}
            </h3>
            <p className="text-gray-500 mt-2">
              {posts.length === 0
                ? "競合の投稿を登録して分析を始めましょう"
                : "検索条件を変更してみてください"}
            </p>
            {posts.length === 0 && (
              <Link href="/research/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  最初の投稿を登録
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* 投稿者情報 */}
                {post.authorName && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {post.authorName}
                      </p>
                      {post.authorFollowers && (
                        <p className="text-xs text-gray-500">
                          {post.authorFollowers.toLocaleString()} フォロワー
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 投稿内容 */}
                <p className="text-gray-800 whitespace-pre-wrap line-clamp-6">
                  {post.content}
                </p>

                {/* エンゲージメント指標 */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  {post.likes !== undefined && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes.toLocaleString()}
                    </span>
                  )}
                  {post.comments !== undefined && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments.toLocaleString()}
                    </span>
                  )}
                  {post.shares !== undefined && (
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {post.shares.toLocaleString()}
                    </span>
                  )}
                  {post.saves !== undefined && (
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      {post.saves.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* タグとアクション */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {post.engagementRate !== undefined && (
                      <Badge variant="success" size="sm">
                        {post.engagementRate.toFixed(2)}% ER
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.sourceUrl && (
                      <a
                        href={post.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("この投稿を削除しますか？")) {
                          deletePost(post.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
