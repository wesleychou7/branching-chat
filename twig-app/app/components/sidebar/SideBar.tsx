import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";
import { ChatType } from "@/app/components/types";
import { v4 as uuidv4 } from "uuid";
import supabase from "@/app/supabase";

interface Props {
  selectedChatID: string | null;
  setSelectedChatID: Dispatch<SetStateAction<string | null>>;
  chats: ChatType[];
  setChats: Dispatch<SetStateAction<ChatType[]>>;
}

const SideBar = ({
  selectedChatID,
  setSelectedChatID,
  chats,
  setChats,
}: Props) => {
  const createNewChat = async () => {
    // update chat state
    const newChat: ChatType = {
      id: uuidv4(),
      name: "New Chat",
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setSelectedChatID(newChat.id);

    // update database
    const response = await supabase
      .from("chats")
      .insert({ id: newChat.id, name: newChat.name });

    if (response.error) console.error(response.error);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-2 flex flex-col">
      <div className="flex justify-end h-12">
        <button>Twig</button>
      </div>

      <button
        onClick={createNewChat}
        className="flex items-center justify-center w-full p-2 border-2 border-green-700 rounded-lg hover:bg-green-100 mb-5"
      >
        <MapsUgcRoundedIcon fontSize="small" style={{ color: "green" }} />
        <div className="ml-2 text-sm text-green-700">Start a new chat</div>
      </button>

      <div className="overflow-auto">
        {chats.map((chat) => (
          <div key={chat.id} className="mb-1">
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
    </div>
  );
};

export default SideBar;
