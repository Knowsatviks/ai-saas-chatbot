import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
}

function isCodeBlock(str: string) {
  if (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//")
  ) {
    return true;
  }
  return false;
}

function extractLanguage(str: string): { language: string; code: string } {
  const lines = str.split("\n");
  const firstLine = lines[0].trim().toLowerCase();
  
  // Common programming languages
  const languages = [
    "javascript",
    "js",
    "typescript",
    "ts",
    "python",
    "py",
    "java",
    "cpp",
    "c++",
    "csharp",
    "c#",
    "php",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
    "sql",
    "html",
    "css",
    "json",
    "xml",
    "bash",
    "shell",
    "r",
  ];

  // Check if first line matches any language
  const detectedLanguage = languages.find(
    (lang) => firstLine === lang || firstLine.startsWith(lang + " ")
  );

  if (detectedLanguage) {
    // Remove language identifier from code
    const code = lines.slice(1).join("\n").trim();
    return { language: detectedLanguage, code };
  }

  // Default to javascript if no language found
  return { language: "javascript", code: str.trim() };
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();
  return role == "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 5,
        my: 1,
        width: "100%",
      }}
    >
      <Avatar sx={{ ml: "0", flexShrink: 0 }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {!messageBlocks && (
          <Box
            sx={{
              bgcolor: "rgba(0, 255, 252, 0.08)",
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(0, 255, 252, 0.2)",
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                color: "inherit",
              }}
            >
              {content}
            </Typography>
          </Box>
        )}
        {messageBlocks &&
          messageBlocks.length &&
          messageBlocks.map((block, index) => {
            if (isCodeBlock(block)) {
              const { language, code } = extractLanguage(block);
              return (
                <Box
                  key={index}
                  sx={{
                    width: "100%",
                    overflowX: "hidden",
                    mt: 1.5,
                    mb: 1.5,
                    "&:hover": {
                      overflowX: "auto",
                    },
                    "&::-webkit-scrollbar": {
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "3px",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.5)",
                      },
                    },
                  }}
                >
                  <SyntaxHighlighter
                    style={coldarkDark}
                    language={language}
                    customStyle={{
                      margin: 0,
                      borderRadius: "6px",
                      backgroundColor: "#000000",
                      maxWidth: "100%",
                      overflowX: "auto",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </Box>
              );
            }
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(0, 255, 252, 0.08)",
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(0, 255, 252, 0.2)",
                  mt: 0.5,
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    color: "inherit",
                  }}
                >
                  {block}
                </Typography>
              </Box>
            );
          })}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
        width: "100%",
      }}
    >
      <Avatar
        sx={{ ml: "0", bgcolor: "black", color: "white", flexShrink: 0 }}
      >
        {auth?.user?.name[0]}
        {auth?.user?.name && auth?.user?.name.split(" ").length > 1 && auth?.user?.name.split(" ")[1][0]}
      </Avatar>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {!messageBlocks && (
          <Box
            sx={{
              bgcolor: "rgba(0, 255, 252, 0.08)",
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(0, 255, 252, 0.2)",
            }}
          >
            <Typography
              sx={{
                fontSize: "20px",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                color: "inherit",
              }}
            >
              {content}
            </Typography>
          </Box>
        )}
        {messageBlocks &&
          messageBlocks.length &&
          messageBlocks.map((block, index) => {
            if (isCodeBlock(block)) {
              const { language, code } = extractLanguage(block);
              return (
                <Box
                  key={index}
                  sx={{
                    width: "100%",
                    overflowX: "hidden",
                    mt: 1.5,
                    mb: 1.5,
                    "&:hover": {
                      overflowX: "auto",
                    },
                    "&::-webkit-scrollbar": {
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: "3px",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.5)",
                      },
                    },
                  }}
                >
                  <SyntaxHighlighter
                    style={coldarkDark}
                    language={language}
                    customStyle={{
                      margin: 0,
                      borderRadius: "6px",
                      backgroundColor: "#000000",
                      maxWidth: "100%",
                      overflowX: "auto",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </Box>
              );
            }
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: "rgba(0, 255, 252, 0.08)",
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(0, 255, 252, 0.2)",
                  mt: 0.5,
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    color: "inherit",
                  }}
                >
                  {block}
                </Typography>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default ChatItem;