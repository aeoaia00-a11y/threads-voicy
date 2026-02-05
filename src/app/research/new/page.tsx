"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Link2, FileText, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { useResearch } from "@/hooks";

type InputMode = "url" | "manual";

export default function NewResearchPage() {
  const router = useRouter();
  const { createPost } = useResearch();

  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // URL入力用
  const [url, setUrl] = useState("");

  // 手動入力用
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorFollowers, setAuthorFollowers] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "取得に失敗しました");
        return;
      }

      // 取得したデータをフォームに反映
      setContent(data.content || "");
      setAuthorName(data.authorName || "");
      if (data.authorFollowers) {
        setAuthorFollowers(data.authorFollowers.toString());
      }
      if (data.likes) setLikes(data.likes.toString());
      if (data.comments) setComments(data.comments.toString());
      if (data.shares) setShares(data.shares.toString());

      // 手動入力モードに切り替え
      setInputMode("manual");
    } catch (err) {
      setError("取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("投稿内容を入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      createPost({
        content: content.trim(),
        sourceType: url ? "url" : "manual",
        sourceUrl: url || undefined,
        authorName: authorName.trim() || undefined,
        authorFollowers: authorFollowers ? parseInt(authorFollowers) : undefined,
        likes: likes ? parseInt(likes) : undefined,
        comments: comments ? parseInt(comments) : undefined,
        shares: shares ? parseInt(shares) : undefined,
        saves: saves ? parseInt(saves) : undefined,
        tags,
      });

      router.push("/research");
    } catch (err) {
      setError("保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link href="/research">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">リサーチ投稿を登録</h1>
          <p className="text-gray-500">競合の投稿を分析用に登録します</p>
        </div>
      </div>

      {/* 入力モード切り替え */}
      <div className="flex gap-2">
        <Button
          variant={inputMode === "url" ? "primary" : "outline"}
          onClick={() => setInputMode("url")}
        >
          <Link2 className="w-4 h-4 mr-2" />
          URLから取得
        </Button>
        <Button
          variant={inputMode === "manual" ? "primary" : "outline"}
          onClick={() => setInputMode("manual")}
        >
          <FileText className="w-4 h-4 mr-2" />
          手動入力
        </Button>
      </div>

      {/* URL入力 */}
      {inputMode === "url" && (
        <Card>
          <CardHeader>
            <CardTitle>URLから自動取得</CardTitle>
            <CardDescription>
              Threads投稿のURLを入力すると、内容を自動で取得します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Threads投稿URL"
              placeholder="https://www.threads.net/@username/post/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleFetchUrl} isLoading={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  取得中...
                </>
              ) : (
                "投稿を取得"
              )}
            </Button>
            <p className="text-xs text-gray-500">
              ※ エンゲージメント数（いいね、コメント等）は取得後に手動で入力してください
            </p>
          </CardContent>
        </Card>
      )}

      {/* 手動入力 */}
      {inputMode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>投稿情報を入力</CardTitle>
            <CardDescription>
              競合の投稿内容とエンゲージメント指標を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="投稿内容"
              placeholder="投稿のテキストを入力..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="投稿者名"
                placeholder="@username"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <Input
                label="フォロワー数"
                type="number"
                placeholder="10000"
                value={authorFollowers}
                onChange={(e) => setAuthorFollowers(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="いいね数"
                type="number"
                placeholder="100"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
              />
              <Input
                label="コメント数"
                type="number"
                placeholder="10"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <Input
                label="シェア数"
                type="number"
                placeholder="5"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
              />
              <Input
                label="保存数"
                type="number"
                placeholder="20"
                value={saves}
                onChange={(e) => setSaves(e.target.value)}
              />
            </div>

            {/* タグ入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="タグを入力..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outline" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {url && (
              <Input
                label="元のURL（参照用）"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 保存ボタン */}
      {inputMode === "manual" && (
        <div className="flex justify-end gap-4">
          <Link href="/research">
            <Button variant="outline">キャンセル</Button>
          </Link>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            保存する
          </Button>
        </div>
      )}
    </div>
  );
}
