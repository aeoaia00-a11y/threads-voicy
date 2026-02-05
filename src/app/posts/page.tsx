"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Edit2,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Textarea,
} from "@/components/ui";
import { usePosts } from "@/hooks";
import { GeneratedPost } from "@/types";

type FilterStatus = "all" | "draft" | "scheduled" | "posted";

const statusConfig = {
  draft: { label: "下書き", variant: "default" as const, icon: FileText },
  saved: { label: "保存済み", variant: "default" as const, icon: FileText },
  scheduled: { label: "予約中", variant: "warning" as const, icon: Clock },
  posted: { label: "投稿済み", variant: "success" as const, icon: CheckCircle },
  failed: { label: "失敗", variant: "error" as const, icon: AlertCircle },
};

export default function PostsPage() {
  const {
    posts,
    isLoaded,
    updatePost,
    deletePost,
    getDraftPosts,
    getScheduledPosts,
    getPostedPosts,
  } = usePosts();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // フィルター適用
  let filteredPosts: GeneratedPost[] = [];
  switch (filterStatus) {
    case "draft":
      filteredPosts = getDraftPosts();
      break;
    case "scheduled":
      filteredPosts = getScheduledPosts();
      break;
    case "posted":
      filteredPosts = getPostedPosts();
      break;
    default:
      filteredPosts = [...posts].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (post: GeneratedPost) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = (id: string) => {
    updatePost(id, { content: editContent });
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (id: string) => {
    if (confirm("この投稿を削除しますか？")) {
      deletePost(id);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const draftCount = getDraftPosts().length;
  const scheduledCount = getScheduledPosts().length;
  const postedCount = getPostedPosts().length;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投稿管理</h1>
          <p className="mt-1 text-gray-500">
            生成した投稿の管理・編集・投稿
          </p>
        </div>
        <Link href="/generate">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          <Filter className="w-4 h-4 mr-1" />
          すべて ({posts.length})
        </Button>
        <Button
          variant={filterStatus === "draft" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("draft")}
        >
          <FileText className="w-4 h-4 mr-1" />
          下書き ({draftCount})
        </Button>
        <Button
          variant={filterStatus === "scheduled" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("scheduled")}
        >
          <Clock className="w-4 h-4 mr-1" />
          予約中 ({scheduledCount})
        </Button>
        <Button
          variant={filterStatus === "posted" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("posted")}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          投稿済み ({postedCount})
        </Button>
      </div>

      {/* 投稿一覧 */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {posts.length === 0
                ? "まだ投稿がありません"
                : "該当する投稿がありません"}
            </h3>
            <p className="text-gray-500 mt-2">
              {posts.length === 0
                ? "投稿生成ページで最初の投稿を作成しましょう"
                : "フィルターを変更してみてください"}
            </p>
            {posts.length === 0 && (
              <Link href="/generate" className="mt-4 inline-block">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  投稿を作成
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const status = statusConfig[post.status];
            const StatusIcon = status.icon;
            const isEditing = editingId === post.id;

            return (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  {/* ステータスと日時 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {post.type === "ai" ? "AI生成" : "テンプレート"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {format(
                        new Date(post.updatedAt),
                        "yyyy/MM/dd HH:mm",
                        { locale: ja }
                      )}
                    </span>
                  </div>

                  {/* コンテンツ */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[150px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(post.id)}
                        >
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {/* 予約日時 */}
                  {post.scheduledAt && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <Clock className="w-4 h-4 inline mr-1" />
                        予約投稿:{" "}
                        {format(
                          new Date(post.scheduledAt),
                          "yyyy/MM/dd HH:mm",
                          { locale: ja }
                        )}
                      </p>
                    </div>
                  )}

                  {/* パフォーマンス */}
                  {post.performance && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex gap-4 text-sm">
                        <span>❤️ {post.performance.likes}</span>
                        <span>💬 {post.performance.comments}</span>
                        <span>🔄 {post.performance.shares}</span>
                        <span className="text-green-700 font-medium">
                          ER: {post.performance.engagementRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* アクション */}
                  {!isEditing && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-400">
                        {post.content.length} 文字
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(post.id, post.content)}
                        >
                          {copiedId === post.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              コピー済み
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              コピー
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          編集
                        </Button>
                        {post.status !== "posted" && (
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            投稿する
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
