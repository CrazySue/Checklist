# チェックリスト開発ガイド

> [!TIP]
> 本ドキュメントは開発者向けの技術ドキュメントです：アーキテクチャ、ビルドパイプライン、テスト、落とし穴の記録。  
> プロジェクトの紹介、特徴、ダウンロード方法については [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-ja.md) を参照してください。  

> 現在のバージョン：`Release v1.0.0` ｜ リポジトリ：https://github.com/CrazySue/Checklist

---

## 🏗️ アーキテクチャ概要

### 🧱 単一ファイル構成

アプリは**1 つの HTML ファイル**（約 40 MB）で、内部は上から下へ 4 つのレイヤーに分かれています：

| 領域 | 内容 |
| --- | --- |
| `<head>` 内の `<style id="embedded-fonts">` | `@font-face` 3 つ（HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded）、base64 で内蔵、`font-display:swap` |
| `<head>` 内のメイン `<style>` | すべての CSS：デザイントークン → コンポーネントスタイル → アニメーション → レスポンシブ（`html.landscape` による横画面左バーを含む） |
| `<body>` | アプリの骨格：トップバー / 検索バー / 絶対配置で重ねた 3 つのページコンテナ / ボトムバー + モーダル（アイコン選択、言語選択、Toast） |
| `<script>` | すべての JavaScript（約 3800 行）：状態 → ユーティリティ → i18n → テーマ/レイアウト → レンダリング → フォーム → データ交換 → 設定 → 起動 |

### 🔀 データフロー

**「状態の一元管理 + レンダリング関数 + DOM 直接操作アニメーション」** のハイブリッドモデル：

```text
ユーザー操作
   │
   ├── データ変更 ──→ Store.save()（localStorage に永続化）
   │                   └──→ renderXxx() を明示的に呼び出して該当領域を再レンダリング
   │
   └── 純粋な視覚的変更（チェック、ページ送り、リップル）──→ DOM / インラインスタイルを直接操作（再レンダリングなし）
```

> [!WARNING]
> アニメーションを伴う状態変化は必ず**DOM を直接操作**し、全体の再レンダリングを発生させないでください。

### 🗂️ 状態モデル

`localStorage` のキー `checklist_app_state_v1` に永続化されます：

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | アイコン名
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // カスタム高さを先頭項目のみに適用
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

一時状態（永続化されない）はモジュールレベルの変数として保持されます：`currentPage`、`formMode`（`'new'|'edit'`）、`formState`、`settingsFromPage`、`titleFlipDir`、`titleAnimToken`、`switchAnimToken`、`currentHomeView` など。

---

## 📂 リポジトリ構成（GitHub）

```text
.
├── .github/              行動規範と Issue テンプレート
├── docs/                 ドキュメント
├── build/                パッチパイプライン、キーワードマスタデータ、テストスイート
├── README.md             README ファイル
└── LICENSE.txt           ライセンス
```

---

## 🚀 環境とテストの始め方

### 📦 環境要件

- アプリの実行：任意のモダンブラウザ / HBuilderX でパッケージングした APK；
- ビルドとテスト：Node.js ≥ 16（Node 24 で検証済み）；`build/node_modules` に jsdom の依存関係が同梱されています。

### 🧪 テストを実行する

```bash
node build/_extract099.js && node --check build/_check099.js   # 構文チェック
node build/_sim099.js                                          # ユーザー行動シミュレーション（73 件のアサーション）
node build/_smoke099.js && node build/_smoke099b.js            # リグレッションテスト
```

すべての出力が `ALL PASS` となり、`uncaught errors: 0` であることをもって合格とします。

---

## 🛠️ ビルドパイプラインと開発ワークフロー

### 🔁 バージョンパッチパイプライン

バージョンアップ = 前バージョンの HTML に Node のパッチスクリプトを適用することです。各スクリプト内の `apply(old, new, count)` はマッチ回数を検証し、1 つでもマッチしない場合は書き込みを中止します。

| スクリプト | 用途 |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ コードを正しく変更するには

1. 対象バージョンの HTML を直接編集する（単一ファイルなので、そのまま見たとおりに編集できる）；
2. 変更を対応する `upgrade_vXXX.js` に**同期させる**（旧バージョンからワンクリックで再構築できるようにするため）；
3. 構文チェック + シミュレーション/リグレッションがすべてグリーンになったらコミットする。

### 🎛️ アイコンとキーワードの追加・削除

- アイコンライブラリ：`ICON_LIBRARY`（カテゴリキー `daily / travel / shopping / sports / leisure / food / health / work / other`）；
- アイコンの追加：カテゴリ配列にアイコン名を追加 → `build/keywords_v09.js` に `[icon, {言語: 'キーワード|キーワード'}]` を追加 → `AUTO_ICON_KEYWORDS` ブロックを再構築；
- アイコンの削除：ライブラリとキーワードデータを同時に削除した後に再構築（`remove_icons_v099.js` を参照）；
- 検証：各言語のキーワードが ≥ 200 であること；アイコン名は内蔵フォントと `ICON_LIBRARY` の両方に存在している必要がある。

### 🌍 言語を追加する

`I18N` に辞書を追加（キー集合は他の言語と同一）→ `LANGUAGES` に登録 → キーワードライブラリを ≥ 200 語に補充 → `getLang()`（auto → 完全一致 → プレフィックス一致 → zh-CN にフォールバック）。

---

## 🧩 コード構造の詳細

### 🎨 デザイントークンと CSS レイヤリング

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* ブランド4色 */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* MD3 派生カラーパレット */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* モーショントークン */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS レイヤリング：リセット → フォント → トークン → モーション → 骨格 → トップバー → ページコンテナ → リスト項目 → ボトムバー → ボタン/FAB → フォーム → 検索 → 設定 → モーダル/Toast → レスポンシブ。ダークテーマは `[data-theme="dark"]` による変数の上書きで実装されます；すべての色変化は `*{transition-property:…;transition-duration:.25s}` で滑らかに遷移します。

### ⚙️ JS モジュールマップ

| ブロック | 主要な関数 |
| --- | --- |
| 状態 | `Store`（load/save/set） |
| ユーティリティ | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| アイコンマッチング | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| テーマ/レイアウト | `applyTheme` `updateLayout` |
| トップバー | `renderTopbar` `setTopbarTitle` |
| ホーム | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| ボトムバー/ページ送り | `renderBottombar` `switchChecklist` `switchPage` |
| フォーム | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| データ交換 | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| 設定 | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| モーダル | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| ナビゲーション | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| アニメーションユーティリティ | `swapIcon` `popIcon` `smoothCenter` |
| 起動 | `bindEvents` `updateStaticLabels` `init` |

### ✨ アニメーションシステム

- **割り込みトークンパターン**：割り込み可能なすべてのアニメーション（ページ送り、タイトル、スクロール、アイコン交換）は増分トークンを保持し、タイマーコールバックはまずトークンを検証し、新しいアニメーションに割り込まれた場合は静かに終了します；
- **ページ送り/切り替え**：旧コンテンツは 150ms で加速しながら 40px スライドアウト + フェードアウト → 新コンテンツは反対方向から 40px を 300ms で減速しながらスライドイン（`switchPage` と `switchChecklist` で同じ方式）；
- **タイトルのフリップ**：タイトル全体が 140ms でフリップアウト → 240ms で減速しながらフリップイン。方向はページ送りの方向に従います（進む = 上へ、戻る = 下へ）；
- **コーヒーページ**：出現/退出には `@keyframes` を使用（Android で確実に動作）；チェックリスト切り替え時は「特別なチェック項目」として扱われ、スクロール領域と一緒にフリップします（`instant` パスでは自身のアニメーションを無効化）；
- **FLIP**：チェック項目を完了するとき、CSS transition で高さの収縮を駆動し、全体の再レンダリングは行いません。

---

## 📱 APK パッケージング（HBuilderX）

### 📦 手順

新しい 5+ App プロジェクトを作成（パッケージ名 `com.crazysue.checklist`）→ HTML をエントリーページとして配置 → manifest.json を編集 → クラウド/オフラインパッケージング → 証明書 → パッケージング。

### 🔌 使用する plus API

| API | 用途 |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | .checklist をアプリのプライベートディレクトリにエクスポート（**パブリックディレクトリ方式に戻さないこと**） |
| `plus.runtime.openURL(url)` | 外部リンクをシステムのデフォルトブラウザで開く |
| `plus.os.name` | プラットフォーム判定（Android のインポート時は **accept を付けない**） |

### ⚠️ プラットフォームの落とし穴チェックリスト

- Android のファイル入力では `accept` を削除する必要があります。付けないとシステムのセレクタでどのファイルも選択できません；
- Android 10+ のパブリック Download ディレクトリへの書き込み（File パス/MediaStore/SAF）は、一部の端末ではすべて失敗します（0 バイトのファイル）——v1.0 では最終的にアプリのプライベートディレクトリにフォールバック；
- `window.open(url,'_blank','noopener')` はタブを 2 つ開いてしまう——外部リンクはアンカーまたは `plus.runtime.openURL` を使用；
- `scrollTo({behavior:'smooth'})` は古い WebView で静かに失敗する——カスタムスクロールは rAF + イージングで `scrollTop` に直接書き込む；
- `screen.orientation` はウィンドウではなくディスプレイを反映する——縦横判定はウィンドウ自身のアスペクト比のみを使用；
- 重要な出現/退出アニメーションは「初期状態 → クラス切り替え」の transition ではなく `@keyframes` を使用；
- inline-block は先頭の空白を折りたたむ——タイトルの接尾辞は inline のまま維持；
- リップルを pointerup で即座に削除すると速すぎる——手を離した後も、再生が終わるまで続けます。

---

## 🧠 主要な技術判断と落とし穴の記録

| テーマ | 決定 | 理由 |
| --- | --- | --- |
| ページ方向モデル | 新規作成/設定ページは常に右からスライドイン；チェックリストページは左からスライドイン；設定から新規作成ページへ「戻る」ときは方向が反転 | ユーザーのメンタルモデルと一致 |
| タイトルアニメーションの終状態 | タイトル全体（名前 + 「チェックリスト」）を一緒に上下フリップさせ、すべてのページに適用 | 初期の「名前フリップ + 接尾辞移動」の二重方式では、瞬間移動/重なりの問題が繰り返し発生 |
| コーヒーページ | 切り替え時はスクロール領域と一緒にフリップ；リセット時は下へ移動 + フェードアウト | ページ送りの見た目を統一 |
| 自動空行 | 末尾には常に削除ボタンのない自動行が 1 つある；直前の項目をクリアするとアニメーション付きで削除；先頭項目をクリアしても削除されない | 入力体験と「見えないボタンなし」のバランス |
| エクスポート | アプリのプライベートディレクトリ（APK）/ アンカーダウンロード（Web） | Android のバージョン間で信頼性が高い |
| アイコンのキーワード | 各言語 630+ 語、現在の言語を優先し英語にフォールバック、欧文は単語全体でマッチング | ヒット率と誤検出のバランス |

---

## 🧪 テストガイド

### 🧰 ツールチェーン

- **jsdom**：HTML を読み込む前に base64 リソースを除去して高速化し、`beforeParse` で状態シードと polyfill（`scrollIntoView`/`matchMedia`/`URL.createObjectURL` など）を注入；
- **`_sim099.js`**：行動シミュレーション——実際の DOM イベントでユーザーフロー全体を駆動し、アニメーションの中間状態をサンプリングしてタイミングを検証；
- **`_smoke099.js` / `_smoke099b.js`**：機能リグレッション + コードの文字列レベルの検査。

### 📝 シミュレーションケースの例

```js
// beforeParse：状態シード + レイアウトジオメトリの mock
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* 必要に応じて返す */ };
// 実際のイベント駆動 + 中間状態のサンプリング検証
input.focus(); input.value='水を飲む';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('自動空行がアニメーションで削除される', !!document.querySelector('.form-item.removing'));
```

### ✅ リリース前チェックリスト

- [ ] `node --check` の構文チェックが通る；
- [ ] `_sim099.js` が連続 2 回グリーン；
- [ ] `_smoke099.js`、`_smoke099b.js` がすべてグリーン；
- [ ] バージョン番号、削除項目の残骸、主要な API マーカーを grep で確認；
- [ ] 実機検証：エクスポート/インポート/外部リンク/ライト・ダーク/縦横表示/タイトルのフリップ/リップル。

---

## 🎨 デザイン仕様クイックリファレンス（MD3）

- テーマの 4 色：`#10172F` `#283558` `#525288` `#A5A8BA`；ライトは `#525288`、ダークは `#283558` をシードとして派生；
- 状態レイヤー：hover 8% / active 12% の透明な黒；
- フォント：HarmonyOS Sans SC（400/500/700、**サブセット化しないこと**——ユーザーコンテンツには任意の漢字が含まれ得るため）；
- アイコン：Material Symbols Rounded（可変フォント、`font-variation-settings` で FILL/wght を制御）、Google Fonts 由来である必要がある；
- モーション：フリップイン/フェードイン/リップル/スケールのみ許可。突然の出現/消失は禁止；イージングと時間はすべてトークンを使用；
- スイッチ：0.8.0 仕様（オフ 12px / オン 24px）、押下時の伸縮なし、emphasized による非線形遷移。

---

## 📜 バージョン履歴

| バージョン | 主な変更点 |
| --- | --- |
| 0.7.0 | 最初に使えるようになったバージョン（ファイルサイズが大きすぎて GitHub にアップロードできなかった） |
| 0.8.0 | 初版レビューのベースライン |
| 0.9.0 | ボトムバーのフォーカス、コーヒーページのページ送り、編集ページのナビゲーション、アイコンカテゴリのローカライズ、200+ キーワード/言語、.checklist エクスポート、スポンサーボタン、リップルのクリッピング、横画面の左バー、Bold の内蔵 |
| 0.9.5 | ページ送りの方向ルール、編集↔新規作成のフリップ、スイッチの仕様、自動空行、タイトルの位置移動アニメーション |
| 0.9.6 | 設定からの戻り方向、Android のエクスポート/インポート、タイトルの上下フリップ、ダークモードの遷移、横画面判定の書き直し |
| 0.9.7 | タイトルアニメーションのタイミング、コーヒーページのフェードアウト、空行のトリミング、スイッチの 0.8.0 仕様への回帰、クレジット表記の統合 |
| 0.9.8 | Android のフォーカス中央揃え、インポートの accept 除去、エクスポートの 3 段チェーン、タイトル演出の統一、リップルの高速化、パフォーマンス最適化 |
| 0.9.9 | タイトル全体のフリップを全ページに適用、ページ送りアニメーションを 40px に統一、アイコンの整理、全要素のテーマ遷移、フォーカス時のイージングスクロール、高速な割り込み |
| 1.0.0 | エクスポートのプライベートディレクトリ回帰、ドロップダウンの高速割り込み、デッドコードの整理、起動の最適化 —— 🎉 正式版 |
