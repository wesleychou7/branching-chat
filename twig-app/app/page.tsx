"use client";
import { useState, useEffect, useMemo, createContext } from "react";
import SideBar from "@/app/components/sidebar/SideBar";
import Tree from "@/app/components/tree/Tree";
import supabase from "@/app/supabase";
import { ChatType, MessageType } from "@/app/components/types";
import { PiSidebarSimpleBold } from "react-icons/pi";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import { IoIosArrowDown } from "react-icons/io";
import { createNewChat } from "@/app/components/sidebar/SideBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactFlowProvider } from "@xyflow/react";

type Model = {
  name: string;
  alias: string;
};
export const ModelContext = createContext<Model>({
  name: "",
  alias: "",
});

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedChatID, setSelectedChatID] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [modelName, setModelName] = useState<string>("GPT-4o");
  const [modelAlias, setModelAlias] = useState<string>("chatgpt-4o-latest");

  async function getMessages(chat_id: string) {
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
    <ModelContext.Provider
      value={{
        name: modelName,
        alias: modelAlias,
      }}
    >
      <div className="w-screen h-screen">
        <div
          className={`fixed top-0 left-0 z-50 h-full w-2/12 duration-300 ${
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
        <div className="absolute top-0 left-0 z-50 text-gray-600">
          <div className="flex p-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-gray-200 rounded-lg p-1.5 mr-1 transition ease-in-out"
            >
              <PiSidebarSimpleBold size={25} />
            </button>

            <div
              className={`flex items-center duration-300 ${
                sidebarOpen ? "translate-x-40" : "-translate-x-0"
              }`}
            >
              <button
                className={`hover:bg-gray-200 rounded-lg p-1.5 pt-[3px] transition ease-in-out ${
                  sidebarOpen ? "mr-4" : ""
                }`}
                onClick={() =>
                  createNewChat(setChats, setSelectedChatID, setMessages)
                }
              >
                <MapsUgcRoundedIcon fontSize="medium" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="hover:bg-gray-200 rounded-lg px-2 h-full flex items-center gap-1 transition ease-in-out cursor-pointer">
                    <div className="font-medium">{modelName}</div>
                    <IoIosArrowDown />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="font-normal text-gray-400 text-xs">
                    Select a model
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setModelName("GPT-4o");
                      setModelAlias("chatgpt-4o-latest");
                    }}
                  >
                    GPT-4o
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setModelName("GPT-4o mini");
                      setModelAlias("gpt-4o-mini");
                    }}
                  >
                    GPT-4o mini
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setModelName("Claude 3.5 Sonnet");
                      setModelAlias("claude-3-5-sonnet-latest");
                    }}
                  >
                    Claude 3.5 Sonnet
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setModelName("Claude 3.5 Haiku");
                      setModelAlias("claude-3-5-haiku-latest");
                    }}
                  >
                    Claude 3.5 Haiku
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="h-full w-full z-0">
          <ReactFlowProvider>
            {useMemo(
              () => (
                <Tree
                  selectedChatID={selectedChatID}
                  setSelectedChatID={setSelectedChatID}
                  setChats={setChats}
                  messages={messages}
                  setMessages={setMessages}
                />
              ),
              [selectedChatID, messages, setMessages]
            )}
          </ReactFlowProvider>
        </div>
      </div>
    </ModelContext.Provider>
  );
}
