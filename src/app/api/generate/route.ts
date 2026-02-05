import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, AIProvider, AI_PROVIDER_INFO } from "@/types";
import { buildGenerationPrompt } from "@/lib/prompts";

interface GenerateRequest {
  profile: UserProfile;
  templateContent: string;
  referenceTexts?: string[];
  provider?: AIProvider;
  apiKey?: string;
  model?: string;
}

async function generateWithOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

async function generateWithAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}

async function generateWithGoogle(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await generativeModel.generateContent(userPrompt);
  return result.response.text().trim();
}

export async function POST(request: NextRequest) {
  try {
    const {
      profile,
      templateContent,
      referenceTexts = [],
      provider = "openai",
      apiKey,
      model,
    }: GenerateRequest = await request.json();

    // APIキーの確認（リクエストから、または環境変数から）
    const effectiveApiKey = apiKey || getEnvApiKey(provider);

    if (!effectiveApiKey) {
      const providerName = AI_PROVIDER_INFO[provider]?.name || provider;
      return NextResponse.json(
        { error: `${providerName}のAPIキーが設定されていません。設定ページでAPIキーを設定してください。` },
        { status: 500 }
      );
    }

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

    const effectiveModel = model || AI_PROVIDER_INFO[provider]?.defaultModel;
    const systemPrompt = "あなたはSNSマーケティングの専門家です。バズるThreads投稿を作成してください。";
    const userPrompt = buildGenerationPrompt(profile, templateContent, referenceTexts);

    let generatedContent: string;

    switch (provider) {
      case "openai":
        generatedContent = await generateWithOpenAI(effectiveApiKey, effectiveModel, systemPrompt, userPrompt);
        break;
      case "anthropic":
        generatedContent = await generateWithAnthropic(effectiveApiKey, effectiveModel, systemPrompt, userPrompt);
        break;
      case "google":
        generatedContent = await generateWithGoogle(effectiveApiKey, effectiveModel, systemPrompt, userPrompt);
        break;
      default:
        return NextResponse.json(
          { error: `未対応のプロバイダー: ${provider}` },
          { status: 400 }
        );
    }

    if (!generatedContent) {
      return NextResponse.json(
        { error: "投稿の生成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: generatedContent,
      provider,
      model: effectiveModel,
    });
  } catch (error) {
    console.error("Generate error:", error);

    // プロバイダー固有のエラーハンドリング
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API エラー: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API エラー: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    // Google AI エラー
    if (error instanceof Error && error.message.includes("GoogleGenerativeAI")) {
      return NextResponse.json(
        { error: `Google AI エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "投稿の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function getEnvApiKey(provider: AIProvider): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "google":
      return process.env.GOOGLE_AI_API_KEY;
    default:
      return undefined;
  }
}
