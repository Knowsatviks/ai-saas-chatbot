import axios from "axios";

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const res = await axios.post("/user/signup", { name, email, password });
    if (res.status !== 201) {
      throw new Error("Unable to Signup");
    }
    const data = await res.data;
    return data;
  } catch (error: any) {
    // Extract error message from backend response
    const message = error?.response?.data?.message || "Unable to Signup";
    throw new Error(message);
  }
};

export const loginUser = async (email: string, password:string)=>{
    const res = await axios.post("/user/login", {email, password});

    if(res.status !== 201){
        throw new Error("Unable to login");
    }
    const data = res.data;

    return data;
}

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};

export const checkAuthStatus = async ()=>{
    const res = await axios.get("/user/auth-status");

    if(res.status !== 200){
        throw new Error("Unable to authenticate userin");
    }
    const data = res.data;

    return data;
}

export const createConversation = async (payload: { title?: string; personaId?: string | null }) => {
  const res = await axios.post("/chat/conversations", payload);

  if (res.status !== 201) {
    throw new Error("Unable to create conversation");
  }

  return res.data;
};

export const getConversations = async () => {
  const res = await axios.get("/chat/conversations");

  if (res.status !== 200) {
    throw new Error("Unable to get conversations");
  }

  return res.data;
};

export const renameConversation = async (conversationId: string, title: string) => {
  const res = await axios.put("/chat/conversations/rename", { conversationId, title });

  if (res.status !== 200) {
    throw new Error("Unable to rename conversation");
  }

  return res.data;
};

export const deleteConversation = async (conversationId: string) => {
  const res = await axios.delete("/chat/conversations", { data: { conversationId } });

  if (res.status !== 200) {
    throw new Error("Unable to delete conversation");
  }

  return res.data;
};

export const sendChatRequest = async (conversationId: string, message: string, personaId?: string | null, signal?: AbortSignal) => {
    const res = await axios.post("/chat/new", { conversationId, message, personaId }, { signal });

    if (res.status !== 200) {
        throw new Error("Unable to send chat");
    }
    const data = res.data;

    return data;
}

export const getUserPersonas = async () => {
  const res = await axios.get("/chat/personas");

  if (res.status !== 200) {
    throw new Error("Unable to get personas");
  }

  return res.data;
};

export const createPersona = async (payload: {
  name: string;
  description?: string;
  personality?: string;
  tone?: string;
}) => {
  const res = await axios.post("/chat/personas", payload);

  if (res.status !== 201) {
    throw new Error("Unable to create persona");
  }

  return res.data;
};

export const deletePersona = async (personaId: string) => {
  const res = await axios.delete("/chat/personas", { data: { personaId } });
  if (res.status !== 200) {
    throw new Error("Unable to delete persona");
  }
  return res.data;
};

export const getUserChats = async () => {
    const res = await axios.get("/chat/conversations");

    if (res.status !== 200) {
        throw new Error("Unable to get chats");
    }
    const data = res.data;

    return data;
}

export const deleteUserChats = async () => {
    return { message: "Conversation deletion is handled per conversation" };
}
