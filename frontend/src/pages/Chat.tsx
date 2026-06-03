import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Button, IconButton } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { MdStop } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async () => {
    const content = inputRef.current?.value?.trim();

    if (!content) {
      toast.error("Please enter a message");
      return;
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    try {
      setIsLoading(true);
      toast.loading("Sending message...", { id: "chatrequest" });
      
      const newMessage: Message = { role: "user", content };
      setChatMessages((prev) => [...prev, newMessage]);

      abortControllerRef.current = new AbortController();

      const chatData = await sendChatRequest(
        content,
        abortControllerRef.current.signal
      );
      setChatMessages([...chatData.chats]);
      toast.success("Response received", { id: "chatrequest" });
    } catch (error: any) {
      console.error(error);
      if (error.name === "AbortError") {
        toast.error("Request cancelled", { id: "chatrequest" });
        setChatMessages((prev) =>
          prev.filter((msg) => msg.content !== "Thinking...")
        );
      } else {
        toast.error("Failed to send message", { id: "chatrequest" });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      toast.loading("Stopping request...", { id: "chatrequest" });
    }
  };
  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };
  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data:any) => {
          setChatMessages([...data.chats]);
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err:any) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);
  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth]);
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        maxWidth: "100vw",
        height: "100%",
        mt: 3,
        gap: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: { md: "flex", xs: "none", sm: "none" },
          flex: 0.2,
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "60vh",
            bgcolor: "rgb(17,29,39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 1,
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {auth?.user?.name[0]}
            {auth?.user?.name && auth?.user?.name.split(" ").length > 1 && auth?.user?.name.split(" ")[1][0]}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
            You are talking to a ChatBOT
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
            You can ask some questions related to Knowledge, Business, Advices,
            Education, etc. But avoid sharing personal information
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              width: "200px",
              my: "auto",
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              mx: "auto",
              bgcolor: "#e57373",
              ":hover": {
                bgcolor: "#ff1744",
              },
            }}
          >
            Clear Conversation
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: { xs: 1, sm: 2, md: 3 },
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "24px", sm: "32px", md: "40px" },
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Model - Gemini-2.5-Flash
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "hidden",
            scrollBehavior: "smooth",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#00fffc",
              borderRadius: "4px",
              "&:hover": {
                background: "#00e5e5",
              },
            },
          }}
        >
          {chatMessages.map((chat, index) => (
            //@ts-ignore
            <ChatItem content={chat.content} role={chat.role} key={index} />
          ))}
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                p: 2,
                bgcolor: "#004d5612",
                gap: 2,
                borderRadius: 2,
                my: 1,
              }}
            >
              <Avatar sx={{ ml: "0" }}>
                <img src="openai.png" alt="openai" width={"30px"} />
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontStyle: "italic",
                    color: "#00fffc",
                  }}
                >
                  🤔 Thinking...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>
        <Box
          sx={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
            margin: "auto",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            disabled={isLoading}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSubmit();
              }
            }}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "20px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "16px",
              opacity: isLoading ? 0.6 : 1,
            }}
          />
          {isLoading ? (
            <IconButton
              onClick={handleStopRequest}
              sx={{
                color: "#ff6b6b",
                mx: 1,
              }}
              title="Stop request"
            >
              <MdStop size={24} />
            </IconButton>
          ) : (
            <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
              <IoMdSend />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
