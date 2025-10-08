import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { message } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const result = await model.generateContent(message);
  const response = await result.response;
  const text = response.text();

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}
