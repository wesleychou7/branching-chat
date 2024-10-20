import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";
import supabase from "@/app/supabase";

interface Props {
  selectedChatID: number | null;
  setSelectedChatID: Dispatch<SetStateAction<number | null>>;
}

type Chat = {
  chat_id: number;
  name: string;
};

const SideBar = ({ selectedChatID, setSelectedChatID }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);

  async function getChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("chat_id, name")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setChats(data as Chat[]);
  }

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

  if (open) {
    return (
      <Box height="100%" width={300} bgcolor="#f5f5f5" zIndex={100}>
        <Box height="10%">
          <Box p={1.3}>
            <IconButton onClick={() => setOpen(false)}>
              <MenuRoundedIcon />
            </IconButton>

            <Button
              onClick={() => setSelectedChatID(null)}
              sx={{ mb: 2, bgcolor: "green" }}
            >
              New chat
            </Button>
          </Box>
        </Box>
        <Box height="90%" overflow="auto">
          <Box p={1.3} mb={10}>
            {chats.map((chat) => (
              <SavedChat
                key={chat.chat_id}
                name={chat.name}
                chat_id={chat.chat_id}
                selectedChatID={selectedChatID}
                setSelectedChatID={setSelectedChatID}
              />
            ))}
          </Box>
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
