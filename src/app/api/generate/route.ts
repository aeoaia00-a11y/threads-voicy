import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { UserProfile } from "@/types";
import { buildGenerationPrompt } from "@/lib/prompts";

interface GenerateRequest {
  profile: UserProfile;
  templateContent: string;
  referenceTexts?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI APIキーが設定されていません。設定ページでAPIキーを設定してください。" },
        { status: 500 }
      );
    }

    // OpenAIクライアントをリクエスト時に初期化
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { profile, templateContent, referenceTexts = [] }: GenerateRequest =
      await request.json();

    if (!profile) {
      return NextResponse.json(
        { error: "プロフィール情報が必要です" },
        { status: 400 }
      );
    }

    if (!templateContent) {
      return NextResponse.json(
        { error: "テンプレートが必要です" },
        { status: 400 }
      );
    }

    const prompt = buildGenerationPrompt(profile, templateContent, referenceTexts);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "あなたはSNSマーケティングの専門家です。バズるThreads投稿を作成してください。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      return NextResponse.json(
        { error: "投稿の生成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: generatedContent,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Generate error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API エラー: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "投稿の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
