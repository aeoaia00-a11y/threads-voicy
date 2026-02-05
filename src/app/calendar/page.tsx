"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { usePosts } from "@/hooks";

export default function CalendarPage() {
  const { posts, isLoaded, getScheduledPosts } = usePosts();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const scheduledPosts = getScheduledPosts();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 日曜始まりにするため、月初の曜日分の空白を追加
  const startDay = monthStart.getDay();
  const blanks = Array(startDay).fill(null);

  const getPostsForDay = (date: Date) => {
    return posts.filter((post) => {
      if (post.scheduledAt) {
        return isSameDay(new Date(post.scheduledAt), date);
      }
      if (post.postedAt) {
        return isSameDay(new Date(post.postedAt), date);
      }
      return false;
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
          <p className="mt-1 text-gray-500">投稿スケジュールを管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[150px] text-center">
            {format(currentMonth, "yyyy年 M月", { locale: ja })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 予約投稿サマリー */}
      {scheduledPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>予約中の投稿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduledPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-2 bg-gray-50 rounded"
                >
                  <Badge variant="warning">
                    {format(new Date(post.scheduledAt!), "M/d HH:mm", {
                      locale: ja,
                    })}
                  </Badge>
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {post.content}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* カレンダー */}
      <Card>
        <CardContent className="pt-6">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="h-24" />
            ))}
            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border rounded-lg p-1 ${
                    isToday ? "bg-blue-50 border-blue-300" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      day.getDay() === 0
                        ? "text-red-500"
                        : day.getDay() === 6
                        ? "text-blue-500"
                        : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          post.status === "posted"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {post.scheduledAt
                          ? format(new Date(post.scheduledAt), "HH:mm")
                          : "投稿済"}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{dayPosts.length - 2}件
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 凡例 */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-100 rounded" />
          <span className="text-gray-600">予約中</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span className="text-gray-600">投稿済み</span>
        </div>
      </div>
    </div>
  );
}
