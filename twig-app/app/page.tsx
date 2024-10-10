"use client";
import { useState, useEffect, useRef } from "react";
import { selectMessages } from "./components/treeSlice";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import SideBar from "@/app/components/SideBar";
import MenuBar from "@/app/components/MenuBar";
import Messages from "@/app/components/messages/Messages";
import InputBox from "@/app/components/InputBox";

export default function Home() {
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(0);

  // Automatic scrolling implementation
  const [previousScrollTop, setPreviousScrollTop] = useState<number>(0);
  const [reachedBottom, setReachedBottom] = useState<boolean>(false);
  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const messages = useSelector(selectMessages);
  const bottomOfMessagesRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // automatically scroll to bottom
  useEffect(() => {
    if (reachedBottom) bottomOfMessagesRef.current?.scrollIntoView();
  }, [messages, reachedBottom]);

  // listen to scroll event
  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
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
      if (messagesContainerRef.current)
        messagesContainerRef.current.removeEventListener(
          "scroll",
          handleScroll
        );
    };
  }, [previousScrollTop]);

  // automatically scroll to bottom when user enters new message
  useEffect(() => {
    if (awaitingResponse) setReachedBottom(true);
  }, [awaitingResponse]);

  return (
    <Box>
      <Grid container>
        {sideBarOpen && (
          <Grid size={3}>
            <SideBar setSideBarOpen={setSideBarOpen} />
          </Grid>
        )}
        <Grid size={sideBarOpen ? 9 : 12}>
          <Box
            ref={messagesContainerRef}
            height={`calc(100vh - ${inputBoxHeight}px)`}
            overflow="auto"
          >
            <Box position="sticky" top="0" zIndex={0}>
              <MenuBar
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
              />
            </Box>
            <Box display="flex" justifyContent="center" flexGrow={1}>
              <Box width={750}>
                <Messages />
              </Box>
            </Box>
            <div ref={bottomOfMessagesRef}></div>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box width={750}>
              <InputBox setInputBoxHeight={setInputBoxHeight} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
