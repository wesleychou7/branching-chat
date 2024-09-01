import Box from "@mui/joy/Box";
import { useState } from "react";

interface Message {
  role: "user" | "system";
  content: string;
}

interface Props {
  messages: Message[];
}

export default function Messages({ messages }: Props) {
  return (
    <Box>
      {messages.map((message, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          alignItems={message.role === "user" ? "flex-end" : "flex-start"}
          marginBottom={3}
        >
          <Box
            sx={{
              backgroundColor: message.role === "user" ? "blue" : "gray",
            }}
            color="white"
            padding={1}
            borderRadius={10}
          >
            {message.content}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
