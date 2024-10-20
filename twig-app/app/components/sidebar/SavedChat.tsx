import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Dispatch, SetStateAction } from "react";
import supabase from "@/app/supabase";

interface Props {
  name: string;
  chat_id: number;
  selectedChatID: number | null;
  setSelectedChatID: React.Dispatch<React.SetStateAction<number | null>>;
}

const SavedChat = ({
  name,
  chat_id,
  selectedChatID,
  setSelectedChatID,
}: Props) => {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius={7}
      sx={{
        backgroundColor: selectedChatID === chat_id ? "#e0e0e0" : "transparent",
        transition: "background-color 0.1s ease-in-out",
        "&:hover": {
          backgroundColor: "#e0e0e0",
        },
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => setSelectedChatID(chat_id)}
        style={{
          cursor: "pointer",
          paddingLeft: 12,
          paddingRight: 0,
          width: "100%",
          overflow: "hidden",
          textAlign: "left",
          fontSize: "0.9rem",
          border: "none",
          backgroundColor: "transparent",
          height: 35,
        }}
      >
        <Box
          overflow="hidden"
          textOverflow={hover ? "clip" : "ellipsis"}
          whiteSpace="nowrap"
        >
          {name}
        </Box>
      </button>
      {hover && (
        <IconButton
          sx={{
            minHeight: 35,
            padding: 0,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default SavedChat;
