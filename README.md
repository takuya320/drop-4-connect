# Drop 4 Connect

和風ビジュアルの四目並べ（Connect Four）を React + TypeScript で実装したプロジェクトです。

## 概要

- 6x7 の盤面で赤と黄が交互に玉を落とし、先に 4 つ並べた側が勝利
- 斜め・縦・横の勝利判定に対応
- 勝利時・引き分け時のステータス表示とリセット機能

## セットアップ

```bash
pnpm install
```

## 開発サーバー起動

```bash
pnpm run start
```

## ビルド

```bash
pnpm run build
```

## 静的解析・型チェック

```bash
pnpm run lint
pnpm run typecheck
pnpm run check
```

## 主な技術

- React 19
- TypeScript
- MUI (@mui/material, @mui/system)
- Emotion (@emotion/react, @emotion/styled)
- Webpack 5

## 主要ディレクトリ

- `src/` React アプリ本体
- `dist/` ビルド成果物

