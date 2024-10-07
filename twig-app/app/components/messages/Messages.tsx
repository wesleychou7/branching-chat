import Box from "@mui/joy/Box";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import { useSelector } from "react-redux";
import { selectMessages } from "../treeSlice";
import type { RootState } from "@/app/store";

export default function Messages() {
  const messages = useSelector(selectMessages);
  const streaming = useSelector((state: RootState) => {
    return state.message.streaming;
  });
  const streamedMessage = useSelector((state: RootState) => {
    return state.message.streamedMessage;
  });

  return (
    <Box>
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
          >
            {message.role === "user" ? (
              <UserMessage message={message.content} />
            ) : (
              <AssistantMessage message={message.content} />
            )}
          </Box>
        ))}
      {streaming && (
        <AssistantMessage message={streamedMessage} streaming={true} />
      )}
    </Box>
  );
}
