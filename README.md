# Provão 2027 · Colégio CPPEM

Página única de inscrição no provão. HTML estático (`index.html`) mais uma função
da Vercel (`api/inscricao.js`) que grava cada inscrição no Notion.

## O que trocar

- **Textos, data e links:** bloco `CONFIG` no fim do `index.html`.
- **Banner:** salve as artes em `public/img/banner-desktop.webp` e
  `public/img/banner-mobile.webp`. Sem elas a página mostra o fundo azul.
  Na arte de desktop, deixe o lado direito mais vazio: é onde fica o formulário.

## Rodar localmente

```bash
# crie .env.local com NOTION_TOKEN (ver .env.example)
node --env-file=.env.local dev-server.mjs
# abre http://localhost:8099
```

Abrir o `index.html` direto no navegador mostra a página, mas o envio do
formulário só funciona com o servidor acima ou na Vercel.

## Publicar (Vercel)

1. `vercel` nesta pasta.
2. Em *Environment Variables*, adicione `NOTION_TOKEN`.
3. `vercel --prod`.

## Para onde vão as inscrições

Banco **"Provão 2027 · Inscrições"** no Notion (página Sistemas Site). Cada
envio entra com Status "Novo".

## Rastreamento

GTM server-side do CPPEM no `<head>`; a PixelX entra por dentro dele. O `<form>`
usa o identificador do painel `eiBtTROiAlNexbHXklSc` e a nomenclatura exigida
(`lead_name`, `lead_email`, `lead_phone`, `lead_submit`). O Lead é disparado pelo
painel no envio; o site não chama `send_event` nem aplica máscara no telefone.
