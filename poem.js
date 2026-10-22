import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const HANGUL = /^[가-힣]{1,6}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST만 지원해요." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const name = String(body?.name ?? "").replace(/\s/g, "");
  const variation = Boolean(body?.variation);

  if (!HANGUL.test(name)) {
    return res.status(400).json({ error: "한글 이름(1~6글자)만 넣어 주세요." });
  }

  const chars = [...name];
  const prompt =
`이름 "${name}"으로 ${chars.length}행시를 지어 줘.
규칙:
- 정확히 ${chars.length}줄. i번째 줄은 반드시 이름의 i번째 글자(${chars.join(", ")})로 시작한다.
- 각 줄은 짧고 자연스러운 한국어 문장(10~25자). 이어 읽으면 하나의 따뜻하거나 재치 있는 이야기가 되게.
- 마지막 줄에 기분 좋은 반전이나 칭찬을 넣어도 좋다. 비하·불쾌한 내용 금지.${variation ? "\n- 흔한 표현을 피하고 새로운 느낌으로." : ""}`;

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: { lines: { type: "array", items: { type: "string" } } },
            required: ["lines"],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "이 이름으로는 삼행시를 만들 수 없어요." });
    }

    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const lines = safeParse(text)?.lines;
    if (!Array.isArray(lines) || lines.length < chars.length) {
      return res.status(502).json({ error: "삼행시를 받지 못했어요. 다시 눌러 주세요." });
    }

    return res.status(200).json({ name, lines: lines.slice(0, chars.length).map(String) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "요청이 많아요. 잠시 뒤에 다시 눌러 주세요." });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key is missing or invalid");
      return res.status(500).json({ error: "서버 설정에 문제가 있어요." });
    }
    console.error(err);
    return res.status(502).json({ error: "삼행시를 받지 못했어요. 다시 눌러 주세요." });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
