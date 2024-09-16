import Box from "@mui/joy/Box";
import { useState } from "react";
import InputBox from "./InputBox";
import Messages from "./Messages";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "hello" },
    { role: "assistant", content: "Hello! How can I help you today?" },
    { role: "user", content: "What is your name?" },
    {
      role: "assistant",
      content: "My name is Twig. I am here to help. What can I do for you?",
    },
  ]);

  return (
    <Box
      position="relative"
      height="97vh"
      display="flex"
      flexDirection="column"
    >
      <Box height="100%" overflow="auto">
        <Messages />
      </Box>

      <Box width="100%">
        <InputBox setMessages={setMessages} />
      </Box>
    </Box>
  );
}
