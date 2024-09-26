import Box from "@mui/joy/Box";
import { useState } from "react";
import InputBox from "./InputBox";
import Messages from "./Messages";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const Chat = () => {

  return (
    <Box
      position="relative"
      // height="97vh"
      display="flex"
      flexDirection="column"
    >
      <Box height="100%" overflow="auto">
        <Messages />
      </Box>

      <Box width="100%">
        <InputBox />
      </Box>
    </Box>
  );
}

export default Chat;
