import Box from "@mui/joy/Box";

interface Props {
  message: string | null;
}

const UserMessage = ({ message }: Props) => {
  return (
    <Box
      bgcolor="#eeeeee"
      color="black"
      padding={2}
      borderRadius={15}
      maxWidth={500}
    >
      {message}
    </Box>
  );
};

export default UserMessage;
