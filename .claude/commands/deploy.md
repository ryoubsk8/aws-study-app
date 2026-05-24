Gitを使ってVercelにデプロイしてください。

## 手順

1. `C:\Program Files\Git\bin\git.exe` をgitコマンドとして使用する
2. 作業ディレクトリは `C:\Users\ryoub\Desktop\projects\aws_study_app`
3. `git status` で変更ファイルを確認して表示する
4. 変更がなければ「デプロイするファイルの変更がありません」と伝えて終了する
5. 変更がある場合、ユーザーにコミットメッセージを確認する（提案も添える）
6. `git add .` で全ファイルをステージング
7. 指定されたメッセージで `git commit`
8. `git push origin main` でGitHubにpush
9. 「Vercelが自動デプロイを開始しました。https://aws-study-app-zeta.vercel.app/ に反映されます」と伝える
