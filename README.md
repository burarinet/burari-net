# ぶらりネット：GitHub + Netlify 移管版

公開サイト https://burari-net.jp/ をもとに、CMS不要の静的サイトを作成しました。

## 現在の状態

- 公開11ページの原文を移管。元の画像32点を保存しています。
- トップページと下層ページをネイビー・グリーンのレスポンシブデザインに刷新。
- シミュレーターを復元し、28,080条件で元のJavaScriptとの結果一致を確認。
- お問い合わせ・採用応募・代理店募集をNetlify Forms向けに実装。
- GitHubへのアップロード、Netlifyのサイト作成、フォーム実送信確認、ドメイン切替は未実施。
- GitHub・Netlifyともブラウザーは未ログインです。公開作業には所有者によるログインが必要です。
- ブラウザーでのクリック・画面サイズ別の目視検証は未実施。静的出力、型検査、原文・リンク・画像参照の検査を実施済みです。

## ローカルで確認

Node.js 22.13以降を使用します。

```powershell
cd site
npm ci
npm run dev
```

開発プレビューは起動時に空いているローカルポートを自動選択し、URLを表示します。

```powershell
npm test
npm run build
npx tsc --noEmit
```

公開するファイルは `site/dist/client/` だけです。PHP・データベース・VPS・Cloudflareの実行環境は不要です。開発構成はVinext/React、配信は事前生成したHTML/CSS/JavaScriptです。

## GitHub → Netlify

1. GitHubに空の非公開リポジトリ（例：`burari-net`）を作成します。
2. このフォルダ全体をリポジトリにpushします。`node_modules`、移管用HTML、解析ライブラリ、出力フォルダは除外済みです。
3. Netlifyで既存Gitリポジトリからインポートし、そのリポジトリを選択します。
4. ルートの `netlify.toml` が次の値を指定しています。
   - Base directory: `site`
   - Build command: `npm run build`
   - Publish directory: `dist/client`（baseからの相対パス）
   - Node.js: `22`
5. Netlify Formsの自動検出を有効にして再デプロイします。`contact`、`recruitment`、`agency` の3フォームが認識されることを確認します。
6. 各フォームの通知先を設定します。現サイト掲載の `info@burari-net.co.jp` が現在も受信可能か確認してください。
7. Netlifyの仮URLで全ページ・スマートフォン表示・3フォームの実送信/受信を確認します。

ローカルのフォームは実送信しません。Netlify側では標準POSTを使用し、送信完了ページへ進みます。フォーム検出が無効なまま公開しないでください。実際の受付・通知まで確認してからドメインを切り替えます。

公式資料：
- [Netlifyフォーム設定](https://docs.netlify.com/manage/forms/setup/)
- [フォーム通知設定](https://docs.netlify.com/manage/forms/notifications/)
- [ビルド設定](https://docs.netlify.com/build/configure-builds/file-based-configuration/)

## 本番ドメイン切替

1. 先に現VPSのファイル・データベース・DNS設定をバックアップします。
2. Netlifyへ `burari-net.jp`（必要なら `www.burari-net.jp` も）を追加します。
3. Netlifyが表示する最新のDNS指定値を使用してWeb向けレコードを変更します。値を推測して設定しないでください。
4. メール用MX/TXTや他用途のレコードは維持し、VPSがメールを担当していないか確認します。サイトのメール表記は別ドメイン `burari-net.co.jp` です。
5. HTTPS、正規ドメインへの転送、旧URL、フォーム受信を確認します。
6. 動作が安定し、VPSの他用途も移行済みと確認するまでVPSを解約しないでください。必要時は保存したDNS値へ戻します。

Netlifyの利用枠・フォーム枠・課金条件は契約画面で確認してください。このプロジェクトから課金サービスの申し込みは行っていません。

## 文章・写真を変更する場所

- トップ：`site/app/page.tsx`
- 下層ページ本文とフォーム項目：`site/lib/content.json`
- 共通ヘッダー/フッター：`site/components/site-shell.tsx`
- デザイン：`site/app/globals.css`
- 画像：`site/public/application/files/`（元のパスを維持）
- シミュレーター：`site/lib/simulator.mjs`

詳細な移管記録は `migration/REPORT.md` を参照してください。
