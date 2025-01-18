import { useRef, useState, useEffect, useContext } from "react";
import { Handle, Position } from "@xyflow/react";
import { MessageType, ChatType } from "@/app/components/types";
import TextareaAutosize from "react-textarea-autosize";
import supabase from "@/app/supabase";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { ModelContext } from "@/app/page";
import { UserContext } from "@/app/page";
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
import { translateLaTex } from "@/lib/utils";
import "katex/dist/katex.min.css";
import "./AssistantMessage.css";
import CodeHighlighter from "./CodeHighlighter";
import DeleteModal from "./DeleteModal";

export default function Node({
  id,
  data,
  selectedChatID,
  setChats,
  messages,
  setMessages,
}: any) {
  const model = useContext(ModelContext);
  const userID = useContext(UserContext).id;
  const [prompt, setPrompt] = useState<string>(data.value);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copyText, setCopyText] = useState<string>("Copy");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [initialHeight, setInitialHeight] = useState<number>(0);
  const [hideBottomHandle, setHideBottomHandle] = useState<boolean>(false);

  // redux for streaming response
  const dispatch = useDispatch();
  const nodeId = useSelector((state: RootState) => state.message.nodeId);
  const awaitingResponse = useSelector((state: RootState) =>
    state.message.nodeId === id ? state.message.awaitingResponse : false
  );
  const streamedMessage = useSelector((state: RootState) =>
    state.message.nodeId === id ? state.message.streamedMessage : ""
  );

  // useEffect(() => {
  //   // update messages state
  //   if (data.value !== prompt) {
  //     setMessages((prev: MessageType[]) =>
  //       prev.map((msg) => (msg.id === id ? { ...msg, content: prompt } : msg))
  //     );
  //   }

  //   // update message in database after user stops typing for 1 seconds
  //   timeoutRef.current = setTimeout(async () => {
  //     const response = await supabase
  //       .from("messages")
  //       .update({ content: prompt })
  //       .eq("id", id);

  //     if (response.error) console.error(response.error);
  //   }, 1000);

  //   return () => clearTimeout(timeoutRef.current);
  // }, [prompt, id]);

  useEffect(() => {
    if (prompt !== data.value) setIsEditing(true);
  }, [prompt]);

  const handleBlur = async (e?: React.FocusEvent) => {
    // if (e) {
    //   const relatedTarget = e.relatedTarget as HTMLElement;
    //   if (
    //     relatedTarget?.id === "generate-response-button"
    //     // relatedTarget?.id === "delete-button" ||
    //     // relatedTarget?.id === "add-message-button"
    //   ) {
    //     return;
    //   }
    // }

    if (isEditing) {
      // update messages state
      setMessages((prev: MessageType[]) =>
        prev.map((msg) => (msg.id === id ? { ...msg, content: prompt } : msg))
      );
      // save message to database
      const response = await supabase
        .from("messages")
        .update({ content: prompt })
        .eq("id", id);

      if (response.error) console.error(response.error);
      setIsEditing(false);
    }
  };

  // code to hide the bottom handle when textarea expands.
  useEffect(() => {
    if (textareaRef.current) {
      setInitialHeight(textareaRef.current.clientHeight);
      setHideBottomHandle(false);
    }
  }, []);
  function onHeightChange() {
    if (textareaRef.current && initialHeight > 0) {
      const currentHeight = textareaRef.current.clientHeight;
      setHideBottomHandle(currentHeight > initialHeight);
    }
  }

  // focus textarea and prevent scroll
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

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
    const openaiApiKey = localStorage.getItem("openai-api-key");
    const anthropicApiKey = localStorage.getItem("anthropic-api-key");

    const response = await fetch("/api/chat-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: userMessage,
        assistantResponse: assistantResponse,
        openaiApiKey: openaiApiKey,
        anthropicApiKey: anthropicApiKey,
      }),
    });
    if (!response.ok) {
      // fallback name
      return "A Conversation";
    }
    const data = await response.json();
    return data.name || "A Conversation";
  }

  async function onClickGenerateResponse() {
    const responseId = uuidv4();
    dispatch(setNodeId(responseId));
    dispatch(setAwaitingResponse(true));
    dispatch(clearStreamedMessage());

    await handleBlur();

    const modelNameUsed = model.name;
    const modelAliasUsed = model.alias;

    // Update the current user-node prompt in local state
    setMessages((prev: MessageType[]) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content: prompt } : msg))
    );

    // Add an empty assistant response in local state
    const newMessage: MessageType = {
      id: responseId,
      parent_id: id,
      role: "assistant",
      model_name: modelNameUsed,
      content: "",
    };
    setMessages((prev: MessageType[]) => [...prev, newMessage]);

    // Retrieve *all* messages by traversing up this node's ancestors
    const parentMessages: MessageType[] = (function () {
      const result: MessageType[] = [];
      let currentId: string | null = id;

      while (currentId) {
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

    // STREAMING from /api/llm
    let accumulatedContent = "";
    try {
      const openaiApiKey = localStorage.getItem("openai-api-key");
      const anthropicApiKey = localStorage.getItem("anthropic-api-key");

      const res = await fetch("/api/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelAlias: modelAliasUsed,
          messages: parentMessages,
          openaiApiKey: openaiApiKey,
          anthropicApiKey: anthropicApiKey,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error: ${errorText}`);
        return;
      }

      if (!res.body) {
        throw new Error("No response body from /api/llm.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value);
          accumulatedContent += chunkValue;
          // Dispatch streaming tokens to Redux
          dispatch(appendStreamedMessage(chunkValue));
        }
      }
    } catch (err) {
      console.error("Error streaming from LLM:", err);
    }

    // Once complete, store the final accumulated content in local state
    setMessages((prev: MessageType[]) => {
      return prev.map((msg) =>
        msg.id === responseId ? { ...msg, content: accumulatedContent } : msg
      );
    });

    dispatch(setAwaitingResponse(false));

    // Add a new blank user message after response is complete
    const newUserMessage: MessageType = {
      id: uuidv4(),
      parent_id: responseId,
      role: "user",
      content: "",
    };
    setMessages((prev: MessageType[]) => [...prev, newUserMessage]);

    // do not do database updates if user is not signed in
    if (!userID) return;

    // Update the user prompt in the DB
    const response1 = await supabase
      .from("messages")
      .update({ content: prompt })
      .eq("id", id);

    if (response1.error) console.error(response1.error);

    // If this is the first or only message, generate & store a chat name
    if (messages.length <= 1) {
      const chatName = await generateChatName(prompt, accumulatedContent);
      setChats((prev: ChatType[]) => {
        const newChats = [...prev];
        const index = newChats.findIndex((chat) => chat.id === selectedChatID);
        if (index !== -1) {
          newChats[index].name = chatName;
        }
        return newChats;
      });

      const responseName = await supabase
        .from("chats")
        .update({ name: chatName })
        .eq("id", selectedChatID);

      if (responseName.error) console.error(responseName.error);
    }

    // Insert the assistant's final content into the DB
    const response2 = await supabase.from("messages").insert({
      id: responseId,
      chat_id: selectedChatID,
      parent_id: id,
      role: "assistant",
      model_name: modelNameUsed,
      content: accumulatedContent,
    });

    if (response2.error) console.error(response2.error);

    // Insert the new blank user message into the DB
    const response3 = await supabase.from("messages").insert({
      id: newUserMessage.id,
      chat_id: selectedChatID,
      parent_id: responseId,
      role: "user",
      content: "",
    });

    if (response3.error) console.error(response3.error);
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
        ref={nodeRef}
      >
        <div
          className={`${
            data.label === "user" ? "bg-gray-50" : "bg-white"
          } border 
          ${
            data.label === "user" ? "border-gray-400" : "border-gray-300"
          } rounded-lg w-[800px] p-2`}
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
                id="delete-button"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    if (prompt.trim()) {
                      onClickGenerateResponse();
                    }
                  }
                }
              }}
              // onBlur={handleBlur}
              onBlurCapture={handleBlur}
              onClick={(e) => {
                e.stopPropagation(); // this is so that i can click directly into the textarea
              }}
              onHeightChange={onHeightChange}
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
                  id="add-message-button"
                >
                  Add message
                </button>
                <button
                  onClick={onClickGenerateResponse}
                  className="hover:text-gray-600 transition ease-in-out disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!prompt.trim()}
                  id="generate-response-button"
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
            style={{
              visibility:
                awaitingResponse || hideBottomHandle ? "hidden" : "visible",
            }} // hide bottom handle when streaming response or when textarea is expanded
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
