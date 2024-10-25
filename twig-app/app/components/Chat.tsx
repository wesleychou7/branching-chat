import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import Messages from "@/app/components/messages/Messages";
import InputBox from "@/app/components/messages/InputBox";
import { MessageType } from "@/app/components/types";

interface Props {
  selectedChatID: number | null;
  setPage: Dispatch<SetStateAction<"chat" | "tree">>;
  setSelectedChatID: Dispatch<SetStateAction<number | null>>;
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
}

const Chat = ({
  selectedChatID,
  setSelectedChatID,
  setPage,
  messages,
  setMessages,
}: Props) => {
  // Automatic scrolling
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(0);
  const [previousScrollTop, setPreviousScrollTop] = useState<number>(0);
  const [reachedBottom, setReachedBottom] = useState<boolean>(false);
  const bottomOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const streamedMessage = useSelector((state: RootState) => {
    return state.message.streamedMessage;
  });

  // automatically scroll to bottom
  useEffect(() => {
    if (reachedBottom) bottomOfMessagesRef.current?.scrollIntoView();
  }, [messages, streamedMessage, reachedBottom]);
  // listen to scroll event
  useEffect(() => {
    const container = messagesContainerRef.current;
    const handleScroll = () => {
      if (container) {
        const scrolledTo =
          (container.scrollTop ?? 0) + (container.clientHeight ?? 0);
        const isReachBottom = container.scrollHeight === scrolledTo;

        // check if scroll is at the bottom
        if (isReachBottom) setReachedBottom(true);
        // Check if user scrolled up
        if (container.scrollTop < previousScrollTop) setReachedBottom(false);

        setPreviousScrollTop(container.scrollTop);
      }
    };
    if (messagesContainerRef.current)
      messagesContainerRef.current.addEventListener("scroll", handleScroll);

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [previousScrollTop]);
  // automatically scroll to bottom when user enters new message
  useEffect(() => {
    if (awaitingResponse) setReachedBottom(true);
  }, [awaitingResponse]);

  return (
    <Box height="100%" width="100%">
      <Box
        ref={messagesContainerRef}
        height={`calc(100vh - ${inputBoxHeight}px)`}
        overflow="auto"
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box width={700}>
          {/* todo: make responsive. might need to pass in device size from page.tsx */}
          <Box pt={8} pb={8}>
            <Messages messages={messages} />
          </Box>
        </Box>
        <div ref={bottomOfMessagesRef} />
      </Box>
      <Box width="100%" display="flex" justifyContent="center">
        <Box width={750}>
          <InputBox
            setInputBoxHeight={setInputBoxHeight}
            selectedChatID={selectedChatID}
            setSelectedChatID={setSelectedChatID}
            messages={messages}
            setMessages={setMessages}
            setPage={setPage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
