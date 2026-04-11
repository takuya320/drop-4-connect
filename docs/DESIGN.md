# Drop 4 Connect — デザイン設計ドキュメント

## 1. プロジェクト概要

**Drop 4 Connect（玉落とし四目並べ）** は、React + TypeScript で実装された和風ビジュアルの Connect Four ゲームです。

| 項目 | 内容 |
|------|------|
| ボードサイズ | 6 行 × 7 列（標準 Connect Four） |
| プレイヤー | 赤（Red） vs 黄（Yellow） |
| 勝利条件 | 縦・横・斜めに 4 つ並べる |
| 引き分け | 盤面がすべて埋まった場合（42 手） |

---

## 2. 技術スタック

### コア

| ライブラリ | バージョン | 役割 |
|-----------|-----------|------|
| React | 19.2.5 | UI フレームワーク |
| TypeScript | 6.0.2 | 型安全な開発（strict モード） |

### UI・スタイリング

| ライブラリ | 役割 |
|-----------|------|
| @mui/material | UI コンポーネント（Button, Container, Typography） |
| @mui/system | `styled()` API、`keyframes` |
| @emotion/react, @emotion/styled | CSS-in-JS ランタイム |
| Google Fonts | Shippori Mincho B1（明朝体）、Zen Kaku Gothic New（ゴシック体） |

### ビルド・ツールチェーン

| ツール | 役割 |
|--------|------|
| Webpack 5 | モジュールバンドラー |
| ts-loader | TypeScript のトランスパイル |
| webpack-dev-server | 開発サーバー（port 3000, HMR 対応） |
| ESLint 10 + typescript-eslint | リンター |

### デプロイ

| 項目 | 設定 |
|------|------|
| プラットフォーム | Vercel |
| 出力先 | `dist/` |
| ルーティング | SPA リライト（`/(.*) → /index.html`） |
| Node.js | 20（`.nvmrc`） |

---

## 3. ディレクトリ構成

```
drop-4-connect/
├── src/
│   ├── index.tsx          # エントリポイント（React ルートのレンダリング）
│   ├── App.tsx            # メインコンポーネント（UI + 状態管理）
│   ├── gameLogic.ts       # ゲームロジック（勝利判定、ボード操作等の純粋関数）
│   ├── test-setup.ts      # テストのセットアップ
│   └── __tests__/         # テストファイル
├── dist/                  # ビルド成果物
│   ├── bundle.js
│   └── index.html
├── index.html             # ソース HTML（Google Fonts 読み込み）
├── webpack.config.js      # Webpack 設定
├── tsconfig.json          # TypeScript 設定
├── eslint.config.mjs      # ESLint 設定（Flat Config）
├── vercel.json            # Vercel デプロイ設定
└── package.json
```

**特徴**: ゲームロジック（純粋関数）は `gameLogic.ts` に分離し、テスタビリティを確保。UI・状態管理は `App.tsx` に集約。

---

## 4. コンポーネント設計

### コンポーネントツリー

```
App
├── GlobalStyles
├── Page                         # ルートコンテナ（背景・グラデーション）
└── StyledContainer              # メインレイアウト
    ├── Header
    │   ├── Title                # タイトル（シマーアニメーション付き）
    │   └── Subtitle
    ├── StatusRow
    │   ├── Pill                 # 現在のプレイヤー表示（パルスアニメーション付き）
    │   └── Pill                 # 手数カウンター
    ├── WinBanner                # 勝利 / 引き分け表示（条件付きレンダリング）
    └── GameCard                 # ゲーム盤を包むカード
        ├── FloatingKanji        # 装飾用の浮遊する漢字（勝・連）
        ├── BoardShell
        │   └── BoardContainer   # CSS Grid レイアウト
        │       ├── ColumnButtons (memo)  # 列選択ボタン × 7
        │       └── BoardGrid (memo)      # セル × 42
        │           └── Cell → Disc       # 各マスと玉
        ├── DecoLine             # 装飾用のグラデーション線
        └── FooterRow
            ├── Legend           # プレイヤー色の凡例
            └── ResetButton     # リセットボタン（もう一局）
```

### コンポーネントの分類

| 種類 | コンポーネント | 説明 |
|------|--------------|------|
| メイン | `App` | 全状態管理とゲームロジックを担当 |
| メモ化 | `BoardGrid`, `ColumnButtons` | `React.memo` でラップし不要な再レンダリングを防止 |
| スタイル | `Page`, `Cell`, `Disc`, `Pill` 他 20+ | MUI `styled()` で定義されたプレゼンテーションコンポーネント |

---

## 5. 状態管理

### 方針: ローカルステート + Hooks

外部ライブラリ（Redux, Zustand 等）は使用せず、`useState` + `useMemo` + `useCallback` のみで管理。

### 状態の構造

```typescript
type Player = 'red' | 'yellow' | null;

// 主要状態
const [board, setBoard] = useState<Player[][]>(/* 6×7 の null 配列 */);
const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
const [winner, setWinner] = useState<Player>(null);

// 派生状態（useMemo）
const isDraw: boolean       // 引き分け判定（盤面が満杯かつ勝者なし）
const isColumnFull: boolean[] // 各列が満杯か
const moveCount: number     // 現在の手数
```

### 状態更新フロー

```
ユーザーが列をクリック
  → handleClick(col)
    → 最下段の空きセルを検索
    → board を不変更新（map で新配列を生成）
    → checkWinner() で勝利判定
    → 勝者あり → setWinner(player)
    → 勝者なし → setCurrentPlayer(opponent)
  → React が再レンダリング
```

**不変更新**: `board.map()` で新しい 2D 配列を生成し、直接的なミューテーションを回避。

---

## 6. ゲームロジック

### 勝利判定アルゴリズム（`checkWinner`）

玉を置いた位置 `(row, col)` を起点に、4 方向を走査:

| 方向 | 走査範囲 |
|------|---------|
| 横（→） | `col-3` ~ `col+3` |
| 縦（↓） | `row-3` ~ `row+3` |
| 斜め（↘） | `(row-3, col-3)` ~ `(row+3, col+3)` |
| 斜め（↙） | `(row-3, col+3)` ~ `(row+3, col-3)` |

各方向で連続する同色の玉をカウントし、4 に達したら勝利。

### 引き分け判定

```typescript
const isDraw = useMemo(() => {
  if (winner) return false;
  return board[0].every((cell) => cell !== null); // 最上段がすべて埋まっている = 盤面満杯
}, [board, winner]);
```

### リセット

`resetGame()` で 6×7 の null 配列を再生成し、`currentPlayer` を `'red'`、`winner` を `null` に初期化。

---

## 7. スタイリング設計

### アプローチ: CSS-in-JS（Emotion + MUI System）

すべてのスタイルは `@mui/system` の `styled()` と `keyframes` で定義。外部 CSS ファイルは使用していない。

### カラーパレット

| 用途 | カラー |
|------|--------|
| 背景 | `#0a0e1a`（ダークネイビー）+ ラジアルグラデーション |
| タイトル・アクセント | ゴールド系グラデーション（`#f5e6c8` → `#d4a853`） |
| 赤プレイヤー | `#dc3c28` + ハイライト |
| 黄プレイヤー | `#f0b428` + ハイライト |
| テキスト | `#c5cde0`（メイン）、`#8891a8`（サブ） |

### ビジュアルエフェクト

| エフェクト | 適用箇所 |
|-----------|---------|
| Glassmorphism（すりガラス） | `GameCard`（`backdropFilter: blur(12px)`） |
| ドロップインアニメーション | `Disc`（玉が落ちるアニメーション） |
| シマーアニメーション | `Title`（タイトルの光る効果） |
| パルスアニメーション | `TurnIndicator`（手番インジケーターの点滅） |
| 浮遊アニメーション | `FloatingKanji`（装飾漢字の浮遊） |
| フェードスライドイン | `StyledContainer`（初回表示時のアニメーション） |

### キーフレーム定義（6 種類）

```
dropIn       — 玉のドロップアニメーション（0.35s）
shimmer      — タイトルのシマー効果
pulse        — 手番インジケーターのパルス
floatUp      — 装飾漢字の浮遊
fadeSlideIn  — コンテナの初回表示
winGlow      — 勝利時の輝き
```

### 和風デザイン要素

- **フォント**: Shippori Mincho B1（明朝体）を見出しに、Zen Kaku Gothic New（ゴシック体）を本文に使用
- **装飾漢字**: 「勝」「連」が半透明で浮遊する装飾
- **配色**: ダーク基調にゴールドのアクセント — 和の重厚感を演出
- **ノイズテクスチャ**: 背景に SVG ノイズパターンを重ねて質感を追加

---

## 8. パフォーマンス最適化

| 手法 | 対象 | 効果 |
|------|------|------|
| `React.memo` | `BoardGrid`, `ColumnButtons` | props 変更時のみ再レンダリング |
| `useMemo` | `columns`, `isDraw`, `isColumnFull`, `moveCount` | 派生値の再計算を抑制 |
| `useCallback` | `handleClick`, `resetGame` | 関数参照の安定化（子コンポーネントの不要な再レンダリング防止） |
| 不変更新 | `board` の状態更新 | React の差分検出を効率化 |

---

## 9. ビルド・デプロイ

### npm スクリプト

| コマンド | 内容 |
|---------|------|
| `pnpm run start` | 開発サーバー起動（port 3000, HMR） |
| `pnpm run build` | Webpack バンドル |
| `pnpm run lint` | ESLint 実行 |
| `pnpm run typecheck` | TypeScript 型チェック |
| `pnpm run check` | lint + typecheck |

### Webpack 設定

- **エントリ**: `./src/index.tsx`
- **出力**: `dist/bundle.js`
- **モード**: development（現状、本番用のミニファイ設定なし）
- **ローダー**: `ts-loader`（`.tsx`, `.ts`）
- **DevServer**: HMR 有効、ポート 3000

### Vercel デプロイ

- 出力ディレクトリ: `dist/`
- ビルドコマンド: `pnpm run build`
- SPA リライト: すべてのパスを `index.html` にリダイレクト

---

## 10. コード品質

### 静的解析

- **TypeScript**: `strict: true`（厳密な型チェック）
- **ESLint**: Flat Config 形式、React Hooks ルール有効
  - `react-hooks/rules-of-hooks`: error
  - `react-hooks/exhaustive-deps`: warn

### テスト

- **Vitest** + **React Testing Library** を導入済み
- ゲームロジック（`checkWinner`, `createEmptyBoard` 等）はユニットテストでカバー
- テストは振る舞いをテストし、実装詳細に依存しない

### CI チェック

- `pnpm run check`（lint + typecheck）
- `pnpm run test`（Vitest によるテスト実行）
- `pnpm run build`（ビルド成功確認）

---

## 11. 設計上の特徴と課題

### 強み

- **シンプルな構成** — ソースファイル 2 つのみ。理解しやすい
- **型安全** — TypeScript strict モードで堅牢な型チェック
- **パフォーマンス** — memo / useMemo / useCallback による最適化
- **洗練された UI** — 和風デザインとアニメーションの統合
- **即デプロイ可能** — Vercel 設定済み

### 改善の余地

- **本番ビルド最適化** — 現在 development モード（約 2MB）。production モードへの切り替えでバンドルサイズ削減可能
- **アクセシビリティ** — ボタンに `aria-label` はあるが、スクリーンリーダー対応やキーボード操作の強化余地あり
- **未使用依存** — `tailwindcss` がインストール済みだが未使用
