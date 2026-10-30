/**
 * Recebe a inscrição do Provão e grava no Notion
 * (banco "Provão 2027 · Inscrições", na página Sistemas Site).
 *
 * Função serverless da Vercel. O token do Notion fica só aqui, no servidor:
 * a página HTML nunca o vê. Variáveis de ambiente necessárias no projeto:
 *   NOTION_TOKEN              — a mesma integração dos outros sites do CPPEM
 *   NOTION_PROVAO_DATABASE_ID — opcional; o padrão é o banco criado para este provão
 */
const DATA_SOURCE_ID = process.env.NOTION_PROVAO_DATA_SOURCE_ID || "8a0f370e-d374-4fd4-88b4-195a8645c8d3";

const SERIES = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano", "1ª série", "2ª série", "3ª série"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const text = (content) => (content ? [{ type: "text", text: { content } }] : []);

// celular ou fixo com DDD; o "+55" da máscara sai pelo "+" literal antes de contar
function validPhone(value) {
  const digits = value.replace(/^\+\s*55\s*/, "").replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Método não permitido." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body || {};

  // campo-isca: gente não preenche, robô preenche. Responde ok sem gravar.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const data = {
    guardian: clean(body.name, 120),
    student: clean(body.student, 120),
    email: clean(body.email, 160),
    phone: clean(body.phone, 30),
    series: clean(body.series, 20),
    school: clean(body.school, 120),
  };

  const errors = {};
  if (data.guardian.length < 3) errors.name = "Informe o nome do responsável.";
  if (data.student.length < 3) errors.student = "Informe o nome do aluno.";
  if (!EMAIL.test(data.email)) errors.email = "Informe um e-mail válido.";
  if (!validPhone(data.phone)) errors.phone = "Informe o telefone com DDD.";
  if (!SERIES.includes(data.series)) errors.series = "Selecione a série.";
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, message: "Confira os campos destacados.", errors });

  if (!process.env.NOTION_TOKEN) {
    console.error("[provao] NOTION_TOKEN não configurado.");
    return res.status(500).json({ ok: false, message: "Não conseguimos registrar sua inscrição agora. Fale com a gente pelo WhatsApp." });
  }

  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" },
      body: JSON.stringify({
        parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
        properties: {
          Aluno: { title: text(data.student) },
          "Responsável": { rich_text: text(data.guardian) },
          Telefone: { phone_number: data.phone },
          Email: { email: data.email },
          "Série pretendida": { select: { name: data.series } },
          "Escola atual": { rich_text: text(data.school) },
          Status: { select: { name: "Novo" } },
        },
      }),
    });
    if (!response.ok) throw new Error(`Notion respondeu ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[provao] Falha ao gravar:", error instanceof Error ? error.message : "erro desconhecido");
    return res.status(502).json({ ok: false, message: "Não conseguimos registrar sua inscrição agora. Tente de novo ou fale com a gente pelo WhatsApp." });
  }
};

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
