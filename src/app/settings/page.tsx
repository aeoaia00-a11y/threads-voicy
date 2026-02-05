"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Key, Link2, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  Slider,
  Badge,
} from "@/components/ui";
import { useUserProfile, useLocalStorage } from "@/hooks";
import { ToneSettings, DEFAULT_TONE_SETTINGS } from "@/types";

const baseStyleOptions = [
  { value: "casual", label: "カジュアル" },
  { value: "professional", label: "プロフェッショナル" },
  { value: "friendly", label: "フレンドリー" },
  { value: "educational", label: "教育的" },
  { value: "provocative", label: "挑発的" },
];

const sentenceEndingOptions = [
  { value: "standard", label: "標準" },
  { value: "soft", label: "柔らかめ" },
  { value: "energetic", label: "エネルギッシュ" },
  { value: "questioning", label: "問いかけ" },
  { value: "assertive", label: "断定的" },
];

const firstPersonOptions = [
  { value: "私", label: "私" },
  { value: "僕", label: "僕" },
  { value: "俺", label: "俺" },
  { value: "わたし", label: "わたし" },
  { value: "custom", label: "カスタム" },
];

const audienceAddressOptions = [
  { value: "あなた", label: "あなた" },
  { value: "みなさん", label: "みなさん" },
  { value: "きみ", label: "きみ" },
  { value: "フォロワーさん", label: "フォロワーさん" },
  { value: "custom", label: "カスタム" },
];

interface ApiSettings {
  openaiApiKey: string;
  threadsAppId: string;
  threadsAppSecret: string;
  threadsAccessToken: string;
  threadsUserId: string;
}

const DEFAULT_API_SETTINGS: ApiSettings = {
  openaiApiKey: "",
  threadsAppId: "",
  threadsAppSecret: "",
  threadsAccessToken: "",
  threadsUserId: "",
};

export default function SettingsPage() {
  const {
    profile,
    isLoaded,
    hasProfile,
    createProfile,
    updateProfile,
    updateToneSettings,
  } = useUserProfile();

  const [apiSettings, setApiSettings, apiLoaded] = useLocalStorage<ApiSettings>(
    "userProfile", // 一時的にuserProfileを使用、本来は別のキーが望ましい
    DEFAULT_API_SETTINGS
  );

  const [formData, setFormData] = useState({
    genre: "",
    targetAudience: "",
    backendProduct: "",
  });

  const [toneData, setToneData] = useState<ToneSettings>(DEFAULT_TONE_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // API設定
  const [openaiKey, setOpenaiKey] = useState("");
  const [threadsAppId, setThreadsAppId] = useState("");
  const [threadsAppSecret, setThreadsAppSecret] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showThreadsSecret, setShowThreadsSecret] = useState(false);
  const [threadsConnected, setThreadsConnected] = useState(false);

  useEffect(() => {
    if (isLoaded && profile) {
      setFormData({
        genre: profile.genre,
        targetAudience: profile.targetAudience,
        backendProduct: profile.backendProduct,
      });
      setToneData(profile.toneSettings);
    }
  }, [isLoaded, profile]);

  // ローカルストレージからAPI設定を読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOpenaiKey = localStorage.getItem("threads_voicy_openai_key") || "";
      const savedThreadsAppId = localStorage.getItem("threads_voicy_threads_app_id") || "";
      const savedThreadsAppSecret = localStorage.getItem("threads_voicy_threads_app_secret") || "";
      const savedThreadsToken = localStorage.getItem("threads_voicy_threads_token") || "";

      setOpenaiKey(savedOpenaiKey);
      setThreadsAppId(savedThreadsAppId);
      setThreadsAppSecret(savedThreadsAppSecret);
      setThreadsConnected(!!savedThreadsToken);
    }
  }, []);

  const handleSaveApiSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("threads_voicy_openai_key", openaiKey);
      localStorage.setItem("threads_voicy_threads_app_id", threadsAppId);
      localStorage.setItem("threads_voicy_threads_app_secret", threadsAppSecret);
      setSaveMessage("API設定を保存しました");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleConnectThreads = () => {
    // Threads OAuth認証フローを開始
    // 実際の実装では、Meta Developer ConsoleでアプリをセットアップしてOAuth URLにリダイレクト
    const clientId = threadsAppId;
    const redirectUri = encodeURIComponent(window.location.origin + "/api/threads/callback");
    const scope = encodeURIComponent("threads_basic,threads_content_publish");

    if (!clientId) {
      alert("Threads App IDを先に設定してください");
      return;
    }

    const authUrl = `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    window.open(authUrl, "_blank");
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      if (hasProfile) {
        updateProfile(formData);
        updateToneSettings(toneData);
      } else {
        createProfile({
          ...formData,
          toneSettings: toneData,
        });
      }
      setSaveMessage("保存しました");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTone = () => {
    setToneData(DEFAULT_TONE_SETTINGS);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-gray-500">
          プロフィールと投稿の口調を設定します
        </p>
      </div>

      {/* API連携設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API連携設定
          </CardTitle>
          <CardDescription>
            OpenAI APIとThreads APIの設定を行います
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI API */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">OpenAI API</h4>
            <div className="relative">
              <Input
                label="OpenAI APIキー"
                type={showOpenaiKey ? "text" : "password"}
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                OpenAI APIキーを取得 <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Threads API */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Threads API連携</h4>
              {threadsConnected ? (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  連携済み
                </Badge>
              ) : (
                <Badge variant="warning">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  未連携
                </Badge>
              )}
            </div>

            <Input
              label="Threads App ID"
              placeholder="123456789..."
              value={threadsAppId}
              onChange={(e) => setThreadsAppId(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Threads App Secret"
                type={showThreadsSecret ? "text" : "password"}
                placeholder="..."
                value={threadsAppSecret}
                onChange={(e) => setThreadsAppSecret(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowThreadsSecret(!showThreadsSecret)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showThreadsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Meta Developer Consoleでアプリを作成 <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveApiSettings}>
                <Save className="w-4 h-4 mr-2" />
                API設定を保存
              </Button>
              <Button onClick={handleConnectThreads} disabled={!threadsAppId}>
                <Link2 className="w-4 h-4 mr-2" />
                Threadsアカウントを連携
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プロフィール設定 */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>
            あなたのビジネス情報を入力してください。投稿生成に使用されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="ジャンル"
            placeholder="例: ビジネス、マーケティング、ライフスタイル"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
          />
          <Textarea
            label="ターゲット層"
            placeholder="例: 20-30代の副業に興味のある会社員"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
          />
          <Textarea
            label="バックエンド商品"
            placeholder="例: オンライン講座、コンサルティング、電子書籍"
            value={formData.backendProduct}
            onChange={(e) =>
              setFormData({ ...formData, backendProduct: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* 口調設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>口調設定</CardTitle>
              <CardDescription>
                投稿の文体を細かく調整できます
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetTone}>
              <RefreshCw className="w-4 h-4 mr-1" />
              リセット
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="基本スタイル"
              options={baseStyleOptions}
              value={toneData.baseStyle}
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  baseStyle: e.target.value as ToneSettings["baseStyle"],
                })
              }
            />
            <Select
              label="語尾スタイル"
              options={sentenceEndingOptions}
              value={toneData.sentenceEnding}
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  sentenceEnding: e.target
                    .value as ToneSettings["sentenceEnding"],
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="一人称"
                options={firstPersonOptions}
                value={toneData.firstPerson}
                onChange={(e) =>
                  setToneData({
                    ...toneData,
                    firstPerson: e.target.value as ToneSettings["firstPerson"],
                  })
                }
              />
              {toneData.firstPerson === "custom" && (
                <Input
                  className="mt-2"
                  placeholder="カスタム一人称を入力"
                  value={toneData.customFirstPerson || ""}
                  onChange={(e) =>
                    setToneData({
                      ...toneData,
                      customFirstPerson: e.target.value,
                    })
                  }
                />
              )}
            </div>
            <div>
              <Select
                label="読者への呼びかけ"
                options={audienceAddressOptions}
                value={toneData.audienceAddress}
                onChange={(e) =>
                  setToneData({
                    ...toneData,
                    audienceAddress: e.target
                      .value as ToneSettings["audienceAddress"],
                  })
                }
              />
              {toneData.audienceAddress === "custom" && (
                <Input
                  className="mt-2"
                  placeholder="カスタム呼びかけを入力"
                  value={toneData.customAudienceAddress || ""}
                  onChange={(e) =>
                    setToneData({
                      ...toneData,
                      customAudienceAddress: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Slider
              label="敬語レベル"
              value={toneData.politenessLevel}
              min={0}
              max={100}
              minLabel="タメ口"
              maxLabel="敬語"
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  politenessLevel: Number(e.target.value),
                })
              }
            />
            <Slider
              label="絵文字使用量"
              value={toneData.emojiUsage}
              min={0}
              max={100}
              minLabel="なし"
              maxLabel="多め"
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  emojiUsage: Number(e.target.value),
                })
              }
            />
            <Slider
              label="改行頻度"
              value={toneData.lineBreakFrequency}
              min={0}
              max={100}
              minLabel="少なめ"
              maxLabel="多め"
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  lineBreakFrequency: Number(e.target.value),
                })
              }
            />
            <Slider
              label="文の長さ"
              value={toneData.sentenceLength}
              min={0}
              max={100}
              minLabel="短文"
              maxLabel="長文"
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  sentenceLength: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="よく使うフレーズ（1行に1つ）"
              placeholder="例:&#10;ぶっちゃけ&#10;マジで&#10;正直に言うと"
              value={toneData.customPhrases.join("\n")}
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  customPhrases: e.target.value
                    .split("\n")
                    .filter((p) => p.trim()),
                })
              }
            />
            <Textarea
              label="NGワード（1行に1つ）"
              placeholder="例:&#10;絶対&#10;必ず&#10;簡単"
              value={toneData.ngWords.join("\n")}
              onChange={(e) =>
                setToneData({
                  ...toneData,
                  ngWords: e.target.value.split("\n").filter((w) => w.trim()),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* プレビュー */}
      <Card>
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
          <CardDescription>現在の設定でのサンプル文</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">
              {generatePreviewText(toneData)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes("失敗")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>
        <Button onClick={handleSaveProfile} isLoading={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          保存する
        </Button>
      </div>
    </div>
  );
}

function generatePreviewText(tone: ToneSettings): string {
  const firstPerson =
    tone.firstPerson === "custom"
      ? tone.customFirstPerson || "私"
      : tone.firstPerson;
  const audience =
    tone.audienceAddress === "custom"
      ? tone.customAudienceAddress || "あなた"
      : tone.audienceAddress;

  let text = "";

  // 敬語レベルに応じた文体
  if (tone.politenessLevel < 30) {
    text = `${firstPerson}がマーケティングを学んだ結果、\n収入が3倍になったんだよね`;
  } else if (tone.politenessLevel < 70) {
    text = `${firstPerson}がマーケティングを学んだ結果、\n収入が3倍になりました`;
  } else {
    text = `${firstPerson}がマーケティングを学ばせていただいた結果、\n収入が3倍になりました`;
  }

  // 語尾スタイル
  switch (tone.sentenceEnding) {
    case "soft":
      text = text.replace(/ました$|んだよね$/, "ましたね");
      break;
    case "energetic":
      text = text.replace(/ました$|んだよね$/, "ました！");
      break;
    case "questioning":
      text += "\n\n" + audience + "も試してみませんか？";
      break;
    case "assertive":
      text = text.replace(/ました$|んだよね$/, "ました。これは事実です");
      break;
  }

  // 絵文字
  if (tone.emojiUsage > 50) {
    text = "✨ " + text + " 🚀";
  } else if (tone.emojiUsage > 20) {
    text = text + " ✨";
  }

  return text;
}
