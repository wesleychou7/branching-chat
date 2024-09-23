import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";
import { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { selectMessages, addMessage } from "./treeSlice";
import { useAPIContext } from "@/app/context/APIContext";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export default function InputBox() {
  const dispatch = useDispatch();
  const APIContext = useAPIContext();

  const selectedNodeId = useSelector(
    (state: RootState) => state.tree.selectedNodeId
  );
  const messages = useSelector(selectMessages);
  const [inputMessage, setInputMessage] = useState<string>("");

  const sendMessage = () => {
    if (inputMessage !== "") {
      const message = { id: selectedNodeId, role: "user", content: inputMessage };
      dispatch(addMessage(message));
    }
    setInputMessage("");

    APIContext?.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: [
          ...(messages as ChatCompletionMessageParam[]),
          {
            role: "user",
            content: inputMessage,
          },
        ],
      })
      ?.then((response) => {
        dispatch(
          addMessage({
            id: selectedNodeId,
            role: "assistant",
            content: response.choices[0].message.content,
          })
        );
      });
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputMessage !== "") sendMessage();
  };

  return (
    <Input
      placeholder="Message Twig"
      value={inputMessage}
      onChange={(event) => setInputMessage(event.target.value)}
      onKeyDown={handleEnter}
      endDecorator={
        <IconButton size="sm" onClick={sendMessage} disabled={inputMessage === ""}>
          <SendRoundedIcon />
        </IconButton>
      }
    />
  );
}
