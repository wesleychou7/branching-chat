import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import { addNode } from "../treeSlice";
import { useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Props {
  message: string | null;
}

const translateLaTex = (val: string | null): string => {
  if (!val) return "";
  if (val.indexOf("\\") == -1) return val;

  return val
    .replaceAll("\\(", "$$") // inline math
    .replaceAll("\\)", "$$")
    .replaceAll("\\[", "$$$") // display math
    .replaceAll("\\]", "$$$");
};

const AssistantMessage = ({ message }: Props) => {
  const dispatch = useDispatch();

  console.log(translateLaTex(message)); // Check the output here

  return (
    <Box bgcolor="none" color="black" borderRadius={10}>
      <Box style={{ whiteSpace: "normal", lineHeight: "1.8" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        >
          {translateLaTex(message)}
        </ReactMarkdown>
      </Box>
      <Button onClick={() => dispatch(addNode())}>Branch</Button>
    </Box>
  );
};

export default AssistantMessage;
