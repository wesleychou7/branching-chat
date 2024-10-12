import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Box from "@mui/joy/Box";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useState } from "react";

interface Props {
  language: string;
  code: string;
}

const CodeHighlighter = ({ language, code }: Props) => {
  const [copyButtonClicked, setCopyButtonClicked] = useState<boolean>(false);

  const onCopyClick = () => {
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
  } else {
    return (
      <Box maxWidth="750px" position="relative">
        <Box
          color="#e6e6e6"
          bgcolor="#3e3e42"
          py={1}
          px={1.5}
          sx={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>{language}</Box>

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
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "23px",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            maxWidth: "750px",
            overflow: "auto",
            background: "#252526",
          }}
          codeTagProps={{
            style: {
              fontSize: "inherit",
              lineHeight: "inherit",
            },
          }}
        >
          {code.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </Box>
    );
  }
};

export default CodeHighlighter;
