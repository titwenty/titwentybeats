titwenty-Beats — Cloudflare Workers + R2

ВАЖНО:
1. Содержимое ЭТОЙ папки должно находиться в корне GitHub-репозитория.
2. В корне должны быть:
   src/index.js
   public/index.html
   wrangler.jsonc
   package.json

3. В Cloudflare должен существовать R2 bucket:
   titwenty-beats

4. Создай Worker Secret:
   ADMIN_PASSWORD

5. Deploy command:
   npx wrangler deploy

Если Cloudflare показывает:
"The entry-point file at src/index.js was not found"
— значит файлы проекта загружены во вложенную папку, а не в корень репозитория.
