// app/api/llm/route.ts
import { NextRequest } from "next/server";
import { MessageType } from "@/app/components/types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { MessageParam } from "@anthropic-ai/sdk/resources/index.mjs";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = "You are a helpful assistant.";

// Optional: run on the edge for faster response times (if you're on Vercel, etc.)
export const runtime = "edge";

function mapToAnthropicMessages(messages: MessageType[]) {
    return messages.map(({ role, content }) => ({ role, content }));
}

export async function* generateResponse(
    modelAlias: string,
    messages: MessageType[],
    openaiApiKey: string,
    anthropicApiKey: string
): AsyncGenerator<string, void, unknown> {
    let completion;
    
    try {
        const openai = new OpenAI({ apiKey: openaiApiKey });
        const anthropic = new Anthropic({ apiKey: anthropicApiKey });

        switch (modelAlias) {
            case "chatgpt-4o-latest":
            case "gpt-4o-mini":
                messages = [
                    { role: "system", content: SYSTEM_PROMPT } as MessageType,
                    ...messages,
                ];

                completion = await openai.chat.completions.create({
                    model: modelAlias,
                    messages: messages as ChatCompletionMessageParam[],
                    stream: true,
                });

                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        yield content;
                    }
                }
                break;
            case "claude-3-5-sonnet-latest":
            case "claude-3-5-haiku-latest":
                completion = await anthropic.messages.stream({
                    model: modelAlias,
                    messages: mapToAnthropicMessages(messages) as MessageParam[],
                max_tokens: 8192,
                system: SYSTEM_PROMPT,
                });

                for await (const chunk of completion) {
                    const content = chunk || "";
                    if (content && content.type === 'content_block_delta') {
                        yield content.delta.text;
                    }
                }
                break;
            default:
                yield "Error: API key invalid.";
        }
    } catch (error) {
        yield "Error: API key invalid.";
    }
}

// POST /api/llm
export async function POST(req: NextRequest) {
    try {
        const { modelAlias, messages, openaiApiKey, anthropicApiKey } = await req.json() as {
            modelAlias: string;
            messages: MessageType[];
            openaiApiKey: string;
            anthropicApiKey: string;
        };

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Call the streaming generator from llms.ts
                    for await (const token of generateResponse(modelAlias, messages, openaiApiKey, anthropicApiKey)) {
                        controller.enqueue(encoder.encode(token));
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(stream);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
