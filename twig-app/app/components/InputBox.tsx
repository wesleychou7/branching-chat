import Box from "@mui/joy/Box";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/joy/IconButton";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { selectMessages, addMessage } from "./treeSlice";
import {
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
  setStreaming,
} from "@/app/components/messages/messageSlice";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import TextareaAutosize from "react-textarea-autosize";
import OpenAI from "openai";

interface Props {
  setInputBoxHeight: React.Dispatch<React.SetStateAction<number>>;
}

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

export default function InputBox({ setInputBoxHeight }: Props) {
  const dispatch = useDispatch();
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

  const sendMessage = async () => {
    if (validInput) {
      const message = {
        id: selectedNodeId,
        role: "user",
        content: inputMessage,
      };
      dispatch(addMessage(message));
    }
    setInputMessage("");
    dispatch(setAwaitingResponse(true));

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...(messages as ChatCompletionMessageParam[]),
        {
          role: "user",
          content: inputMessage,
        },
      ],
      stream: true,
    });

    if (stream) {
      dispatch(clearStreamedMessage());
      dispatch(setStreaming(true));

      let response = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          dispatch(appendStreamedMessage(content));
          response += content;
        }
      }

      dispatch(
        addMessage({
          id: selectedNodeId,
          role: "assistant",
          content: response,
        })
      );
      dispatch(setStreaming(false));
      dispatch(setAwaitingResponse(false));
    }
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
    <Box ref={inputBoxRef} bgcolor="transparent">
      <Box
        display="flex"
        alignItems="center"
        bgcolor="#eeeeee"
        borderRadius={30}
        py={1}
        pl={3}
        pr={1}
      >
        {/* <IconButton size="sm">
          <AttachFileIcon />
        </IconButton> */}
        <TextareaAutosize
          autoFocus
          maxRows={20}
          style={{
            width: "100%",
            padding: 3,
            border: "none",
            overflowY: "auto",
            backgroundColor: "#eeeeee",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
          placeholder="Send a message"
          value={inputMessage}
          onKeyDown={handleInput}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <IconButton
          size="sm"
          onClick={sendMessage}
          disabled={!validInput}
          style={{
            backgroundColor: validInput ? "black" : "#bdbdbd",
            borderRadius: 100,
          }}
        >
          <ArrowUpwardRoundedIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="center" pt={3}>
          {/* message under the input box */}
      </Box>
    </Box>
  );
}
