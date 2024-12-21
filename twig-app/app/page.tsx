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
import { PiSidebarSimpleBold } from "react-icons/pi";

type Chat = {
  chat_id: number;
  name: string;
};

export default function Home() {
  const [page, setPage] = useState<"chat" | "tree">("tree");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedChatID, setSelectedChatID] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

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

  async function getChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, name")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setChats(data as Chat[]);
  }

  useEffect(() => {
    if (selectedChatID) getMessages(selectedChatID);
    else setMessages([]);
  }, [selectedChatID]);

  useEffect(() => {
    getChats();

    const subscription = supabase
      .channel("chats_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        () => {
          getChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <div
        className={`fixed top-0 left-0 z-50 h-full w-2/12 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideBar
          selectedChatID={selectedChatID}
          setSelectedChatID={setSelectedChatID}
          chats={chats}
        />
      </div>
      <button
        className="absolute top-2 left-2 z-50 p-1.5 rounded-lg hover:bg-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <PiSidebarSimpleBold size={25} />
      </button>

      <div className="h-full w-full z-0">
        <Tree messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}
