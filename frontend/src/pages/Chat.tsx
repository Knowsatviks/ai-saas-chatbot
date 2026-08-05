import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Button, IconButton, MenuItem, Select, TextField, FormControl, InputLabel, Menu, FormHelperText, Tooltip, Drawer } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { MdStop, MdMoreVert, MdDelete, MdReplay, MdMenu, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  createConversation,
  createPersona,
  deleteConversation,
  deletePersona,
  deleteUserChats,
  getUserChats,
  getUserPersonas,
  renameConversation,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  status?: "failed";
  error?: string;
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuConversationId, setMenuConversationId] = useState<string>("");
  const [renameConversationId, setRenameConversationId] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const selectMenuProps = {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: "rgb(17,29,39)",
          color: "white",
        },
      },
      list: {
        sx: {
          backgroundColor: "rgb(17,29,39)",
          color: "white",
        },
      },
    },
  };

  const activeConversation = conversations.find((conversation) => conversation._id === activeConversationId) || null;
  const isPersonaLockedForActiveConversation = Boolean(
    activeConversation &&
      activeConversation.messages?.length > 0
  );

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

    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newMessage: Message = { id: messageId, role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      setIsLoading(true);
      toast.loading("Sending message...", { id: "chatrequest" });

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
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId ? chatData.conversation : conversation
        )
      );
      toast.success("Response received", { id: "chatrequest" });
    } catch (error: any) {
      console.error(error);
      const failureText =
        error?.response?.data?.message || error?.message || "Failed to send message";
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, status: "failed", error: failureText }
            : msg
        )
      );
      if (error.name === "AbortError") {
        toast.error("Request cancelled", { id: "chatrequest" });
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

  const handleRetryMessage = async (messageId: string, content: string) => {
    setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    if (inputRef.current) {
      inputRef.current.value = content;
    }
    await handleSubmit();
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      toast.loading("Deleting persona...", { id: "deletepersona" });
      await deletePersona(personaId);
      setPersonas((prev) => prev.filter((persona) => persona._id !== personaId));
      if (selectedPersonaId === personaId) {
        setSelectedPersonaId("");
      }
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.personaId === personaId ? { ...conversation, personaId: null } : conversation
        )
      );
      toast.success("Persona deleted", { id: "deletepersona" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete persona", { id: "deletepersona" });
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
        minHeight: "100vh",
        mt: 3,
        gap: 3,
        overflow: "hidden",
      }}
    >
      {!isDrawerOpen && (
        <IconButton
          onClick={() => setIsDrawerOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: "rgba(255,255,255,0.08)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
            p: 1,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.16)",
            },
          }}
        >
          <MdMenu />
        </IconButton>
      )}

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        variant="persistent"
        anchor="left"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "rgb(17,29,39)",
              color: "white",
              width: 320,
              height: "100vh",
              borderRight: "1px solid rgba(255,255,255,0.12)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: 320,
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "white" }}>
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9bdde3" }}>
                You are talking to a ChatBOT
              </Typography>
            </Box>
            <IconButton onClick={() => setIsDrawerOpen(false)} sx={{ color: "white" }}>
              <MdClose />
            </IconButton>
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "white",
                  color: "black",
                  fontWeight: 700,
                }}
              >
                {auth?.user?.name?.[0] || "U"}
                {auth?.user?.name && auth?.user?.name.split(" ").length > 1 && auth?.user?.name.split(" ")[1][0]}
              </Avatar>
            </Box>
            <Typography sx={{ fontSize: "13px", color: "#cfd8dc", textAlign: "center", mb: 2, px: 1 }}>
              You can ask questions related to knowledge, business, advice, education, and more.
            </Typography>

            <Box sx={{ mb: 2 }}>
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
                  sx={{
                    color: "white",
                    borderColor: "white",
                    ".MuiSvgIcon-root": { color: "white" },
                  }}
                  disabled={isPersonaLockedForActiveConversation}
                  MenuProps={selectMenuProps}
                >
                  <MenuItem sx={{ color: "white" }} value="">Default Assistant</MenuItem>
                  {personas.map((persona) => (
                    <MenuItem
                      key={persona._id}
                      value={persona._id}
                      sx={{
                        color: "white",
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      {persona.name}
                    </MenuItem>
                  ))}
                </Select>
                {isPersonaLockedForActiveConversation && (
                  <FormHelperText sx={{ color: "#ff6b6b" }}>
                    Persona locked for active conversation
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "14px", mb: 1, color: "#9bdde3" }}>
                Saved Personas
              </Typography>
              {personas.length === 0 ? (
                <Typography sx={{ color: "#cfd8dc", fontSize: "13px" }}>
                  No saved personas yet.
                </Typography>
              ) : (
                personas.map((persona) => (
                  <Box
                    key={persona._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      bgcolor: "rgba(255,255,255,0.04)",
                      p: 1,
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: "14px" }}>{persona.name}</Typography>
                    <Tooltip title="Delete persona">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePersona(persona._id)}
                        sx={{ color: "white" }}
                      >
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
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
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
            <Typography sx={{ fontSize: "14px", mb: 1, color: "#9bdde3" }}>
              Conversations
            </Typography>
            <Button
              fullWidth
              onClick={handleNewChat}
              sx={{
                mb: 2,
                bgcolor: "#00fffc",
                color: "black",
                fontWeight: 700,
              }}
            >
              New Chat
            </Button>
            {conversations.map((conversation) => {
              const isSelected = activeConversationId === conversation._id;
              const personaLabel = conversation.personaId
                ? personas.find((persona) => persona._id === conversation.personaId)?.name || "Custom Persona"
                : "Default Assistant";

              return (
                <Box
                  key={conversation._id}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: isSelected ? "1px solid #00fffc" : "1px solid rgba(255,255,255,0.12)",
                    bgcolor: isSelected ? "rgba(0,255,252,0.12)" : "transparent",
                    p: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setActiveConversationId(conversation._id);
                        setChatMessages(conversation.messages || []);
                        setRenameDraft(conversation.title);
                        setSelectedPersonaId(conversation.personaId || "");
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        color: isSelected ? "black" : "white",
                        textTransform: "none",
                        p: 0,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>{conversation.title}</Typography>
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        setMenuAnchorEl(event.currentTarget);
                        setMenuConversationId(conversation._id);
                      }}
                    >
                      <MdMoreVert />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontSize: "12px", color: "#9bdde3", mt: 0.5 }}>
                    {personaLabel}
                  </Typography>
                  {renameConversationId === conversation._id && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        placeholder="New title"
                        sx={{ flex: 1, input: { color: "white" } }}
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          handleRenameConversation(conversation._id);
                          setRenameConversationId("");
                        }}
                        sx={{ color: "#00fffc" }}
                      >
                        Save
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => {
                setMenuAnchorEl(null);
                setMenuConversationId("");
              }}
              slotProps={{
                paper: {
                  sx: {
                    backgroundColor: "rgb(17,29,39)",
                    color: "white",
                  },
                },
              }}
            >
              <MenuItem
                sx={{ color: "white" }}
                onClick={() => {
                  setRenameConversationId(menuConversationId);
                  const conversation = conversations.find((item) => item._id === menuConversationId);
                  setRenameDraft(conversation?.title || "");
                  setMenuAnchorEl(null);
                }}
              >
                Rename
              </MenuItem>
              <MenuItem
                sx={{ color: "white" }}
                onClick={() => {
                  handleDeleteConversation(menuConversationId);
                  setMenuAnchorEl(null);
                }}
              >
                Delete
              </MenuItem>
            </Menu>
            <Button
              fullWidth
              onClick={handleDeleteChats}
              sx={{
                mt: 2,
                color: "white",
                fontWeight: "700",
                borderRadius: 3,
                bgcolor: "#e57373",
                ":hover": {
                  bgcolor: "#ff1744",
                },
              }}
            >
              Clear Conversations
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 1, sm: 2, md: 3 },
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "24px", sm: "32px", md: "40px" },
            color: "white",
            mb: 2,
            fontWeight: "600",
            textAlign: "center",
            width: "100%",
            maxWidth: "980px",
          }}
        >
          Model - Gemini-2.5-Flash
        </Typography>
        <Box
          sx={{
            width: "100%",
            maxWidth: "980px",
            height: "60vh",
            borderRadius: 3,
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
            <Box key={chat.id || index}>
              {/*@ts-ignore*/}
              <ChatItem content={chat.content} role={chat.role} />
              {chat.status === "failed" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "rgba(255, 91, 99, 0.12)",
                    p: 1,
                    borderRadius: 2,
                    mb: 1,
                    mt: 0.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "14px", color: "#ff6b6b" }}>
                      Failed to send: {chat.error}
                    </Typography>
                  </Box>
                  <Tooltip title="Retry message">
                    <IconButton
                      size="small"
                      onClick={() => chat.id && handleRetryMessage(chat.id, chat.content)}
                      sx={{ color: "white" }}
                    >
                      <MdReplay />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
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
            maxWidth: "980px",
            borderRadius: 8,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
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
