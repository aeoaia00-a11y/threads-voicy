"use client";

import { TrendingUp, Search, Sparkles, RefreshCw } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
} from "@/components/ui";

export default function TrendsPage() {
  // サンプルトレンドデータ
  const sampleTrends = [
    { keyword: "副業", trend: "rising", volume: 85 },
    { keyword: "AI", trend: "rising", volume: 92 },
    { keyword: "リモートワーク", trend: "stable", volume: 65 },
    { keyword: "転職", trend: "rising", volume: 78 },
    { keyword: "スキルアップ", trend: "stable", volume: 58 },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">トレンド分析</h1>
          <p className="mt-1 text-gray-500">
            業界のトレンドを把握して、タイムリーな投稿を作成
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          更新
        </Button>
      </div>

      {/* 検索 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="キーワードを検索..."
                />
              </div>
            </div>
            <Button>検索</Button>
          </div>
        </CardContent>
      </Card>

      {/* トレンドワード */}
      <Card>
        <CardHeader>
          <CardTitle>トレンドワード</CardTitle>
          <CardDescription>あなたのジャンルで注目のキーワード</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleTrends.map((item, index) => (
              <div
                key={item.keyword}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.keyword}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.trend === "rising" ? (
                        <Badge variant="success" size="sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          上昇中
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">安定</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">検索ボリューム</p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.volume}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* トレンド投稿案 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-5 h-5 inline mr-2 text-yellow-500" />
            トレンドに乗った投稿案
          </CardTitle>
          <CardDescription>
            現在のトレンドを取り入れた投稿アイデア
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Badge variant="info" size="sm" className="mb-2">
                AIトレンド
              </Badge>
              <p className="text-gray-800">
                「AIを使いこなせる人」と「使えない人」の差が
                どんどん開いてる気がする。
                <br />
                <br />
                でも大事なのは
                「AIに何をさせるか」を考えられること。
                <br />
                <br />
                道具は使い手次第。
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Badge variant="info" size="sm" className="mb-2">
                副業トレンド
              </Badge>
              <p className="text-gray-800">
                副業で月5万円稼ぐのは、
                実はそんなに難しくない。
                <br />
                <br />
                ポイントは「小さく始める」こと。
                <br />
                <br />
                いきなり大きく稼ごうとすると
                挫折しやすいから要注意。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 機能説明 */}
      <Card className="bg-gray-50">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            トレンド機能（開発中）
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・Googleトレンド連携</li>
            <li>・X(Twitter)トレンド連携</li>
            <li>・業界別カスタムトレンド</li>
            <li>・AIによるトレンド投稿自動生成</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
