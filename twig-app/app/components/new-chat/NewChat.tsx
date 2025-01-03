import { useState, useEffect } from "react";
import SideBar from "@/app/components/sidebar/SideBar";
import Tree from "@/app/components/tree/Tree";
import supabase from "@/app/supabase";
import { ChatType, MessageType } from "@/app/components/types";
import { v4 as uuidv4 } from "uuid";

interface NewChatProps {
    newChat: boolean;
    setNewChat: React.Dispatch<React.SetStateAction<boolean>>;
    setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
    setSelectedChatID: React.Dispatch<React.SetStateAction<string | null>>;
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

export default function NewChat({ newChat, setNewChat, setChats, setSelectedChatID, setMessages }: NewChatProps) {
//   const createNewChat = async () => {
//     // update chat state
//     const newChat: ChatType = {
//       id: uuidv4(),
//       name: "New Chat",
//     };
//     setChats((prevChats) => [newChat, ...prevChats]);
//     setSelectedChatID(newChat.id);

//     // update database
//     const response = await supabase
//       .from("chats")
//       .insert({ id: newChat.id, name: newChat.name });

//     if (response.error) console.error(response.error);
//   };

  const initialMessage: MessageType = {
    id: uuidv4(),
    parent_id: null,
    role: "user",
    content: "",
  };

  return (
    <div className="w-full h-full">
      <Tree
        selectedChatID={null}
        setSelectedChatID={setSelectedChatID}
        setChats={setChats}
        messages={[initialMessage]}
        setMessages={setMessages}
        newChat={newChat}
        setNewChat={setNewChat}
      />
    </div>
  );
}
