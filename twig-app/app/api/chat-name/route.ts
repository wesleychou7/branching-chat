// app/api/chat-name/route.ts
import { NextRequest } from "next/server";
// import { generateChatName } from "@/lib/llms";
import { openai } from "@/app/api/llm/route";

export async function generateChatName(
    userMessage: string,
    assistantResponse: string
  ) {
    const chatName = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the conversation in 4 words or fewer, using title case. Be as concise as possible. Do not use any punctutaion. Do not name the chat '(New Chat)'.",
        },
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: assistantResponse,
        },
      ],
    });
    return chatName?.choices[0]?.message?.content || "A Conversation";
  }
  

export async function POST(req: NextRequest) {
  try {
    const { userMessage, assistantResponse } = await req.json();
    const name = await generateChatName(userMessage, assistantResponse);
    return new Response(JSON.stringify({ name }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
