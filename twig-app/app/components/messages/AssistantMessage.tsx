import React from "react";
import Box from "@mui/joy/Box";
import { useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./AssistantMessage.css";
import AssistantButtons from "./AssistantButtons";
import CodeHighlighter from "./CodeHighlighter";

interface Props {
  message: string | null;
  streaming?: boolean;
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

const AssistantMessage = ({ message, streaming = false }: Props) => {
  const dispatch = useDispatch();

  return (
    <Box bgcolor="none" color="black" borderRadius={10}>
      <Box pl={0.5} style={{ whiteSpace: "normal", lineHeight: "1.8" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code: (props) => {
              const { children, className } = props;
              const match = /language-(\w+)/.exec(className || ""); // extract code language from className
              return (
                <CodeHighlighter
                  language={match ? match[1] : "text"} // default to normal text if no language
                  code={String(children)}
                />
              );
            },
          }}
        >
          {`${translateLaTex(message)}${streaming ? " ▎" : ""}`}
        </ReactMarkdown>
      </Box>
      {!streaming && <AssistantButtons message={message} />}
    </Box>
  );
};

export default AssistantMessage;
