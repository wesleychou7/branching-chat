import { useRef, useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { MessageType } from "@/app/components/types";
import TextareaAutosize from "react-textarea-autosize";
import supabase from "@/app/supabase";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  setNodeId,
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
} from "@/app/components/tree/messageSlice";

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

// props must be any type bc of dagre
export default function Node({
  id, // THIS IS A STRING
  data,
  selectedChatID,
  messages,
  setMessages,
}: any) {
  const [prompt, setPrompt] = useState<string>(data.value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // redux for streaming response
  const dispatch = useDispatch();
  const nodeId = useSelector((state: RootState) => state.message.nodeId);
  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const streamedMessage = useSelector((state: RootState) => {
    return state.message.streamedMessage;
  });

  // update message in database after user stops typing for 3 seconds
  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      const response = await supabase
        .from("messages")
        .update({ content: prompt })
        .eq("id", id);

      if (response.error) console.error(response.error);
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, [prompt, id]);

  async function onClickAddPrompt() {
    // add message to message state
    const newMessage: MessageType = {
      id: uuidv4(),
      parent_id: id,
      role: "user",
      content: "",
    };
    setMessages((prev: MessageType[]) => prev.concat(newMessage));

    // add message to database
    const response = await supabase.from("messages").insert({
      id: newMessage.id,
      chat_id: selectedChatID,
      role: "user",
      content: "",
      parent_id: id,
    });

    if (response.error) console.error(response.error);
  }

  async function onClickDelete() {
    // delete message from message state
    setMessages((prev: MessageType[]) =>
      prev.filter((msg: MessageType) => msg.id != id)
    );

    // delete message from database
    const response = await supabase.from("messages").delete().eq("id", id);

    if (response.error) console.error(response.error);
  }

  async function onClickGenerateResponse() {
    const responseId = uuidv4();
    dispatch(setNodeId(responseId));
    dispatch(setAwaitingResponse(true));
    dispatch(clearStreamedMessage());

    setMessages((prev: MessageType[]) =>
      prev.map((msg: MessageType) => {
        if (msg.id === id) return { ...msg, content: prompt };
        return msg;
      })
    );

    // add message to message state
    const newMessage: MessageType = {
      id: responseId,
      parent_id: id,
      role: "assistant",
      content: "",
    };
    setMessages((prev: MessageType[]) => prev.concat(newMessage));

    // get parent messages by traversing up the tree thru parents
    const parentMessages: MessageType[] = (() => {
      const result: MessageType[] = [];
      let currentId: string | null = id;

      while (currentId) {
        // If we're at the current node ID, use the latest prompt
        const message =
          currentId === id
            ? {
                ...messages.find((msg: MessageType) => msg.id === currentId),
                content: prompt,
              }
            : messages.find((msg: MessageType) => msg.id === currentId);

        if (!message) break;
        result.push(message);
        currentId = message.parent_id;
      }

      return result.reverse();
    })();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...(parentMessages as ChatCompletionMessageParam[]),
      ],
      stream: true,
    });

    let accumulatedContent = "";

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      accumulatedContent += content;
      dispatch(appendStreamedMessage(content));
    }

    setMessages((prev: MessageType[]) => {
      const newMessages = [...prev];
      const index = newMessages.findIndex(
        (msg: MessageType) => msg.id === responseId
      );
      if (index !== -1) {
        newMessages[index].content = accumulatedContent;
      }
      return newMessages;
    });

    dispatch(setAwaitingResponse(false));

    // add message to database with final content
    const response = await supabase.from("messages").insert({
      id: responseId,
      chat_id: selectedChatID,
      role: "assistant",
      content: accumulatedContent,
      parent_id: id,
    });

    if (response.error) console.error(response.error);
  }

  return (
    <div>
      <div className="bg-white border border-gray-400 rounded-lg w-[750px] p-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <div>
            {data.label} {id} {nodeId}
          </div>
          <button onClick={onClickDelete}>Delete</button>
        </div>
        <TextareaAutosize
          value={
            data.label === "user"
              ? prompt
              : awaitingResponse && id === nodeId
              ? streamedMessage + " ▎"
              : prompt
          }
          onChange={(e) => setPrompt(e.target.value)}
          onClick={(e) => {
            e.stopPropagation(); // this is so that i can click directly into the textarea
          }}
          className="nopan" // this is so that highlighting in the textarea doesn't drag the tree view
          style={{
            width: "99%",
            border: "none",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
        />

        <div className="flex justify-end text-xs text-gray-400 gap-4">
          <button onClick={onClickAddPrompt}>Add prompt</button>
          <button onClick={onClickGenerateResponse}>Generate response</button>
        </div>
      </div>

      {data.height > 1 && (
        <Handle type="target" position={Position.Top} isConnectable={false} />
      )}
      {data.height > 1 && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
        />
      )}
    </div>
  );
}
