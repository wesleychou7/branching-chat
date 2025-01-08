import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { MessageType } from "@/app/components/types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { MessageParam } from "@anthropic-ai/sdk/resources/index.mjs";

/**
 * Example Anthropic "messages" => the new Node SDK allows for either
 *  - anthropic.completions.create() with a `prompt`
 *  - or anthropic.messages.create() with a `messages[]` array.
 *
 * You can transform your messages into the required shape below
 * if you need them in a certain structure. Otherwise, you can
 * pass them directly if it already matches what you need.
 */
function mapToAnthropicMessages(messages: MessageType[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}

/**
 * Initialize your clients.
 * (In a real production scenario, you likely want your keys in .env or server side.)
 */
const openai = new OpenAI({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

const anthropic = new Anthropic({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});


export async function* generateResponse(
  modelAlias: string,
  messages: MessageType[]
): AsyncGenerator<string, void, unknown> {
  let completion;

  switch (modelAlias) {
    case "chatgpt-4o-latest":
    case "gpt-4o-mini":
      messages = [
        { role: "system", content: "You are a helpful assistant." } as MessageType,
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
        system: "You are a helpful assistant.",
      });

      for await (const chunk of completion) {
        const content = chunk || "";
        if (content && content.type === 'content_block_delta') {
          yield content.delta.text;
        }
      }
      break;
    default:
      yield "Error";
  }
}
