import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = (body?.message || "").toString();
    const context = body?.context || {};

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
    }

    const systemPrompt = [
      "You are a helpful psoriasis support assistant.",
      "Use a warm, clear, doctor-like tone, but do not claim to be a licensed doctor.",
      "Give practical, safe, concise advice.",
      "Always include that this does not replace dermatologist care when relevant.",
      "Context data is environmental risk analysis; explain in simple language.",
    ].join(" ");

    const userPrompt = `User question: ${message}\n\nCurrent psoriasis risk context:\n${JSON.stringify(context, null, 2)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || "OpenAI request failed" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      reply:
        reply ||
        "I could not generate a response right now. Please try again in a moment.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
