import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // エラーがある場合
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  // 認証コードがない場合
  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?error=認証コードが取得できませんでした", request.url)
    );
  }

  try {
    // アクセストークンを取得
    const tokenResponse = await fetch(
      "https://graph.threads.net/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.THREADS_APP_ID || "",
          client_secret: process.env.THREADS_APP_SECRET || "",
          grant_type: "authorization_code",
          redirect_uri: process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI || "",
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL(
          `/settings?error=${encodeURIComponent(errorData.error_message || "トークン取得に失敗しました")}`,
          request.url
        )
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // 長期アクセストークンに交換
    const longLivedResponse = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${access_token}`,
      { method: "GET" }
    );

    let finalToken = access_token;
    let expiresIn = 3600; // デフォルト1時間

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      finalToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in || 5184000; // 60日
    }

    // ユーザー情報を取得
    const userResponse = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${finalToken}`
    );

    let username = "";
    if (userResponse.ok) {
      const userData = await userResponse.json();
      username = userData.username || "";
    }

    // トークン情報をクライアントに渡す（URLパラメータ経由）
    // 注意: 本番環境ではより安全な方法（暗号化Cookie等）を推奨
    const authData = {
      accessToken: finalToken,
      userId: user_id,
      username,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };

    const encodedAuth = encodeURIComponent(JSON.stringify(authData));

    return NextResponse.redirect(
      new URL(`/settings?threads_auth=${encodedAuth}`, request.url)
    );
  } catch (error) {
    console.error("Threads OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=認証処理中にエラーが発生しました", request.url)
    );
  }
}
