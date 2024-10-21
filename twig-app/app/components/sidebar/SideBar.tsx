import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import IconButton from "@mui/joy/IconButton";
import SavedChat from "./SavedChat";
import { Dispatch, SetStateAction } from "react";
import supabase from "@/app/supabase";
import { Transition } from "react-transition-group";

interface Props {
  selectedChatID: number | null;
  setSelectedChatID: Dispatch<SetStateAction<number | null>>;
}

type Chat = {
  chat_id: number;
  name: string;
};

const duration = 250;
const defaultStyle = {
  transition: `width ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
  width: 0,
};
const transitionStyles = {
  entering: { width: 300, opacity: 1 },
  entered: { width: 300, opacity: 1 },
  exiting: { width: 0, opacity: 0 },
  exited: { width: 0, opacity: 0 },
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

  const nodeRef = useRef(null);

  return (
    <>
      <Transition nodeRef={nodeRef} in={open} unmountOnExit timeout={duration}>
        {(state) => (
          <Box
            height="100%"
            bgcolor="#f5f5f5"
            zIndex={100}
            ref={nodeRef}
            sx={{
              ...defaultStyle,
              ...transitionStyles[state as keyof typeof transitionStyles],
            }}
            onMouseLeave={() => setOpen(false)}
          >
            <Box height="13%">
              <Box p={1.3} display="flex" flexDirection="column">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    Twig
                  </Box>
                  <IconButton
                    onClick={() => setOpen(false)}
                    sx={{
                      transition: "background-color 0.1s ease-in-out",
                      "&:hover": {
                        bgcolor: "#e0e0e0",
                      },
                    }}
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Button
                  variant="plain"
                  startDecorator={<MapsUgcRoundedIcon fontSize="small" />}
                  onClick={() => setSelectedChatID(null)}
                  sx={{
                    border: "1px solid green",
                    borderRadius: 7,
                    cursor: "pointer",
                    color: "green",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: "left",
                    transition: "background-color 0.1s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#c8e6c9",
                    },
                  }}
                >
                  Start a new chat
                </Button>
              </Box>
            </Box>
            <Box height="82%" overflow="auto">
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
            <Box height="5%">{/* Profile */}</Box>
          </Box>
        )}
      </Transition>

      <Box
        position="absolute"
        top={0}
        left={0} 
        height="100%"
        width={100}
        bgcolor="transparent"
        onMouseEnter={() => setOpen(true)}
        zIndex={-1}
      >
        <Box
          width="100%"
          p={1.3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              transition: "background-color 0.1s ease-in-out",
              "&:hover": {
                bgcolor: "#e0e0e0",
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default SideBar;
