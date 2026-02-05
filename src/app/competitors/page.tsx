"use client";

import { useState } from "react";
import { Plus, Users, TrendingUp, ExternalLink, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@/components/ui";
import { useLocalStorageArray } from "@/hooks";
import { CompetitorAccount } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function CompetitorsPage() {
  const {
    items: competitors,
    addItem,
    removeItem,
    isLoaded,
  } = useLocalStorageArray<CompetitorAccount>("competitors");

  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAddCompetitor = async () => {
    if (!newUrl.trim()) {
      setError("URLを入力してください");
      return;
    }

    if (!newUrl.includes("threads.net")) {
      setError("Threads URLを入力してください");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      // URLからユーザー名を抽出
      const match = newUrl.match(/@([^/]+)/);
      const username = match ? match[1] : "unknown";

      const newCompetitor: CompetitorAccount = {
        id: uuidv4(),
        username,
        displayName: username,
        profileUrl: newUrl,
        followers: 0,
        followersHistory: [],
        avgEngagementRate: 0,
        postFrequency: 0,
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addItem(newCompetitor);
      setNewUrl("");
    } catch (err) {
      setError("追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("この競合アカウントを削除しますか？")) {
      removeItem(id);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">競合監視</h1>
        <p className="mt-1 text-gray-500">
          競合アカウントを登録して、投稿と成長を追跡
        </p>
      </div>

      {/* 新規追加 */}
      <Card>
        <CardHeader>
          <CardTitle>競合アカウントを追加</CardTitle>
          <CardDescription>
            ThreadsのプロフィールURLを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="https://www.threads.net/@username"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                error={error}
              />
            </div>
            <Button onClick={handleAddCompetitor} isLoading={isAdding}>
              <Plus className="w-4 h-4 mr-2" />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 競合一覧 */}
      {competitors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              まだ競合アカウントがありません
            </h3>
            <p className="text-gray-500 mt-2">
              競合のThreadsアカウントを登録して追跡を始めましょう
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((competitor) => (
            <Card key={competitor.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {competitor.displayName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{competitor.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={competitor.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(competitor.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">フォロワー</p>
                    <p className="text-lg font-semibold">
                      {competitor.followers > 0
                        ? competitor.followers.toLocaleString()
                        : "未取得"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">平均ER</p>
                    <p className="text-lg font-semibold">
                      {competitor.avgEngagementRate > 0
                        ? `${competitor.avgEngagementRate.toFixed(2)}%`
                        : "未取得"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Badge variant="default" size="sm">
                    最終確認:{" "}
                    {new Date(competitor.lastChecked).toLocaleDateString("ja")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 機能説明 */}
      <Card className="bg-gray-50">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            自動監視機能（開発中）
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・競合の新規投稿を自動検知</li>
            <li>・エンゲージメント数の定期取得</li>
            <li>・フォロワー数の推移追跡</li>
            <li>・投稿パターンの分析</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
