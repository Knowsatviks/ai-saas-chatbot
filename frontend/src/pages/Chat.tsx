import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Button, IconButton, MenuItem, Select, TextField, FormControl, InputLabel } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { MdStop } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  createConversation,
  createPersona,
  deleteConversation,
  deleteUserChats,
  getUserChats,
  getUserPersonas,
  renameConversation,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Persona = {
  _id: string;
  name: string;
  description?: string;
  personality?: string;
  tone?: string;
};

type Conversation = {
  _id: string;
  title: string;
  messages: Message[];
  personaId?: string | null;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [renameDraft, setRenameDraft] = useState<string>("");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("");
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [personaPersonality, setPersonaPersonality] = useState("");
  const [personaTone, setPersonaTone] = useState("");
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

      let conversationId = activeConversationId;
      if (!conversationId) {
        const createdConversation = await createConversation({
          title: content.slice(0, 40),
          personaId: selectedPersonaId || null,
        });
        conversationId = createdConversation.conversation._id;
        setActiveConversationId(conversationId);
        setConversations((prev) => [createdConversation.conversation, ...prev]);
      }

      const chatData = await sendChatRequest(
        conversationId,
        content,
        selectedPersonaId || null,
        abortControllerRef.current.signal
      );
      setChatMessages(chatData.conversation.messages || []);
      setConversations((prev) => prev.map((conversation) => conversation._id === conversationId ? chatData.conversation : conversation));
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
      setConversations([]);
      setActiveConversationId("");
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  const handleNewChat = async () => {
    try {
      const createdConversation = await createConversation({
        title: "New Conversation",
        personaId: selectedPersonaId || null,
      });
      setActiveConversationId(createdConversation.conversation._id);
      setChatMessages([]);
      setConversations((prev) => [createdConversation.conversation, ...prev]);
      setRenameDraft("");
      toast.success("Started a new chat", { id: "newchat" });
    } catch (error) {
      console.error(error);
      toast.error("Unable to start a new chat");
    }
  };

  const handleRenameConversation = async (conversationId: string) => {
    if (!renameDraft.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const data = await renameConversation(conversationId, renameDraft.trim());
      setConversations((prev) => prev.map((conversation) => conversation._id === conversationId ? data.conversation : conversation));
      toast.success("Conversation renamed");
    } catch (error) {
      console.error(error);
      toast.error("Unable to rename conversation");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      const remainingConversations = conversations.filter((conversation) => conversation._id !== conversationId);
      setConversations(remainingConversations);
      if (activeConversationId === conversationId) {
        setActiveConversationId(remainingConversations[0]?._id || "");
        setChatMessages(remainingConversations[0]?.messages || []);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete conversation");
    }
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim()) {
      toast.error("Persona name is required");
      return;
    }

    try {
      toast.loading("Creating persona...", { id: "createpersona" });
      const data = await createPersona({
        name: personaName.trim(),
        description: personaDescription.trim(),
        personality: personaPersonality.trim(),
        tone: personaTone.trim(),
      });

      setPersonas((prev) => [data.persona, ...prev]);
      setSelectedPersonaId(data.persona._id);
      setPersonaName("");
      setPersonaDescription("");
      setPersonaPersonality("");
      setPersonaTone("");
      toast.success("Persona created", { id: "createpersona" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create persona", { id: "createpersona" });
    }
  };
  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      Promise.all([getUserChats(), getUserPersonas()])
        .then(([chatData, personaData]: any) => {
          const fetchedConversations = chatData.conversations || [];
          setConversations(fetchedConversations);
          if (fetchedConversations.length > 0) {
            setActiveConversationId(fetchedConversations[0]._id);
            setChatMessages(fetchedConversations[0].messages || []);
          }
          setPersonas(personaData.personas || []);
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
            overflowY: "auto",
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

          <Box sx={{ px: 2, mb: 2 }}>
            <Typography sx={{ fontSize: "14px", mb: 1, color: "#9bdde3" }}>
              Conversations
            </Typography>
            <Button
              fullWidth
              onClick={handleNewChat}
              sx={{
                mb: 1,
                bgcolor: "#00fffc",
                color: "black",
                fontWeight: 700,
              }}
            >
              New Chat
            </Button>
            {conversations.map((conversation) => (
              <Box key={conversation._id} sx={{ mb: 1 }}>
                <Button
                  fullWidth
                  onClick={() => {
                    setActiveConversationId(conversation._id);
                    setChatMessages(conversation.messages || []);
                    setRenameDraft(conversation.title);
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    color: activeConversationId === conversation._id ? "black" : "white",
                    bgcolor: activeConversationId === conversation._id ? "#00fffc" : "rgba(255,255,255,0.08)",
                  }}
                >
                  {conversation.title}
                </Button>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <TextField
                    size="small"
                    value={activeConversationId === conversation._id ? renameDraft : conversation.title}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    placeholder="Rename"
                    sx={{ flex: 1, input: { color: "white" } }}
                  />
                  <Button size="small" onClick={() => handleRenameConversation(conversation._id)} sx={{ color: "#00fffc" }}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => handleDeleteConversation(conversation._id)} sx={{ color: "#ff6b6b" }}>
                    Del
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ px: 2, mb: 2 }}>
            <Typography sx={{ fontSize: "14px", mb: 1, color: "#9bdde3" }}>
              Active Persona
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="persona-select-label" sx={{ color: "white" }}>
                Persona
              </InputLabel>
              <Select
                labelId="persona-select-label"
                value={selectedPersonaId}
                label="Persona"
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                sx={{ color: "white", borderColor: "white" }}
              >
                <MenuItem value="">Default Assistant</MenuItem>
                {personas.map((persona) => (
                  <MenuItem key={persona._id} value={persona._id}>
                    {persona.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ px: 2, mb: 2 }}>
            <Typography sx={{ fontSize: "14px", mb: 1, color: "#9bdde3" }}>
              Create Persona
            </Typography>
            <TextField
              label="Name"
              size="small"
              fullWidth
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              sx={{ mb: 1, input: { color: "white" }, label: { color: "#9bdde3" } }}
            />
            <TextField
              label="Description"
              size="small"
              fullWidth
              value={personaDescription}
              onChange={(e) => setPersonaDescription(e.target.value)}
              sx={{ mb: 1, input: { color: "white" }, label: { color: "#9bdde3" } }}
            />
            <TextField
              label="Personality"
              size="small"
              fullWidth
              value={personaPersonality}
              onChange={(e) => setPersonaPersonality(e.target.value)}
              sx={{ mb: 1, input: { color: "white" }, label: { color: "#9bdde3" } }}
            />
            <TextField
              label="Tone"
              size="small"
              fullWidth
              value={personaTone}
              onChange={(e) => setPersonaTone(e.target.value)}
              sx={{ mb: 1, input: { color: "white" }, label: { color: "#9bdde3" } }}
            />
            <Button
              onClick={handleCreatePersona}
              fullWidth
              sx={{ bgcolor: "#00fffc", color: "black", fontWeight: 700 }}
            >
              Save Persona
            </Button>
          </Box>

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
