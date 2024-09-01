import Box from "@mui/joy/Box";
import Input from "@mui/joy/Input";
import { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface Props {
  setMessages: React.Dispatch<React.SetStateAction<any>>;
}

export default function InputBox({ setMessages }: Props) {
  const [value, setValue] = useState<string>("");

  const sendMessage = () => {
    if (value !== "") {
      setMessages((prevMessages: any) => [
        ...prevMessages,
        { role: "user", content: value },
        { role: "system", content: "Hello! How can I help you today?" },
      ]);
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
