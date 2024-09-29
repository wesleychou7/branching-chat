import Box from "@mui/joy/Box";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import { useSelector } from "react-redux";
import { selectMessages } from "../treeSlice";

export default function Messages() {
  const messages = useSelector(selectMessages);

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
          >
            {message.role === "user" ? (
              <UserMessage message={message.content} />
            ) : (
              <AssistantMessage message={message.content} />
            )}
          </Box>
        ))}
    </Box>
  );
}
