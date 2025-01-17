import Box from "@mui/joy/Box";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useState } from "react";
import { Refractor } from "react-refractor";
import { registerAllLanguages } from "./languages";
import "prism-themes/themes/prism-vsc-dark-plus.css";
import "./CodeHighlighter.css";
import { ErrorBoundary } from "react-error-boundary";

registerAllLanguages();

interface Props {
  language: string;
  code: string;
}

// code to render if language is not supported/specified
const TextCode = ({ code, className }: { code: string; className: string }) => {
  return (
    <code
      className={className}
      style={{
        backgroundColor: "#eeee",
        padding: "4px",
        borderRadius: "5px",
        fontSize: "14px",
      }}
    >
      {code}
    </code>
  );
};

const CodeHighlighter = ({ language, code }: Props) => {
  const [copyButtonClicked, setCopyButtonClicked] = useState<boolean>(false);

  const onCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyButtonClicked(true);
    if (code) navigator.clipboard.writeText(code);
    // show checkmark for 2 seconds
    setTimeout(() => {
      setCopyButtonClicked(false);
    }, 2000);
  };

  if (language === "text") {
    return (
      <code
        style={{
          backgroundColor: "#eeee",
          padding: "4px",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        {code}
      </code>
    );
  }

  return (
    <Box maxWidth="750px" position="relative" my={1}>
      <Box
        color="#e6e6e6"
        bgcolor="#3e3e42"
        py={0.5}
        px="15px"
        sx={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box fontSize="12px">{language}</Box>

        <button
          onClick={onCopyClick}
          style={{
            padding: 0,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {copyButtonClicked ? (
            <CheckRoundedIcon
              fontSize="small"
              sx={{ width: 17, height: "auto", color: "#e6e6e6" }}
            />
          ) : (
            <ContentCopyRoundedIcon
              fontSize="small"
              sx={{ width: 17, height: "auto", color: "#e6e6e6" }}
            />
          )}
        </button>
      </Box>
      
      <ErrorBoundary fallback={<TextCode code={code} className="refractor" />}>
        <Refractor language={language} value={code} className="refractor" />
      </ErrorBoundary>
    </Box>
  );
};

export default CodeHighlighter;
