"use client";
import { useState, useEffect } from "react";
import SideBar from "@/app/components/sidebar/SideBar";
import Tree from "@/app/components/tree/Tree";
import supabase from "@/app/supabase";
import { ChatType, MessageType } from "@/app/components/types";
import { PiSidebarSimpleBold } from "react-icons/pi";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedChatID, setSelectedChatID] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);

  async function getMessages(chat_id: string) {
    console.log("GOT MESSAGEs");
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setMessages([...(data as MessageType[])]);
  }

  async function getChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setChats(data as ChatType[]);
  }

  useEffect(() => {
    if (selectedChatID) getMessages(selectedChatID);
    else setMessages([]);
  }, [selectedChatID]);

  useEffect(() => {
    getChats();
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
          setChats={setChats}
        />
      </div>
      <button
        className="absolute top-2 left-2 z-50 p-1.5 rounded-lg hover:bg-gray-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <PiSidebarSimpleBold size={25} />
      </button>

      <div className="h-full w-full z-0">
        <Tree
          selectedChatID={selectedChatID}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}
