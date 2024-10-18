import Box from "@mui/joy/Box";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

type Message = {
  role: string;
  content: string | null;
};

interface Props {
  messages: Message[];
}

export default function Messages({ messages }: Props) {
  const streaming = useSelector((state: RootState) => {
    return state.message.streaming;
  });
  const streamedMessage = useSelector((state: RootState) => {
    return state.message.streamedMessage;
  });

  return (
    <Box mt={8} height="100%" overflow="auto">
      {useMemo(
        () =>
          messages
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
            )),
        [messages]
      )}
      {streaming && (
        <AssistantMessage message={streamedMessage} streaming={true} />
      )}
    </Box>
  );
}
