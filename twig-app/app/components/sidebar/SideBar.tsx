import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";
import { MessageType, ChatType } from "@/app/components/types";
import { v4 as uuidv4 } from "uuid";
import supabase from "@/app/supabase";

interface Props {
  selectedChatID: string | null;
  setSelectedChatID: Dispatch<SetStateAction<string | null>>;
  chats: ChatType[];
  setChats: Dispatch<SetStateAction<ChatType[]>>;
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
}

export async function createNewChat(
  setChats: Dispatch<SetStateAction<ChatType[]>>,
  setSelectedChatID: Dispatch<SetStateAction<string | null>>,
  setMessages: Dispatch<SetStateAction<MessageType[]>>
) {
  // update database first
  const newChatID = uuidv4();
  const newMessageID = uuidv4();

  const chatResponse = await supabase
    .from("chats")
    .insert({ id: newChatID, name: "(New Chat)" });

  if (chatResponse.error) {
    console.error(chatResponse.error);
    return;
  }

  const messageResponse = await supabase.from("messages").insert({
    id: newMessageID,
    chat_id: newChatID,
    parent_id: null,
    role: "user",
    content: "",
  });

  if (messageResponse.error) {
    console.error(messageResponse.error);
    return;
  }

  // update local state after database operations succeed
  const newChat: ChatType = {
    id: newChatID,
    name: "(New Chat)",
  };
  setChats((prevChats) => [newChat, ...prevChats]);
  setSelectedChatID(newChat.id);

  const newMessage: MessageType = {
    id: newMessageID,
    parent_id: null,
    role: "user",
    content: "",
  };
  setMessages([newMessage]);
}

export default function SideBar({
  selectedChatID,
  setSelectedChatID,
  chats,
  setChats,
  setMessages,
}: Props) {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      <div className="flex justify-end h-12 p-2">
        <button>Twig</button>
      </div>

      <div className="p-2">
        <button
          onClick={() =>
            createNewChat(setChats, setSelectedChatID, setMessages)
          }
          className="flex items-center justify-center w-full p-2 border-2 border-green-700 rounded-lg hover:bg-green-100 mb-5"
        >
          <MapsUgcRoundedIcon fontSize="small" style={{ color: "green" }} />
          <div className="ml-2 text-sm text-green-700">Start a new chat</div>
        </button>
      </div>

      <div className="overflow-auto pl-2">
        {chats.map((chat) => (
          <div key={chat.id} className="mb-1 pr-2">
            <SavedChat
              name={chat.name}
              chat_id={chat.id}
              selectedChatID={selectedChatID}
              setSelectedChatID={setSelectedChatID}
              setChats={setChats}
            />
          </div>
        ))}
      </div>

      <div className="h-20 border border-red-200"></div>
    </div>
  );
}
