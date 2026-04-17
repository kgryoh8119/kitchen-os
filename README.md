# 🍳 KitchenOS v2

料理をプロジェクト管理として扱う調理スケジューラ。

## セットアップ

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Vercelへのデプロイ（無料）

### 1. GitHubにリポジトリを作る

```bash
git init
git add .
git commit -m "initial commit"
# GitHubでリポジトリ作成後：
git remote add origin https://github.com/あなたのユーザー名/kitchen-os.git
git push -u origin main
```

### 2. Vercelと連携

1. [vercel.com](https://vercel.com) でサインアップ（GitHubアカウントで可）
2. "Add New Project" → GitHubリポジトリを選択
3. **Environment Variables** に以下を追加：
   - `ANTHROPIC_API_KEY` = `sk-ant-...`（[console.anthropic.com](https://console.anthropic.com) で発行）
4. "Deploy" → 数分でURLが発行される

### AI機能なしで動かす場合

`ANTHROPIC_API_KEY` を設定しなくてもアプリは動きます。
AI機能ボタンを押したときにエラーメッセージが表示されるだけです。

## ファイル構成

```
kitchen-os/
├── app/
│   ├── layout.tsx          # HTML wrapper
│   ├── page.tsx            # エントリーポイント
│   ├── KitchenOS.tsx       # メインアプリ（全UI）
│   └── api/
│       └── ai-recipe/
│           └── route.ts    # Anthropic APIプロキシ
├── .env.local              # APIキー（Gitに含めない）
├── package.json
└── next.config.js
```

## 機能

- ⚡ 提供時間からの逆算スケジューリング
- 📊 ガントチャート表示
- 🔴 リアルタイム調理モード（タイマー付き）
- ✨ AIレシピ自動生成（Proプラン）
- 🌐 URLからのレシピ取込（Proプラン）
- 🛒 買い物リスト自動生成
- 🔧 キッチン設備管理
