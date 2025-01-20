import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";
import { ChatType } from "@/app/components/types";

interface Props {
  selectedChatID: string | null;
  setSelectedChatID: Dispatch<SetStateAction<string | null>>;
  chats: ChatType[];
  setChats: Dispatch<SetStateAction<ChatType[]>>;
}

export default function SideBar({
  selectedChatID,
  setSelectedChatID,
  chats,
  setChats,
}: Props) {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col ">
      <div className="overflow-auto pl-2 h-full mt-14">
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

      <div className="h-20"></div>
    </div>
  );
}
