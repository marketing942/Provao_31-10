// Servidor local para testar a página com o formulário funcionando.
// Uso: node --env-file=.env.local dev-server.mjs   →   http://localhost:8099
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, join, normalize } from "node:path";

const handler = createRequire(import.meta.url)("./api/inscricao.js");
const root = import.meta.dirname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  if (path === "/api/inscricao") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    req.body = raw;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };
    return handler(req, res);
  }
  const file = normalize(join(root, path === "/" ? "index.html" : decodeURIComponent(path)));
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
  try {
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end("Não encontrado"); }
}).listen(8099, () => console.log("Provão: http://localhost:8099"));
