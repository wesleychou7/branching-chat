// app/api/chat-name/route.ts
import { NextRequest } from "next/server";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

async function generateChatName(
    userMessage: string,
    assistantResponse: string,
    openaiApiKey: string,
    anthropicApiKey: string
) {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    let chatName: any = "A Conversation"; // fallback name
    
    if (openaiApiKey) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Summarize the conversation in 4 words or fewer, using title case. Be as concise as possible. Do not bold any words. Do not use any punctutaion. Do not name the chat '(New Chat)'.",
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
        chatName = response?.choices[0]?.message?.content;
      } catch (error) {
        console.error('OpenAI chat name generation failed:', error);
      }
    } else if (anthropicApiKey) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-3-5-haiku-latest",
          max_tokens: 1024,
          system: "Summarize the conversation in 4 words or fewer, using title case. Be as concise as possible. Do not bold any words. Do not use any punctutaion. Do not name the chat '(New Chat)'.",
          messages: [
            { role: "user", content: userMessage },
            { role: "assistant", content: assistantResponse }
          ]
        });
        chatName = response?.content[0]?.type === "text" ? response.content[0].text : "A Conversation";
      } catch (error) {
        console.error('Anthropic chat name generation failed:', error);
      }
    }

    return chatName || "A Conversation";
}  

export async function POST(req: NextRequest) {
  try {
    const { userMessage, assistantResponse, openaiApiKey, anthropicApiKey } = await req.json();
    const name = await generateChatName(userMessage, assistantResponse, openaiApiKey, anthropicApiKey);
    return new Response(JSON.stringify({ name }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
