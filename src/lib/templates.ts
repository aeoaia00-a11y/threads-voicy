import { PostTemplate } from "@/types";

export const DEFAULT_TEMPLATES: PostTemplate[] = [
  {
    id: "hook-1",
    name: "衝撃フック型",
    pattern: "hook",
    structure: `【衝撃の事実】から始める

{{フック文（驚きや興味を引く一文）}}

{{本文（3-5行）}}

{{CTA（行動を促す）}}`,
    example: `99%の人が知らない事実。

副業で月10万円稼ぐ人の特徴は
「スキルがある」じゃなくて
「行動が早い」なんです。

まずは小さな一歩から。
気になる方はプロフィールへ`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "story-1",
    name: "ストーリー型",
    pattern: "story",
    structure: `個人的な体験談を共有

{{導入（過去の状況）}}

{{転機（何が変わったか）}}

{{結果（今の状況）}}

{{学び・メッセージ}}`,
    example: `3年前、会社員として働きながら
毎日モヤモヤしてました。

でも、ある日「自分の強み」に
気づいてから人生が変わった。

今では好きなことで収入を得て
毎日ワクワクしてます。

自分を信じることが第一歩だった。`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "list-1",
    name: "リスト型（〇選）",
    pattern: "list",
    structure: `数字を使ったリスト形式

{{タイトル（〇〇な人の特徴3選など）}}

①{{項目1}}
②{{項目2}}
③{{項目3}}

{{まとめ・CTA}}`,
    example: `成功する人の朝習慣3選

①起きてすぐスマホを見ない
②朝一番に最重要タスクに取り組む
③前日に翌日の予定を決めている

1つでもできてないなら
明日から試してみて`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "question-1",
    name: "問いかけ型",
    pattern: "question",
    structure: `質問から始めて興味を引く

{{問いかけ（読者に考えさせる質問）}}

{{回答・解説}}

{{深堀り・追加情報}}

{{CTA}}`,
    example: `あなたは「努力」と「継続」
どっちが大事だと思いますか？

正解は「継続」なんです。

努力は燃え尽きるけど
継続は習慣になるから。

毎日1%の成長を続けよう`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "empathy-1",
    name: "共感型",
    pattern: "empathy",
    structure: `読者の悩みに共感

{{共感（あるある・悩みの共有）}}

{{原因・理由}}

{{解決策・アドバイス}}

{{励まし・CTA}}`,
    example: `「何をやっても続かない…」
そう思ったことありませんか？

それ、意志力の問題じゃなくて
「仕組み」の問題かもしれません。

続けるコツは
・ハードルを極限まで下げる
・環境を整える

自分を責めないで、仕組みを変えよう`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "results-1",
    name: "実績型",
    pattern: "results",
    structure: `具体的な数字・結果を強調

{{実績（具体的な数字）}}

{{どうやって達成したか}}

{{ポイント・コツ}}

{{CTA}}`,
    example: `フォロワー0から3ヶ月で1万人達成。

やったことは3つだけ。

・毎日投稿を続けた
・伸びてる人を徹底的に分析
・自分らしさを大切にした

再現性のある方法、
プロフィールで詳しく解説中`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "contrast-1",
    name: "対比型（ビフォーアフター）",
    pattern: "contrast",
    structure: `変化を対比して見せる

{{ビフォー（過去の状態）}}

↓

{{アフター（現在の状態）}}

{{何が違いを生んだか}}

{{メッセージ}}`,
    example: `【1年前の私】
・毎日残業で帰宅は23時
・休日は寝て終わる
・将来が不安で仕方ない

↓

【今の私】
・好きな時間に働く
・家族との時間が増えた
・毎日ワクワクしてる

変われた理由は
「最初の一歩」を踏み出したから。`,
    basedOnPostIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getTemplateById(id: string): PostTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByPattern(pattern: string): PostTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => t.pattern === pattern);
}
