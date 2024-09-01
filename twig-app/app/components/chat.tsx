import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";
import { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import InputBox from "./InputBox";
import Messages from "./Messages";

interface Message {
  role: "user" | "system";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: "hello" },
    { role: "system", content: "Hello! How can I help you today?" },
    { role: "user", content: "What is your name?" },
    {
      role: "system",
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
        <Messages messages={messages} />
      </Box>

      <Box width="100%">
        <InputBox setMessages={setMessages} />
      </Box>
    </Box>
  );
}
