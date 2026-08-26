# チェックリスト

![background](../background.png)

> MD3 スタイルのチェックリスト——これからは何も忘れない。

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | 日本語 | [한국어](README-ko.md) | [Français](README-fr.md) | [Deutsch](README-de.md) | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**チェックリスト**は、MD3 デザイン言語を採用したToDo リストアプリです。

---

## ✨ 特徴

- **単一ファイル**：アプリ全体が 1 つの HTML ファイルに収められ、フォント・アイコンフォント・アプリアイコンをすべて内蔵。ダブルクリックするだけでオフラインでも動作します；
- **MD3 デザイン言語**：完全な MD3 デザイントークン、状態レイヤー、リップル、非線形イージングのアニメーション；
- **ローカライズ**：10 言語に対応（简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）；
- **スマートなアイコン選択**：チェック項目 / チェックリスト名からアイコンを自動マッチング（各言語 630+ キーワードのインデックス）；
- **自動リセット**：すべて完了したら、タイマーによる自動リセットを設定でき、新しい一日を迎えられます；
- **簡単共有**：.checklist ファイル（中身は JSON）のエクスポート / インポート。データが失われることはありません；
- **縦横表示の自動対応**：縦画面ではボトムバー、横画面では左側のナビゲーションバー；
- **ダークモード**：システム連動 / ライト / ダークに対応し、全画面が滑らかに遷移します。

---

## 📱 スクリーンショット

| ![ホーム画面](../pictures/picture-1.png)  | ![チェックリスト編集](../pictures/picture-2.png) | ![設定](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![アイコン選択](../pictures/picture-4.png) | ![検索](../pictures/picture-5.png)    | ![完了](../pictures/picture-6.png) |

---

## 📥 ダウンロード

- 最新版は [GitHub Releases](https://github.com/CrazySue/Checklist/releases) から APK をダウンロードしてください；
- ウェブ版もそのまま使えます：リポジトリ内の HTML ファイルを開けば実行できます；

---

## 🎥 開発の背景

今や、やるべきことはどんどん増えていきます。誕生日パーティーに参加して、友達と映画を観て……そんな中、多くのカレンダーアプリは昔からスケジュール機能を組み込み、大事なことを忘れないように知らせてくれています。

しかし、問題は解決していません。家を出たあとに交通系ICカードを忘れたことに気づく？退勤後に日報の提出を忘れる？むしろ「大事なこと」を構成する「小さなこと」こそが、人々の進み具合を遅らせているのです。

そこで、さんざん苦しめられてきた Sue は、この問題を解決するため、チェックリストを開発することにしました。大きな予定を思い出させてくれる機能はありません——カレンダーアプリのほうが得意ですし、そもそも忘れにくいものですから——その代わり、細かい手順が必要な小さなタスクをリスト化し、ひとつ終えるごとにチェックを付けていけます。**これからは何も忘れません。**

---

## 🛠️ ビルドを始める

チェックリストは HTML で書かれた 5+ App で、HBuilderX によって APK インストーラーにパッケージングされます。

> [!NOTE]
> HBuilderX で HTML をパッケージングする方法やチュートリアルは数えきれないほどあるため、ここでは簡略化したビルド方法のみを記載します。詳しくは [HBuilderX ドキュメント](https://hx.dcloud.net.cn/) を参照してください。

HTML ファイルを自分の OS 向けのインストーラーにパッケージングするには、次の手順を実行してください：

1. [HBuilderX をダウンロード](https://www.dcloud.io/hbuilderx.html)します。
2. 新しい 5+ App プロジェクトを作成します。
3. index.html をパッケージングしたい HTML ファイルに置き換えます。
4. manifest.json で変更したいオプションを編集します。
5. クラウドパッケージングまたはオフラインパッケージングを使用します。
6. アプリ証明書をアップロードします（クラウドパッケージングではクラウド証明書を使用できます）。
7. パッケージングします。

---

## 🧭 開発に参加する

コードを読みたい、バグを直したい、機能を追加したい？こちらをご覧ください：

- [開発ガイド](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-ja.md)——アーキテクチャ、ビルドパイプライン、テストと落とし穴の記録；
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md)——コントリビューションガイド。

---

## 📊 プロジェクトの状態

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 オープンソースライセンス

本プロジェクトは **MIT License** でライセンスされており、誰でも本ソフトウェアのコピーを使用、複製、修正、統合、公開、配布、再ライセンス、および / または販売することができます。詳細は [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) ファイルを参照してください。

本プロジェクトでは以下のオープンソースソフトウェアを使用しています：

- Google の [Material Symbols Rounded](https://github.com/material-components/material-web) アイコン体系
- Google の [Material Design 3](https://github.com/material-components/material-web) デザイン言語
- Huawei の [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) フォントファミリー

---

## 💌 このアプリについて

- 💡 企画：[Crazy Sue](https://github.com/CrazySue)
- ⌨️ プログラミング：[GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ メンテナンス：[DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*これからは何も忘れません。*
