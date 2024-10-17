import Box from "@mui/joy/Box";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectMessages } from "../treeSlice";
import type { RootState } from "@/app/store";
import supabase from "@/app/supabase";

type Message = {
  role: string;
  content: string | null;
};

export default function Messages() {
  // const messages = useSelector(selectMessages);
  const streaming = useSelector((state: RootState) => {
    return state.message.streaming;
  });
  const streamedMessage = useSelector((state: RootState) => {
    return state.message.streamedMessage;
  });
  const selectedChatId = useSelector((state: RootState) => {
    return state.tree.selectedChatId;
  });
  const updateMessagesFlag = useSelector((state: RootState) => {
    return state.tree.updateMessagesFlag;
  })

  const [messages, setMessages] = useState<Message[]>([]);

  async function getMessages(chat_id: number) {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);

    setMessages(data as Message[]);
  }

  useEffect(() => {
    if (selectedChatId) getMessages(selectedChatId);
  }, [selectedChatId, updateMessagesFlag]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  return (
    <Box mb={8} height="100%" overflow="auto">
      {messages
        .filter((message) => message.role !== "system")
        .map((message, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            alignItems={message.role === "user" ? "flex-end" : "flex-start"}
            marginBottom={5}
            whiteSpace="pre-wrap"
            sx={{ wordBreak: "break-word" }}
            position="relative" // need for fixing LaTex absolute position bug
          >
            {message.role === "user" ? (
              <UserMessage message={message.content} />
            ) : (
              <AssistantMessage message={message.content} />
            )}
          </Box>
        ))}
      <div ref={messagesEndRef} />
      {streaming && (
        <Box position="relative">
          <AssistantMessage message={streamedMessage} streaming={true} />
        </Box>
      )}
    </Box>
  );
}
