"use client";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import SideBar from "@/app/components/sidebar/SideBar";
import MenuBar from "@/app/components/MenuBar";
import Tree from "@/app/components/tree/Tree";
import Chat from "@/app/components/Chat";
import supabase from "@/app/supabase";
import { MessageType } from "@/app/components/types";

export default function Home() {
  const [page, setPage] = useState<"chat" | "tree">("chat");
  const [selectedChatID, setSelectedChatID] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  async function getMessages(chat_id: number) {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else
      setMessages([
        {
          id: -1,
          parent_id: null,
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...(data as MessageType[]),
      ]);
  }
  useEffect(() => {
    if (selectedChatID) getMessages(selectedChatID);
    else setMessages([]);
  }, [selectedChatID]);

  return (
    <Grid container>
      <Box
        position="absolute"
        top={0}
        left={0}
        zIndex={100}
        width={300}
        height="100vh"
      >
        <SideBar
          selectedChatID={selectedChatID}
          setSelectedChatID={setSelectedChatID}
        />
      </Box>

      <Box height="100vh" width="100vw">
        {page === "tree" && (
          <div style={{ height: "100vh", width: "100vw" }}>
            <Tree messages={messages} />
          </div>
        )}
        {page === "chat" && (
          <div>
            <Box position="absolute" top={0} left={80} right={0} zIndex={0}>
              <MenuBar />
            </Box>

            <Chat
              selectedChatID={selectedChatID}
              setPage={setPage}
              setSelectedChatID={setSelectedChatID}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        )}
      </Box>
    </Grid>
  );
}
