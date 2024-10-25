import Box from "@mui/joy/Box";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ParkRoundedIcon from "@mui/icons-material/ParkRounded";
import SquareRoundedIcon from "@mui/icons-material/SquareRounded";
import IconButton from "@mui/joy/IconButton";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
  setStreaming,
} from "@/app/components/messages/messageSlice";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import TextareaAutosize from "react-textarea-autosize";
import OpenAI from "openai";
import supabase from "@/app/supabase";
import { MessageType } from "@/app/components/types";

interface Props {
  setInputBoxHeight: React.Dispatch<React.SetStateAction<number>>;
  selectedChatID: number | null;
  setSelectedChatID: React.Dispatch<React.SetStateAction<number | null>>;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  setPage: React.Dispatch<React.SetStateAction<"chat" | "tree">>;
}

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
});

export default function InputBox({
  setInputBoxHeight,
  selectedChatID,
  setSelectedChatID,
  messages,
  setMessages,
  setPage,
}: Props) {
  const dispatch = useDispatch();
  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const [currentParentID, setCurrentParentID] = useState<number | null>(null);
  useEffect(() => {
    setCurrentParentID(messages[messages.length - 1]?.id || null);
  }, [messages]);

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

  async function generateChatName(
    userMessage: string,
    assistantResponse: string
  ) {
    const chatName = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the conversation in 4 words or fewer, using title case. Be as concise as possible. Do not use any punctutaion.",
        },
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: assistantResponse,
        },
      ],
    });
    if (chatName) return chatName.choices[0].message.content;
    else return "A Conversation";
  }

  async function createNewChat() {
    const { data, error } = await supabase
      .from("chats")
      .insert({ name: "(New chat)" })
      .select();
    if (error) console.error(error);
    if (data) {
      setSelectedChatID(data[0].chat_id);
      return data[0].chat_id;
    }
    return null;
  }

  async function saveMessage(
    chat_id: number | null,
    role: string,
    content: string,
    parent_id: number | null = null
  ) {
    if (!chat_id) chat_id = await createNewChat();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chat_id,
        parent_id: parent_id,
        role: role,
        content: content,
      })
      .select();
    if (error) console.error(error);

    if (data) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data[0].id,
          parent_id: parent_id,
          role: role,
          content: content,
        },
      ]);
      return [chat_id, data[0].id];
    }
    return [null, null];
  }

  const sendMessage = async () => {
    let userInput = inputMessage;
    let apiResponse = "";
    const needNewChatName = messages.length <= 1;

    if (validInput) {
      setInputMessage("");
      dispatch(setAwaitingResponse(true));

      const [chat_id, userMessageID] = await saveMessage(
        selectedChatID,
        "user",
        userInput,
        currentParentID
      );

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          ...(messages as ChatCompletionMessageParam[]),
          {
            role: "user",
            content: userInput,
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

        apiResponse = response;
        await saveMessage(chat_id, "assistant", response, userMessageID);
        dispatch(setStreaming(false));
        dispatch(setAwaitingResponse(false));

        if (needNewChatName) {
          const chatName = await generateChatName(userInput, response);
          const { error } = await supabase
            .from("chats")
            .update({ name: chatName })
            .eq("chat_id", chat_id);
          if (error) console.error(error);
        }
      }
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

  // console.log(messages);

  return (
    <Box
      ref={inputBoxRef}
      bgcolor="transparent"
      display="flex"
      alignItems="end"
      pb={3}
    >
      <IconButton
        onClick={() => {
          setPage("tree");
        }}
        sx={{
          height: 48.5,
          border: "none",
          borderRadius: 30,
          paddingLeft: 1.7,
          paddingRight: 1.7,
          backgroundColor: "#eeeeee",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >
        <ParkRoundedIcon sx={{ color: "green" }} />
      </IconButton>
      <Box
        ml={1}
        display="flex"
        alignItems="end"
        bgcolor="#eeeeee"
        borderRadius={30}
        py={1}
        pl={2.5}
        pr={1}
        width="100%"
      >
        {/* <IconButton size="sm">
          <AttachFileIcon />
        </IconButton> */}
        <TextareaAutosize
          autoFocus
          maxRows={20}
          style={{
            marginBottom: 3,
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
          disabled={awaitingResponse}
        />
        {!awaitingResponse && (
          <IconButton
            size="sm"
            onClick={sendMessage}
            disabled={!validInput}
            style={{
              backgroundColor: validInput ? "green" : "#bdbdbd",
              borderRadius: 100,
            }}
          >
            <ArrowUpwardRoundedIcon sx={{ color: "white" }} />
          </IconButton>
        )}
        {awaitingResponse && (
          <IconButton
            size="sm"
            style={{
              backgroundColor: "black",
              borderRadius: 100,
            }}
          >
            <SquareRoundedIcon sx={{ color: "white", fontSize: 15 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
