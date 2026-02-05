import { ToneSettings, UserProfile, ResearchPost } from "@/types";

export function buildGenerationPrompt(
  profile: UserProfile,
  templateContent: string,
  referenceTexts: string[]
): string {
  const tone = profile.toneSettings;

  return `あなたはThreads投稿のプロフェッショナルなコピーライターです。
以下の条件に従って、バズりやすいThreads投稿を生成してください。

## ユーザー情報
- ジャンル: ${profile.genre}
- ターゲット層: ${profile.targetAudience}
- バックエンド商品: ${profile.backendProduct}

## 口調設定
${buildToneInstructions(tone)}

## テンプレート構造
${templateContent}

${
  referenceTexts.length > 0
    ? `## 参考投稿（これらの要素を参考にしてください）
${referenceTexts.map((t, i) => `参考${i + 1}:\n${t}`).join("\n\n")}`
    : ""
}

## 生成ルール
1. 1投稿は500文字以内
2. 読者の興味を引く冒頭にする
3. 改行を適切に使って読みやすくする
4. 指定された口調を厳守する
5. CTAは自然な形で入れる
6. ハッシュタグは最後に2-3個

投稿本文のみを出力してください（説明不要）：`;
}

export function buildToneInstructions(tone: ToneSettings): string {
  const instructions: string[] = [];

  // 基本スタイル
  const styleMap = {
    casual: "カジュアルで親しみやすい",
    professional: "プロフェッショナルで信頼感のある",
    friendly: "フレンドリーで温かみのある",
    educational: "教育的で分かりやすい",
    provocative: "挑発的で議論を呼ぶ",
  };
  instructions.push(`・基本トーン: ${styleMap[tone.baseStyle]}`);

  // 敬語レベル
  if (tone.politenessLevel < 30) {
    instructions.push("・敬語: タメ口（〜だよ、〜だね、〜じゃん）");
  } else if (tone.politenessLevel < 70) {
    instructions.push("・敬語: 丁寧語（〜です、〜ます）");
  } else {
    instructions.push("・敬語: 敬語（〜でございます、〜させていただきます）");
  }

  // 絵文字
  if (tone.emojiUsage < 20) {
    instructions.push("・絵文字: 使用しない");
  } else if (tone.emojiUsage < 50) {
    instructions.push("・絵文字: 控えめに（1-2個程度）");
  } else if (tone.emojiUsage < 80) {
    instructions.push("・絵文字: 適度に使用（3-5個程度）");
  } else {
    instructions.push("・絵文字: 多めに使用（5個以上）");
  }

  // 一人称
  const firstPerson =
    tone.firstPerson === "custom"
      ? tone.customFirstPerson || "私"
      : tone.firstPerson;
  instructions.push(`・一人称: 「${firstPerson}」を使用`);

  // 語尾スタイル
  const endingMap = {
    standard: "標準的な語尾",
    soft: "柔らかい語尾（〜ですね、〜かも）",
    energetic: "エネルギッシュな語尾（〜！、〜だ！）",
    questioning: "問いかけを多用（〜ですか？、〜と思いませんか？）",
    assertive: "断定的な語尾（〜です。〜である。）",
  };
  instructions.push(`・語尾: ${endingMap[tone.sentenceEnding]}`);

  // 改行
  if (tone.lineBreakFrequency < 30) {
    instructions.push("・改行: 少なめ（2-3文ごと）");
  } else if (tone.lineBreakFrequency < 70) {
    instructions.push("・改行: 普通（1-2文ごと）");
  } else {
    instructions.push("・改行: 多め（ほぼ毎文）");
  }

  // カスタムフレーズ
  if (tone.customPhrases.length > 0) {
    instructions.push(
      `・よく使うフレーズ: ${tone.customPhrases.join("、")}`
    );
  }

  // NGワード
  if (tone.ngWords.length > 0) {
    instructions.push(`・使用禁止ワード: ${tone.ngWords.join("、")}`);
  }

  return instructions.join("\n");
}

export function buildABTestPrompt(
  originalContent: string,
  variationType: "hook" | "cta" | "emoji" | "tone"
): string {
  const variations = {
    hook: "冒頭のフック文を別のアプローチに変更",
    cta: "CTAの表現を変更（より強い誘導 or ソフトな誘導）",
    emoji: "絵文字の使い方を変更（増やす or 減らす or 種類を変える）",
    tone: "全体のトーンを変更（よりカジュアル or よりプロフェッショナル）",
  };

  return `以下のThreads投稿のA/Bテスト用バリエーションを作成してください。

## 元の投稿
${originalContent}

## 変更点
${variations[variationType]}

## ルール
1. メッセージの本質は変えない
2. 文字数は元の投稿と同程度に
3. ${variationType}の部分のみを変更

バリエーション投稿のみを出力してください：`;
}

export function buildAnalysisPrompt(posts: ResearchPost[]): string {
  return `以下のThreads投稿を分析し、共通するパターンと成功要因を特定してください。

## 投稿データ
${posts
  .map(
    (p, i) => `
### 投稿${i + 1}
内容: ${p.content}
いいね: ${p.likes || "不明"}
コメント: ${p.comments || "不明"}
エンゲージメント率: ${p.engagementRate?.toFixed(2) || "不明"}%
`
  )
  .join("\n")}

## 分析観点
1. 共通するフック文のパターン
2. 構成・フォーマットの特徴
3. CTAの種類と効果
4. 絵文字・改行の使い方
5. エンゲージメントが高い投稿の特徴

JSON形式で出力してください：
{
  "patterns": ["パターン1", "パターン2", ...],
  "successFactors": ["要因1", "要因2", ...],
  "recommendations": ["推奨1", "推奨2", ...]
}`;
}
