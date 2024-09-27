import Box from "@mui/joy/Box";
import InputBox from "./InputBox";
import Messages from "./Messages";

const Chat = () => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box flexGrow={1}>
        <Messages />
      </Box>

      <Box mb={4}>
        <InputBox />
      </Box>
    </Box>
  );
};

export default Chat;
