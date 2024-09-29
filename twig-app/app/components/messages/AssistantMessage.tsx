import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { addNode } from "../treeSlice";
import { useDispatch } from "react-redux";
import { marked } from "marked";

interface Props {
  message: string | null;
}

const AssistantMessage = ({ message }: Props) => {
  const dispatch = useDispatch();

  return (
    <Box bgcolor="none" color="black" borderRadius={10}>
      <Box
        margin={0}
        dangerouslySetInnerHTML={{
          __html: marked.parse(message || ""),
        }}
      />
      <Button onClick={() => dispatch(addNode())}>
         Branch
      </Button>
    </Box>
  );
};

export default AssistantMessage;
