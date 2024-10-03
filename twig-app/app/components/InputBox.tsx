import Box from "@mui/joy/Box";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { selectMessages, addMessage } from "./treeSlice";
import { useAPIContext } from "@/app/context/APIContext";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import TextareaAutosize from "react-textarea-autosize";

interface Props {
  setInputBoxHeight: React.Dispatch<React.SetStateAction<number>>;
}

export default function InputBox({ setInputBoxHeight }: Props) {
  const dispatch = useDispatch();
  const APIContext = useAPIContext();
  const selectedNodeId = useSelector(
    (state: RootState) => state.tree.selectedNodeId
  );

  const messages = useSelector(selectMessages);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [validInput, setValidInput] = useState<boolean>(false);

  // Validate input. Only allow messages that are not empty and not only whitespace.
  useEffect(() => {
    const trimmedInput = inputMessage.trim();
    const onlyNewlineCharacters = trimmedInput === "";
    const onlyWhitespaceCharacters = trimmedInput.replace(/\s/g, "") === "";

    if (
      inputMessage !== "" &&
      !onlyNewlineCharacters &&
      !onlyWhitespaceCharacters
    ) {
      setValidInput(true);
    } else {
      setValidInput(false);
    }
  }, [inputMessage]);

  const sendMessage = () => {
    if (validInput) {
      const message = {
        id: selectedNodeId,
        role: "user",
        content: inputMessage,
      };
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

  const handleInput = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // User presses enter key (without shift key). Send message if valid.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (validInput) sendMessage();
    }
  };

  // Send the height value of this entire component to the parent component.
  const inputBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (inputBoxRef.current)
      setInputBoxHeight(inputBoxRef.current.offsetHeight);
  }, [inputMessage, setInputBoxHeight]);

  return (
    <Box ref={inputBoxRef} display="flex">
      <IconButton size="sm">
        <AttachFileIcon />
      </IconButton>

      <TextareaAutosize
        maxRows={12}
        style={{
          width: "100%",
          padding: 3,
          border: "1px solid #ccc",
          overflowY: "auto",
        }}
        value={inputMessage}
        onKeyDown={handleInput}
        onChange={(e) => setInputMessage(e.target.value)}
      />

      <IconButton size="sm" onClick={sendMessage} disabled={!validInput}>
        <SendRoundedIcon />
      </IconButton>
    </Box>
  );
}
