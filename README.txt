titwenty-Beats — Cloudflare Workers + R2

СТРУКТУРА:
index.js
wrangler.jsonc
package.json
public/index.html

КАК ДЕПЛОИТЬ ЧЕРЕЗ CLOUDFLARE WORKERS BUILDS:
Build command:
  npm install

Deploy command:
  npx wrangler deploy

ВАЖНО:
1. GitHub должен содержать ФАЙЛЫ ПРОЕКТА В КОРНЕ.
2. index.js должен быть именно:
   /index.js
   НЕ /src/index.js и НЕ /titwenty-Beats/index.js
3. Создай R2 bucket с именем:
   titwenty-beats
4. В Worker Secrets создай:
   ADMIN_PASSWORD
5. После деплоя сайт открывается на адресе Worker.

В конфиге уже исправлено:
- main -> ./index.js
- assets -> ./public
- binding ASSETS
- API и /media направляются сначала в Worker
- R2 binding BEATS
