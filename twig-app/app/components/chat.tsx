import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";
import { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

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
    <Box position="relative" border="1px solid black" height="97vh">
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

      <Box position="absolute" bottom={10} width="100%">
        <Input
          placeholder="Message Twig"
          endDecorator={
            <IconButton size="sm">
              <SendRoundedIcon />
            </IconButton>
          }
        />
      </Box>
    </Box>
  );
}
