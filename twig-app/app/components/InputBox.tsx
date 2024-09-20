import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";
import { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { addMessage } from "./treeSlice";

export default function InputBox() {
  const dispatch = useDispatch();
  
  const selectedNodeId = useSelector(
    (state: RootState) => state.tree.selectedNodeId
  );
  const [value, setValue] = useState<string>("");

  const sendMessage = () => {
    if (value !== "") {
      const message = { id: selectedNodeId, role: "user", content: value };
      dispatch(addMessage(message));
    }
    setValue("");
  };
  
  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value !== "") sendMessage();
  };

  return (
    <Input
      placeholder="Message Twig"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleEnter}
      endDecorator={
        <IconButton size="sm" onClick={sendMessage} disabled={value === ""}>
          <SendRoundedIcon />
        </IconButton>
      }
    />
  );
}
