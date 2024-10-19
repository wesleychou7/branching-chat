import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import { Dispatch, SetStateAction } from "react";
import supabase from "@/app/supabase";

interface Props {
  setSideBarOpen: Dispatch<SetStateAction<boolean>>;
  selectedChatID: number | null;
  setSelectedChatID: Dispatch<SetStateAction<number | null>>;
}

type Chat = {
  chat_id: number;
  name: string;
};

const SideBar = ({
  setSideBarOpen,
  selectedChatID,
  setSelectedChatID,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);

  async function getChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, name");

    if (error) console.error(error);

    setChats(data as Chat[]);
  }

  useEffect(() => {
    getChats();
  }, []);

  if (open) {
    return (
      <Box height="100%" width={300} bgcolor="#eeeeee" zIndex={100}>
        <Box width="100%" p={1}>
          <IconButton onClick={() => setOpen(false)}>
            <MenuRoundedIcon />
          </IconButton>
        </Box>

        <Box display="flex" flexDirection="column">
          <Button
            onClick={() => setSelectedChatID(null)}
            sx={{ mb: 2, bgcolor: "green" }}
          >
            New chat
          </Button>
          {chats.map((chat) => (
            <Button
              key={chat.chat_id}
              onClick={() => setSelectedChatID(chat.chat_id)}
              sx={{ mb: 1 }}
              color={selectedChatID === chat.chat_id ? "primary" : "neutral"}
            >
              {chat.name}
            </Button>
          ))}
        </Box>
      </Box>
    );
  } else {
    return (
      <Box height="100%" width={50} bgcolor="transparent">
        <Box width="100%" p={1} zIndex={100}>
          <IconButton onClick={() => setOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }
};

export default SideBar;
