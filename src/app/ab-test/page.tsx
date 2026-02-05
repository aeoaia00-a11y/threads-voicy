"use client";

import { useState } from "react";
import { FlaskConical, Plus, Play, Trophy } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Textarea,
  Select,
} from "@/components/ui";

export default function ABTestPage() {
  const [originalContent, setOriginalContent] = useState("");
  const [variationType, setVariationType] = useState<string>("hook");

  const variationOptions = [
    { value: "hook", label: "フック文を変更" },
    { value: "cta", label: "CTAを変更" },
    { value: "emoji", label: "絵文字を変更" },
    { value: "tone", label: "トーンを変更" },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">A/Bテスト</h1>
        <p className="mt-1 text-gray-500">
          同じ内容で異なる表現のバリエーションを作成して比較
        </p>
      </div>

      {/* 新規テスト作成 */}
      <Card>
        <CardHeader>
          <CardTitle>新しいA/Bテストを作成</CardTitle>
          <CardDescription>
            元の投稿を入力し、バリエーションの種類を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="元の投稿"
            placeholder="A/Bテストしたい投稿内容を入力..."
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
            className="min-h-[150px]"
          />
          <Select
            label="バリエーションの種類"
            options={variationOptions}
            value={variationType}
            onChange={(e) => setVariationType(e.target.value)}
          />
          <Button disabled={!originalContent}>
            <FlaskConical className="w-4 h-4 mr-2" />
            バリエーションを生成
          </Button>
        </CardContent>
      </Card>

      {/* テスト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>A/Bテスト一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <FlaskConical className="w-12 h-12 mx-auto mb-4" />
            <p>まだA/Bテストがありません</p>
            <p className="text-sm mt-1">
              上のフォームから最初のテストを作成しましょう
            </p>
          </div>
        </CardContent>
      </Card>

      {/* サンプルテスト結果 */}
      <Card>
        <CardHeader>
          <CardTitle>テスト結果の例</CardTitle>
          <CardDescription>
            A/Bテストの結果はこのように表示されます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* バリアントA */}
            <div className="border-2 border-green-500 rounded-lg p-4 relative">
              <div className="absolute -top-3 -right-3">
                <Badge variant="success">
                  <Trophy className="w-3 h-3 mr-1" />
                  勝者
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">バリアントA</h4>
              <p className="text-sm text-gray-700 mb-4">
                99%の人が知らない事実。
                <br />
                副業で月10万円稼ぐ人の特徴は...
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">いいね</span>
                  <span className="font-medium">245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">コメント</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ER</span>
                  <span className="font-medium text-green-600">4.8%</span>
                </div>
              </div>
            </div>

            {/* バリアントB */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">バリアントB</h4>
              <p className="text-sm text-gray-700 mb-4">
                副業で月10万円稼ぐ人の特徴って知ってる？
                <br />
                実は99%の人が知らないんだけど...
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">いいね</span>
                  <span className="font-medium">187</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">コメント</span>
                  <span className="font-medium">21</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ER</span>
                  <span className="font-medium">3.2%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 機能説明 */}
      <Card className="bg-gray-50">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            A/Bテスト機能（開発中）
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・AIによる自動バリエーション生成</li>
            <li>・パフォーマンス自動追跡</li>
            <li>・勝者パターンの学習</li>
            <li>・統計的有意性の判定</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
