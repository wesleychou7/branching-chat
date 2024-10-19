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
      px={2.5}
      borderRadius={30}
      maxWidth={500}
      lineHeight={1.5}
    >
      {message}
    </Box>
  );
};

export default UserMessage;
