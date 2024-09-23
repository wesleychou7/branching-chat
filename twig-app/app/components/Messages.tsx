import Box from "@mui/joy/Box";
import { useSelector, useDispatch } from "react-redux";
import { selectMessages } from "./treeSlice";
import { marked } from "marked";

export default function Messages() {
  const messages = useSelector(selectMessages);

  const userStyle = {
    backgroundColor: "blue",
    color: "white",
  };

  const assistantStyle = {
    backgroundColor: "none",
    color: "black",
  };

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
            marginBottom={3}
          >
            <Box
              sx={message.role === "user" ? userStyle : assistantStyle}
              padding={1}
              borderRadius={10}
            >
              <Box
                margin={0}
                dangerouslySetInnerHTML={{
                  __html: marked.parse(message.content || ""),
                }}
              />
            </Box>
          </Box>
        ))}
    </Box>
  );
}
