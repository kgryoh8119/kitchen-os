import { NextResponse } from 'next/server'

export async function POST(req) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 })
  }

  // Fetch the recipe page server-side (avoids CORS)
  let html
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `URLの取得に失敗しました (${res.status})` }, { status: 422 })
    }
    html = await res.text()
  } catch (e) {
    return NextResponse.json({ error: `URLアクセスエラー: ${e.message}` }, { status: 422 })
  }

  // Strip tags and scripts, keep text
  const pageText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 9000)

  const prompt = `以下はレシピページのテキストです。このテキストからレシピ情報を抽出してJSON形式で返してください。

テキスト:
${pageText}

JSONフォーマット:
{
  "name": "料理名",
  "category": "メイン|前菜|スープ|デザート",
  "ingredients": [{"name": "食材名", "amount": "分量"}],
  "steps": [
    {
      "id": 1,
      "description": "工程の説明（簡潔に）",
      "duration_min": 5,
      "requires_equipment": [],
      "hands_on": true,
      "depends_on": [],
      "ingredients": [{"name": "食材名", "amount": "分量"}],
      "note": "コツ（なければ空文字）"
    }
  ]
}

ルール:
- requires_equipment は "stove"(コンロ) "oven"(オーブン) "microwave"(電子レンジ) "mixer"(ミキサー) のみ
- hands_on: true=手が離せない false=放置可能
- depends_on: 前工程のid配列（例: [1,2]）
- duration_min: 各工程の所要時間（分）を整数で推定
- JSONのみ返してください。説明・コードブロック不要。`

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!aiRes.ok) {
    const err = await aiRes.text()
    return NextResponse.json({ error: err }, { status: aiRes.status })
  }

  const data = await aiRes.json()
  const text = data.content?.map(b => b.text || '').join('') || ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const recipe = JSON.parse(clean)
    return NextResponse.json({ recipe })
  } catch {
    return NextResponse.json({ error: 'AIの出力をパースできませんでした', raw: text }, { status: 422 })
  }
}
