import Box from "@mui/joy/Box";

interface Props {
  message: string | null;
}

const UserMessage = ({ message }: Props) => {
  return (
    <Box bgcolor="#eeeeee" color="black" padding={1.5} borderRadius={15}>
      {message}
    </Box>
  );
};

export default UserMessage;
