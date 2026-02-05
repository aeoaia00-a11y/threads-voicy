import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface ScrapeResult {
  content: string;
  authorName?: string;
  authorUsername?: string;
  authorFollowers?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  postedAt?: string;
  profileUrl?: string;
  posts?: PostData[];
  error?: string;
}

interface PostData {
  content: string;
  likes?: number;
  comments?: number;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url, type = "auto" } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
    }

    // Threads URLの検証
    if (!url.includes("threads.net")) {
      return NextResponse.json(
        { error: "Threads URLを入力してください" },
        { status: 400 }
      );
    }

    // URLタイプを判定
    const urlType = detectUrlType(url);

    let result: ScrapeResult;

    if (urlType === "profile") {
      // プロフィールページの場合
      result = await scrapeThreadsProfile(url);
    } else {
      // 投稿ページの場合
      result = await scrapeThreadsPost(url);
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "スクレイピングに失敗しました" },
      { status: 500 }
    );
  }
}

function detectUrlType(url: string): "profile" | "post" {
  // /post/ が含まれていれば投稿、そうでなければプロフィール
  if (url.includes("/post/") || url.includes("/p/")) {
    return "post";
  }
  return "profile";
}

async function scrapeThreadsPost(url: string): Promise<ScrapeResult> {
  try {
    // User-Agentを設定してリクエスト
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      return { content: "", error: "ページの取得に失敗しました" };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // メタデータから情報を抽出
    const ogDescription = $('meta[property="og:description"]').attr("content");
    const ogTitle = $('meta[property="og:title"]').attr("content");

    // 投稿内容を取得
    let content = ogDescription || "";

    // 投稿者名を抽出（og:titleから）
    let authorName: string | undefined;
    if (ogTitle) {
      const match = ogTitle.match(/^(.+?)(?:\s*\(@|on Threads)/);
      if (match) {
        authorName = match[1].trim();
      }
    }

    // JSON-LDからより詳細な情報を取得試行
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (jsonText) {
          const data = JSON.parse(jsonText);
          if (data.articleBody) {
            content = data.articleBody;
          }
          if (data.author?.name) {
            authorName = data.author.name;
          }
          if (data.interactionStatistic) {
            // いいね数などを取得
          }
        }
      } catch (e) {
        // JSON解析エラーは無視
      }
    });

    // コンテンツが取得できなかった場合
    if (!content) {
      return {
        content: "",
        error: "投稿内容を取得できませんでした。URLを確認してください。",
      };
    }

    return {
      content,
      authorName,
      // 注意: Threadsでは公開ページからエンゲージメント数を直接取得するのは困難
      // 実際の運用では手動入力またはThreads APIの利用を推奨
      likes: undefined,
      comments: undefined,
      shares: undefined,
    };
  } catch (error) {
    console.error("Scrape error:", error);
    return { content: "", error: "スクレイピング中にエラーが発生しました" };
  }
}

async function scrapeThreadsProfile(url: string): Promise<ScrapeResult> {
  try {
    // URLからユーザー名を抽出
    const usernameMatch = url.match(/@([^/?]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;

    if (!username) {
      return { content: "", error: "ユーザー名を取得できませんでした" };
    }

    // User-Agentを設定してリクエスト
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      return { content: "", error: "プロフィールページの取得に失敗しました" };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // メタデータから情報を抽出
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogDescription = $('meta[property="og:description"]').attr("content");

    let authorName = ogTitle?.replace(/ \(@.+\).*$/, "").trim();
    let followers: number | undefined;

    // フォロワー数を抽出（説明文から）
    if (ogDescription) {
      const followersMatch = ogDescription.match(/([\d,.]+[KMB]?)\s*[Ff]ollowers/i);
      if (followersMatch) {
        followers = parseFollowerCount(followersMatch[1]);
      }
    }

    return {
      content: "",
      authorName,
      authorUsername: username,
      authorFollowers: followers,
      profileUrl: url,
      posts: [], // プロフィールからの投稿一覧は別途API経由で取得
    };
  } catch (error) {
    console.error("Profile scrape error:", error);
    return { content: "", error: "プロフィールの取得中にエラーが発生しました" };
  }
}

function parseFollowerCount(str: string): number {
  const cleaned = str.replace(/,/g, "");
  const num = parseFloat(cleaned);

  if (cleaned.toUpperCase().includes("K")) {
    return Math.round(num * 1000);
  }
  if (cleaned.toUpperCase().includes("M")) {
    return Math.round(num * 1000000);
  }
  if (cleaned.toUpperCase().includes("B")) {
    return Math.round(num * 1000000000);
  }

  return Math.round(num);
}
