import React, { useRef } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import IconButton from "@mui/joy/IconButton";
import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";

interface Props {
  selectedChatID: number | null;
  setSelectedChatID: Dispatch<SetStateAction<number | null>>;
  chats: Chat[];
}

type Chat = {
  chat_id: number;
  name: string;
};

const SideBar = ({ selectedChatID, setSelectedChatID, chats }: Props) => {
  const nodeRef = useRef(null);

  return (
    <div className="w-full h-full bg-gray-50 p-2 flex flex-col">
      <div className="flex justify-end h-12">
        <button>Twig</button>
      </div>

      <button className="flex items-center justify-center w-full p-2 border-2 border-green-700 rounded-lg hover:bg-green-100 mb-5">
        <MapsUgcRoundedIcon fontSize="small" style={{ color: "green" }} />
        <div className="ml-2 text-sm text-green-700">Start a new chat</div>
      </button>

      <div className=" overflow-auto">
        {chats.map((chat) => (
          <SavedChat
            key={chat.chat_id}
            name={chat.name}
            chat_id={chat.chat_id}
            selectedChatID={selectedChatID}
            setSelectedChatID={setSelectedChatID}
          />
        ))}
      </div>
    </div>
  );
};

export default SideBar;
