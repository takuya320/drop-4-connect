# CLAUDE.md — Drop 4 Connect

## プロジェクト概要

和風ビジュアルの四目並べ（Connect Four）。React 19 + TypeScript + MUI で実装。

## よく使うコマンド

```bash
pnpm install              # 依存関係のインストール
pnpm run start            # 開発サーバー起動（port 3000）
pnpm run build            # Webpack バンドル
pnpm run lint             # ESLint 実行
pnpm run typecheck        # TypeScript 型チェック
pnpm run check            # lint + typecheck
pnpm run test             # Vitest によるテスト実行
```

## コードの変更後に必ず実行すること

1. `pnpm run check` — lint と型チェックが通ること
2. `pnpm run test` — テストが通ること
3. `pnpm run build` — ビルドが成功すること

## アーキテクチャ

- `src/index.tsx` — エントリポイント
- `src/App.tsx` — メインコンポーネント（UI + 状態管理）
- `src/gameLogic.ts` — ゲームロジック（勝利判定、ボード操作等の純粋関数）
- `src/__tests__/` — テストファイル

## 技術スタック

- **React 19** + **TypeScript**（strict モード）
- **MUI** (@mui/material, @mui/system) + **Emotion** によるスタイリング
- **Webpack 5** によるバンドル
- **Vitest** + **React Testing Library** によるテスト
- **Vercel** にデプロイ

## コーディング規約

- 日本語で簡潔かつ丁寧に回答する（AGENTS.md 準拠）
- コンベンショナルコミット形式（feat:, fix:, docs:, test:, refactor:, chore:）
- コミットメッセージは英語で記述
- TypeScript strict モード — `@ts-ignore` や `any` の使用禁止
- エラーは握りつぶさず根本原因を修正する
- ゲームロジック（純粋関数）は `src/gameLogic.ts` に配置し、テストでカバーする
- スタイリングは MUI `styled()` + Emotion を使用
- 不要な依存関係を追加しない

## テスト方針

- ゲームロジック（checkWinner, createEmptyBoard 等）は必ずユニットテストでカバー
- テストは振る舞いをテストし、実装詳細に依存しない
- テスト間の依存を避け、任意の順序で実行可能にする
