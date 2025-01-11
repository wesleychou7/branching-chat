import { useRef, useState, useEffect, useContext } from "react";
import { Handle, Position } from "@xyflow/react";
import { MessageType, ChatType } from "@/app/components/types";
import TextareaAutosize from "react-textarea-autosize";
import supabase from "@/app/supabase";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { generateResponse } from "@/lib/llms";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { ModelContext } from "@/app/page";
import {
  setNodeId,
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
} from "@/app/components/tree/messageSlice";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./AssistantMessage.css";
import CodeHighlighter from "./CodeHighlighter";
import DeleteModal from "./DeleteModal";

const translateLaTex = (val: string | null): string => {
  if (!val) return "";
  if (val.indexOf("\\") == -1) return val;

  return val
    .replaceAll("\\(", "$$") // inline math
    .replaceAll("\\)", "$$")
    .replaceAll("\\[", "$$$") // display math
    .replaceAll("\\]", "$$$");
};

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
  setChats,
  messages,
  setMessages,
}: any) {
  const model = useContext(ModelContext);
  const [prompt, setPrompt] = useState<string>(data.value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copyText, setCopyText] = useState<string>("Copy");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Auto-focus textarea when a new node is added
  if (data.label === "user" && prompt === "") textareaRef.current?.focus();

  // redux for streaming response
  const dispatch = useDispatch();
  const nodeId = useSelector((state: RootState) => state.message.nodeId);
  const awaitingResponse = useSelector((state: RootState) =>
    state.message.nodeId === id ? state.message.awaitingResponse : false
  );
  const streamedMessage = useSelector((state: RootState) =>
    state.message.nodeId === id ? state.message.streamedMessage : ""
  );

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
    // Check if node has children
    const hasChildren = messages.some(
      (msg: MessageType) => msg.parent_id === id
    );

    if (hasChildren) {
      setShowDeleteModal(true);
      return;
    }

    // If no children, delete immediately
    await deleteNode();
  }

  async function deleteNode() {
    // Collect all IDs to delete (including children)
    const idsToDelete = new Set<string>();

    const collectIdsToDelete = (nodeId: string) => {
      idsToDelete.add(nodeId);
      messages.forEach((msg: MessageType) => {
        if (msg.parent_id === nodeId) {
          collectIdsToDelete(msg.id);
        }
      });
    };

    collectIdsToDelete(id);

    // delete messages and all their children from message state
    setMessages((prev: MessageType[]) =>
      prev.filter((msg: MessageType) => !idsToDelete.has(msg.id))
    );

    // delete messages and all their children from database
    const response = await supabase
      .from("messages")
      .delete()
      .in("id", Array.from(idsToDelete));

    if (response.error) console.error(response.error);
  }

  async function generateChatName(
    userMessage: string,
    assistantResponse: string
  ): Promise<string> {
    const chatName = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the conversation in 4 words or fewer, using title case. Be as concise as possible. Do not use any punctutaion.",
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

  async function onClickGenerateResponse() {
    const responseId = uuidv4();
    dispatch(setNodeId(responseId));
    dispatch(setAwaitingResponse(true));
    dispatch(clearStreamedMessage());
    const modelNameUsed = model.name;
    const modelAliasUsed = model.alias;

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
      model_name: modelNameUsed,
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

    let accumulatedContent = "";
    try {
      for await (const token of generateResponse(
        modelAliasUsed,
        parentMessages
      )) {
        accumulatedContent += token;
        dispatch(appendStreamedMessage(token));
      }
    } catch (err) {
      console.error("Error streaming from LLM:", err);
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

    // add prompt message to database
    const response1 = await supabase
      .from("messages")
      .update({ content: prompt })
      .eq("id", id);

    if (response1.error) console.error(response1.error);

    if (messages.length <= 1) {
      const chatName = await generateChatName(prompt, accumulatedContent);
      setChats((prev: ChatType[]) => {
        const newChats = [...prev];
        const index = newChats.findIndex(
          (chat: ChatType) => chat.id === selectedChatID
        );
        if (index !== -1) {
          newChats[index].name = chatName;
        }
        return newChats;
      });

      const response = await supabase
        .from("chats")
        .update({ name: chatName })
        .eq("id", selectedChatID);

      if (response.error) console.error(response.error);
    }

    // add response to database
    const response2 = await supabase.from("messages").insert({
      id: responseId,
      chat_id: selectedChatID,
      parent_id: id,
      role: "assistant",
      model_name: modelNameUsed,
      content: accumulatedContent,
    });

    if (response2.error) console.error(response2.error);
  }

  function onClickCopy() {
    setCopyText("Copied!");
    navigator.clipboard.writeText(prompt);
    setTimeout(() => setCopyText("Copy"), 2000);
  }

  return (
    <>
      <div
        className={`${data.label === "user" ? "user-node" : ""} cursor-default`}
      >
        <div
          className={`${
            data.label === "user" ? "bg-gray-50" : "bg-white"
          } border 
          ${
            data.label === "user" ? "border-gray-400" : "border-gray-300"
          } rounded-lg w-[750px] p-2`}
        >
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <div>{data.label === "user" ? "you" : data.model_name}</div>
            {data.parent_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClickDelete();
                }}
                className="hover:text-red-600 transition ease-in-out"
              >
                Delete
              </button>
            )}
          </div>
          {data.label === "user" && (
            <TextareaAutosize
              value={prompt}
              placeholder={
                data.parent_id ? "Type your message..." : "Ask anything..."
              }
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
              onClick={(e) => {
                e.stopPropagation(); // this is so that i can click directly into the textarea
              }}
              ref={textareaRef}
              className="nopan bg-gray-50" // nopan so that highlighting in the textarea doesn't drag the tree view
              style={{
                width: "100%",
                border: "none",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            />
          )}
          {data.label === "assistant" && (
            <ReactMarkdown
              className="assistant-message nopan"
              remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                code: (props) => {
                  const { children, className } = props;
                  const match = /language-(\w+)/.exec(className || ""); // extract code language from className
                  return (
                    <CodeHighlighter
                      language={match ? match[1] : "text"} // default to normal text if no language
                      code={String(children)}
                    />
                  );
                },
              }}
            >
              {`${translateLaTex(
                awaitingResponse && id === nodeId
                  ? streamedMessage + " ▎"
                  : prompt
              )}`}
            </ReactMarkdown>
          )}

          <div className="text-xs text-gray-400 mt-1">
            {data.label === "user" && (
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClickAddPrompt}
                  className="hover:text-gray-600 transition ease-in-out disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                  disabled={messages?.length <= 1}
                >
                  Add message
                </button>
                <button
                  onClick={onClickGenerateResponse}
                  className="hover:text-gray-600 transition ease-in-out disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!prompt}
                >
                  Generate response
                </button>
              </div>
            )}
            {data.label === "assistant" &&
              !(nodeId === id && awaitingResponse) && ( // don't show copy and add message buttons when streaming
                <div className="flex justify-between gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickCopy();
                    }}
                    className="hover:text-gray-600 transition ease-in-out"
                  >
                    {copyText}
                  </button>
                  <button
                    onClick={onClickAddPrompt}
                    className="hover:text-gray-600 transition ease-in-out"
                  >
                    Add message
                  </button>
                </div>
              )}
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
            style={{ visibility: awaitingResponse ? "hidden" : "visible" }} // hide bottom handle when streaming response
          />
        )}
      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteNode();
        }}
      />
    </>
  );
}
