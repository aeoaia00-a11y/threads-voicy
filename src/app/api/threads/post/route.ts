import { NextRequest, NextResponse } from "next/server";

interface PostRequest {
  content: string;
  accessToken: string;
  userId: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
}

export async function POST(request: NextRequest) {
  try {
    const { content, accessToken, userId, mediaUrl, mediaType }: PostRequest =
      await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "投稿内容が必要です" },
        { status: 400 }
      );
    }

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: "Threads認証情報が必要です" },
        { status: 401 }
      );
    }

    // Step 1: メディアコンテナを作成
    const createParams: Record<string, string> = {
      media_type: mediaUrl ? (mediaType || "IMAGE") : "TEXT",
      text: content,
      access_token: accessToken,
    };

    if (mediaUrl) {
      createParams.image_url = mediaUrl;
    }

    const createResponse = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(createParams),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("Create container error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "投稿の作成に失敗しました" },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    const containerId = createData.id;

    // Step 2: メディアコンテナを公開
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error("Publish error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "投稿の公開に失敗しました" },
        { status: publishResponse.status }
      );
    }

    const publishData = await publishResponse.json();

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      message: "投稿が公開されました",
    });
  } catch (error) {
    console.error("Threads post error:", error);
    return NextResponse.json(
      { error: "投稿処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
