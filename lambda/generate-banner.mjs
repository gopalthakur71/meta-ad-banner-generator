import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID = process.env.BEDROCK_MODEL_ID;
const REGION = process.env.BEDROCK_REGION;

const bedrock = new BedrockRuntimeClient({ region: REGION });

function buildPrompt({ productName, productDescription, tone, formatId }) {
  const isWebsiteHero = formatId?.startsWith("hero");
  const context = isWebsiteHero
    ? "a website homepage hero banner"
    : "a Meta social media ad banner";

  return `You are a master copywriter for premium Indian ethnic wear and saree brands — think Sabyasachi, Raw Mango, and Ekaya Banaras. Your writing is poetic, evocative, and luxurious.

Create captivating ad copy for ${context}.

Product: ${productName}
Description: ${productDescription}
Tone: ${tone}
Format: ${formatId}

${isWebsiteHero
    ? "This is a website hero — write brand-storytelling copy that draws the viewer in."
    : "This is a social media ad — keep it punchy and emotionally resonant. Every word must earn its place."}

Guidelines:
- Headline: Short, poetic, and memorable. Use metaphor or sensory language. Max 7 words.
- Sub-headline: Reinforces the headline with a specific benefit or mood. Max 14 words.
- CTA: Action-oriented and inviting (2–4 words).
- Offer badge: A short label like "New Arrival", "Limited Edition", "Festive Edit", or leave empty.
- Avoid clichés like "Timeless elegance" or "Crafted with love" — be specific and fresh.

Return ONLY valid JSON in this exact shape:
{
  "headline": "Short poetic headline",
  "sub_headline": "Supporting line with specific appeal",
  "body_copy": "Brief body text if needed (max 20 words, or empty string)",
  "cta_text": "Shop Now",
  "offer_text": "New Arrival",
  "layout_suggestion": "one of: centered | left-aligned | overlay | minimal"
}`;
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  // CORS preflight is handled by API Gateway HTTP API (cors_configuration),
  // so we never see OPTIONS here.

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const { productName, productDescription, tone, formatId } = payload;
  if (!productName || !productDescription || !tone || !formatId) {
    return respond(400, {
      error: "Missing required fields: productName, productDescription, tone, formatId",
    });
  }

  // Caller identity from the JWT authorizer — handy for CloudWatch traceability.
  const caller = event.requestContext?.authorizer?.jwt?.claims?.email ?? "unknown";
  console.log(JSON.stringify({ event: "generate_request", caller, formatId, tone }));

  const prompt = buildPrompt({ productName, productDescription, tone, formatId });

  // Bedrock Claude payload shape — anthropic_version is required.
  const bedrockBody = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  };

  let bedrockResponse;
  try {
    bedrockResponse = await bedrock.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(bedrockBody),
      })
    );
  } catch (err) {
    console.error(JSON.stringify({ event: "bedrock_error", caller, message: err.message }));
    return respond(502, { error: "Upstream model call failed" });
  }

  const decoded = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
  const raw = decoded.content?.[0]?.text?.trim() ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(JSON.stringify({ event: "invalid_model_json", caller, raw }));
    return respond(502, { error: "Model returned non-JSON response" });
  }

  let copy;
  try {
    copy = JSON.parse(jsonMatch[0]);
  } catch {
    return respond(502, { error: "Model returned malformed JSON" });
  }

  const usage = {
    model: MODEL_ID,
    inputTokens: decoded.usage?.input_tokens ?? 0,
    outputTokens: decoded.usage?.output_tokens ?? 0,
  };

  console.log(JSON.stringify({ event: "generate_success", caller, usage }));

  return respond(200, { copy, usage });
}
