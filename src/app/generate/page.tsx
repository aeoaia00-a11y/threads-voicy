"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  Save,
  RefreshCw,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Textarea,
  Slider,
  Select,
  Badge,
  Input,
} from "@/components/ui";
import { useUserProfile, useResearch, usePosts } from "@/hooks";
import { DEFAULT_TEMPLATES, getTemplateById } from "@/lib/templates";
import { ToneSettings } from "@/types";

type GenerationMode = "template" | "ai";

export default function GeneratePage() {
  const router = useRouter();
  const { profile, isLoaded: profileLoaded, hasProfile } = useUserProfile();
  const { posts: researchPosts } = useResearch();
  const { createPost } = usePosts();

  const [mode, setMode] = useState<GenerationMode>("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    DEFAULT_TEMPLATES[0].id
  );
  // 複数投稿対応
  const [generatedContents, setGeneratedContents] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  // 口調調整用
  const [showToneAdjust, setShowToneAdjust] = useState(false);
  const [tempTone, setTempTone] = useState<Partial<ToneSettings>>({});

  // 参考投稿選択
  const [selectedRefPosts, setSelectedRefPosts] = useState<string[]>([]);
  const [showRefPosts, setShowRefPosts] = useState(false);

  const selectedTemplate = getTemplateById(selectedTemplateId);

  const handleGenerate = async () => {
    if (!hasProfile || !profile) {
      setError("先に設定ページでプロフィールを登録してください");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedContents([]);

    try {
      // 参考投稿のテキストを取得
      const referenceTexts = selectedRefPosts
        .map((id) => researchPosts.find((p) => p.id === id)?.content)
        .filter(Boolean) as string[];

      // 口調を一時的に調整
      const adjustedProfile = {
        ...profile,
        toneSettings: {
          ...profile.toneSettings,
          ...tempTone,
        },
      };

      if (mode === "ai" && selectedTemplate) {
        // 複数のAI生成をPromise.allで並列実行
        const promises = Array(generateCount)
          .fill(null)
          .map(async () => {
            const response = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                profile: adjustedProfile,
                templateContent: selectedTemplate.structure,
                referenceTexts,
              }),
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "生成に失敗しました");
            }
            return data.content;
          });

        const results = await Promise.all(promises);
        setGeneratedContents(results);
      } else {
        // テンプレートから生成（例として複数表示）
        const examples = DEFAULT_TEMPLATES.slice(0, generateCount).map(
          (t) => t.example
        );
        setGeneratedContents(examples);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成中にエラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (index: number) => {
    await navigator.clipboard.writeText(generatedContents[index]);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = (index: number) => {
    const content = generatedContents[index];
    if (!content) return;

    createPost({
      content,
      type: mode === "ai" ? "ai" : "template",
      templateId: selectedTemplateId,
      referencePostIds: selectedRefPosts,
      status: "draft",
    });
  };

  const handleSaveAll = () => {
    generatedContents.forEach((content) => {
      if (content) {
        createPost({
          content,
          type: mode === "ai" ? "ai" : "template",
          templateId: selectedTemplateId,
          referencePostIds: selectedRefPosts,
          status: "draft",
        });
      }
    });
    router.push("/posts");
  };

  const handleUpdateContent = (index: number, newContent: string) => {
    const updated = [...generatedContents];
    updated[index] = newContent;
    setGeneratedContents(updated);
  };

  const handleDeleteContent = (index: number) => {
    setGeneratedContents(generatedContents.filter((_, i) => i !== index));
  };

  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿を生成</h1>
        <p className="mt-1 text-gray-500">
          テンプレートまたはAIを使って投稿を作成
        </p>
      </div>

      {/* プロフィール未設定の警告 */}
      {!hasProfile && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <p className="text-yellow-800">
              投稿を生成するには、まず設定ページでプロフィールを登録してください。
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => router.push("/settings")}
            >
              設定ページへ
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: 設定 */}
        <div className="space-y-4">
          {/* 生成モード */}
          <Card>
            <CardHeader>
              <CardTitle>生成モード</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={mode === "template" ? "primary" : "outline"}
                  onClick={() => setMode("template")}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  テンプレート
                </Button>
                <Button
                  variant={mode === "ai" ? "primary" : "outline"}
                  onClick={() => setMode("ai")}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI生成
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* テンプレート選択 */}
          <Card>
            <CardHeader>
              <CardTitle>テンプレート</CardTitle>
              <CardDescription>投稿の構成パターンを選択</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplateId === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {template.name}
                    </span>
                    <Badge variant="default" size="sm">
                      {template.pattern}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* 参考投稿 */}
          {researchPosts.length > 0 && (
            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowRefPosts(!showRefPosts)}
                  className="w-full flex items-center justify-between"
                >
                  <div>
                    <CardTitle>参考投稿を選択</CardTitle>
                    <CardDescription>
                      リサーチした投稿から参考にするものを選択
                    </CardDescription>
                  </div>
                  {showRefPosts ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </CardHeader>
              {showRefPosts && (
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                  {researchPosts.slice(0, 10).map((post) => (
                    <label
                      key={post.id}
                      className={`flex items-start gap-3 p-2 rounded cursor-pointer ${
                        selectedRefPosts.includes(post.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRefPosts.includes(post.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRefPosts([...selectedRefPosts, post.id]);
                          } else {
                            setSelectedRefPosts(
                              selectedRefPosts.filter((id) => id !== post.id)
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700 line-clamp-2">
                        {post.content}
                      </span>
                    </label>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* 口調調整 */}
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowToneAdjust(!showToneAdjust)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-gray-500" />
                  <CardTitle>口調を調整</CardTitle>
                </div>
                {showToneAdjust ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {showToneAdjust && profile && (
              <CardContent className="space-y-4">
                <Slider
                  label="敬語レベル"
                  value={
                    tempTone.politenessLevel ??
                    profile.toneSettings.politenessLevel
                  }
                  min={0}
                  max={100}
                  minLabel="タメ口"
                  maxLabel="敬語"
                  onChange={(e) =>
                    setTempTone({
                      ...tempTone,
                      politenessLevel: Number(e.target.value),
                    })
                  }
                />
                <Slider
                  label="絵文字使用量"
                  value={
                    tempTone.emojiUsage ?? profile.toneSettings.emojiUsage
                  }
                  min={0}
                  max={100}
                  minLabel="なし"
                  maxLabel="多め"
                  onChange={(e) =>
                    setTempTone({
                      ...tempTone,
                      emojiUsage: Number(e.target.value),
                    })
                  }
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTempTone({
                        ...tempTone,
                        politenessLevel: 20,
                        emojiUsage: 60,
                      })
                    }
                  >
                    カジュアルに
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTempTone({
                        ...tempTone,
                        politenessLevel: 80,
                        emojiUsage: 10,
                      })
                    }
                  >
                    丁寧に
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 生成数の選択 */}
          <Card>
            <CardHeader>
              <CardTitle>生成数</CardTitle>
              <CardDescription>一度に生成する投稿の数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((num) => (
                  <Button
                    key={num}
                    variant={generateCount === num ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setGenerateCount(num)}
                  >
                    {num}件
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 生成ボタン */}
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!hasProfile}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {generateCount}件を生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {generateCount}件の投稿を生成
              </>
            )}
          </Button>
        </div>

        {/* 右側: プレビュー */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>生成結果 ({generatedContents.length}件)</CardTitle>
                {generatedContents.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSaveAll}>
                      <Save className="w-4 h-4 mr-1" />
                      すべて保存
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {generatedContents.length > 0 ? (
                <div className="space-y-4">
                  {generatedContents.map((content, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default">#{index + 1}</Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSave(index)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={content}
                        onChange={(e) =>
                          handleUpdateContent(index, e.target.value)
                        }
                        className="min-h-[150px] mb-2"
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {content.length} 文字
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                  <FileText className="w-12 h-12 mb-4" />
                  <p>テンプレートを選択して生成ボタンを押してください</p>
                  <p className="text-sm mt-2">
                    {generateCount}件の投稿が一度に生成されます
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
