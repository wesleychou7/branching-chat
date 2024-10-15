import Box from "@mui/joy/Box";

interface Props {
  message: string | null;
}

const UserMessage = ({ message }: Props) => {
  return (
    <Box
      bgcolor="#eeeeee"
      color="black"
      py={1.5}
      px={2}
      borderRadius={100}
      maxWidth={500}
    >
      {message}
    </Box>
  );
};

export default UserMessage;
