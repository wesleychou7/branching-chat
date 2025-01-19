"use client";
import { useState, useEffect, useMemo, createContext, useRef } from "react";
import SideBar from "@/app/components/sidebar/SideBar";
import Tree from "@/app/components/tree/Tree";
import supabase from "@/app/supabase";
import { ChatType, MessageType } from "@/app/components/types";
import { PiSidebarSimpleBold } from "react-icons/pi";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import { IoIosArrowDown } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ReactFlowProvider } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import Profile from "@/app/components/profile/Profile";
import { Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";
import SignInWithGoogle from "@/app/components/profile/SignInWithGoogle";
import Tooltip from "@mui/joy/Tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaKey } from "react-icons/fa";
import { RootState } from "@/app/store";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/app/components/tree/messageSlice";

type Model = {
  name: string;
  alias: string;
};

type User = {
  id: string | null;
};

export const ModelContext = createContext<Model>({
  name: "",
  alias: "",
});

export const UserContext = createContext<User>({
  id: null,
});

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null); // if user is signed in or not
  const [userID, setUserID] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // dialog for api keys
  const [selectedChatID, setSelectedChatID] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [modelName, setModelName] = useState<string>("Insert API Key");
  const [modelAlias, setModelAlias] = useState<string>("");
  const [flowKey, setFlowKey] = useState(0); // to force ReactFlow to re-render (so fitView works when you change chats)
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  const openaiInputRef = useRef<HTMLInputElement>(null); // refs to store API keys
  const anthropicInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.message.messages);

  // check if user is signed in
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        if (session) {
          setUserID(session.user.id);
        } else {
          setUserID(null);
          setSidebarOpen(false);
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession((prevSession) => {
          if (JSON.stringify(prevSession) !== JSON.stringify(session)) {
            return session;
          }
          return prevSession;
        });

        if (session) {
          setUserID(session.user.id);
        } else {
          setUserID(null);
          setSidebarOpen(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Initialize refs with localStorage values when dialog opens
  const handleDialogOpen = () => {
    if (openaiInputRef.current) {
      openaiInputRef.current.value =
        localStorage.getItem("openai-api-key") || "";
    }
    if (anthropicInputRef.current) {
      anthropicInputRef.current.value =
        localStorage.getItem("anthropic-api-key") || "";
    }
    setDialogOpen(true);
  };

  function checkAPIKeys() {
    const openaiKey = localStorage.getItem("openai-api-key");
    const anthropicKey = localStorage.getItem("anthropic-api-key");

    if (openaiKey) {
      setModelName("GPT-4o");
      setModelAlias("chatgpt-4o-latest");
    } else if (anthropicKey) {
      setModelName("Claude 3.5 Sonnet");
      setModelAlias("claude-3-5-sonnet-latest");
    } else {
      setModelName("Insert API Key");
      setModelAlias("");
    }
  }

  useEffect(() => {
    checkAPIKeys();
  }, []);

  const handleSaveChanges = () => {
    // Save api keys to localStorage
    localStorage.setItem("openai-api-key", openaiInputRef.current?.value || "");
    localStorage.setItem(
      "anthropic-api-key",
      anthropicInputRef.current?.value || ""
    );
    setDialogOpen(false);
    checkAPIKeys();
  };

  // show blank chat
  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (session && !initialLoadRef.current) {
      initialLoadRef.current = true;
      showBlankChat();
    }
  }, [session]);

  async function getMessages(chat_id: string) {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else dispatch(setMessages([...(data as MessageType[])]));
  }

  async function getChats() {
    if (!session) return; // prevent operation when not authenticated
    const { data, error } = await supabase
      .from("chats")
      .select("id, name")
      .eq("user_id", userID)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setChats(data as ChatType[]);
  }

  // load messages
  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      dispatch(setMessages([
        {
          id: uuidv4(),
          parent_id: null,
          role: "user",
          content: "",
        },
      ]));
    } else {
      if (selectedChatID) getMessages(selectedChatID);
      else dispatch(setMessages([]));
    }
  }, [session, selectedChatID, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (session) getChats();
    else setChats([]);
  }, [session, isLoading]);

  async function showBlankChat() {
    if (!session) return; // prevent operation when not authenticated
    const { data, error } = await supabase
      .from("chats")
      .select(
        `
          id,
          name,
          created_at,
          messages (
            id,
            chat_id,
            content
          )
        `
      )
      .eq("user_id", userID)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) console.error(error);

    if (data && data.length > 0) {
      const [chat] = data;

      // 3) Check if this top-most chat is named "(New Chat)"
      //    and verify there's exactly 1 message with empty content.
      if (
        chat.name === "(New Chat)" &&
        chat.messages &&
        chat.messages.length === 1 &&
        chat.messages[0].content === ""
      ) {
        // blank chat found
        setSelectedChatID(data[0].id);
      } else {
        // no blank chat found, create a new one
        await createNewChat();
      }
    }
  }

  async function createNewChat() {
    setShowWelcome(true);

    if (!session) {
      dispatch(setMessages([
        {
          id: uuidv4(),
          parent_id: null,
          role: "user",
          content: "",
        },
      ]));
      setFlowKey((oldKey) => oldKey + 1);
      return;
    }

    // update database first
    const newChatID = uuidv4();
    const newMessageID = uuidv4();

    const chatResponse = await supabase
      .from("chats")
      .insert({ id: newChatID, name: "(New Chat)", user_id: userID });

    if (chatResponse.error) {
      console.error(chatResponse.error);
      return;
    }

    const messageResponse = await supabase.from("messages").insert({
      id: newMessageID,
      chat_id: newChatID,
      parent_id: null,
      role: "user",
      content: "",
    });

    if (messageResponse.error) {
      console.error(messageResponse.error);
      return;
    }

    // update local state after database operations succeed
    const newChat: ChatType = {
      id: newChatID,
      name: "(New Chat)",
    };
    setChats((prevChats) => {
      // Check if chat with same ID already exists
      const chatExists = prevChats.some((chat) => chat.id === newChat.id);
      if (chatExists) return prevChats;
      return [newChat, ...prevChats];
    });
    setSelectedChatID(newChat.id);

    const newMessage: MessageType = {
      id: newMessageID,
      parent_id: null,
      role: "user",
      content: "",
    };
    dispatch(setMessages([newMessage]));
  }

  // whenever selectedChatID changes, increment flowKey to force ReactFlow to re-render
  useEffect(() => {
    setFlowKey((oldKey) => oldKey + 1);
  }, [selectedChatID]);

  return (
    <ModelContext.Provider
      value={{
        name: modelName,
        alias: modelAlias,
      }}
    >
      <UserContext.Provider
        value={{
          id: userID,
        }}
      >
        <div className="w-screen h-screen">
          {!isLoading && (
            <>
              <div className="fixed top-2 right-3 z-50">
                {session && <Profile session={session} />}
                {!session && (
                  <Tooltip
                    title="Sign in to save chat history"
                    variant="solid"
                    arrow
                  >
                    <div>
                      <SignInWithGoogle />
                    </div>
                  </Tooltip>
                )}
              </div>
              <div
                className={`fixed top-0 left-0 z-50 h-full w-[252px] duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <SideBar
                  selectedChatID={selectedChatID}
                  setSelectedChatID={setSelectedChatID}
                  chats={chats}
                  setChats={setChats}
                />
              </div>
              <div className="fixed top-0 left-0 z-50 text-gray-600">
                <div className="flex p-2">
                  {session && ( // don't show sidebar button if user is not signed in
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="hover:bg-gray-200 rounded-lg p-1.5 mr-1 transition ease-in-out"
                    >
                      <PiSidebarSimpleBold size={25} />
                    </button>
                  )}
                  <div
                    className={`flex items-center duration-300 ${
                      sidebarOpen ? "translate-x-40" : "-translate-x-0"
                    }`}
                  >
                    <Tooltip title="New chat" variant="solid" arrow>
                      <button
                        className={`hover:bg-gray-200 rounded-lg p-1.5 pt-[3px] transition ease-in-out ${
                          sidebarOpen ? "mr-4" : ""
                        }`}
                        onClick={() => createNewChat()}
                      >
                        <MapsUgcRoundedIcon fontSize="medium" />
                      </button>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="hover:bg-gray-200 rounded-lg px-2 h-full flex items-center gap-1 transition ease-in-out cursor-pointer">
                          <div className="font-medium">{modelName}</div>
                          <IoIosArrowDown />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72">
                        <DropdownMenuLabel className="font-normal text-gray-400 text-xs">
                          Select a model
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setModelName("GPT-4o");
                            setModelAlias("chatgpt-4o-latest");
                          }}
                          disabled={!localStorage.getItem("openai-api-key")}
                        >
                          GPT-4o
                          {!localStorage.getItem("openai-api-key") && (
                            <DropdownMenuShortcut>
                              API Key required
                            </DropdownMenuShortcut>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setModelName("GPT-4o mini");
                            setModelAlias("gpt-4o-mini");
                          }}
                          disabled={!localStorage.getItem("openai-api-key")}
                        >
                          GPT-4o mini
                          {!localStorage.getItem("openai-api-key") && (
                            <DropdownMenuShortcut>
                              API Key required
                            </DropdownMenuShortcut>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setModelName("Claude 3.5 Sonnet");
                            setModelAlias("claude-3-5-sonnet-latest");
                          }}
                          disabled={!localStorage.getItem("anthropic-api-key")}
                        >
                          Claude 3.5 Sonnet
                          {!localStorage.getItem("anthropic-api-key") && (
                            <DropdownMenuShortcut>
                              API Key required
                            </DropdownMenuShortcut>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setModelName("Claude 3.5 Haiku");
                            setModelAlias("claude-3-5-haiku-latest");
                          }}
                          disabled={!localStorage.getItem("anthropic-api-key")}
                        >
                          Claude 3.5 Haiku
                          {!localStorage.getItem("anthropic-api-key") && (
                            <DropdownMenuShortcut>
                              API Key required
                            </DropdownMenuShortcut>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={handleDialogOpen}
                          className="cursor-pointer"
                        >
                          My API Keys <FaKey />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>API Keys</DialogTitle>
                    <DialogDescription>
                      Insert your API keys here. Your keys will only be stored
                      locally in your browser.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="openai-key" className="text-right">
                        OpenAI
                      </Label>
                      <Input
                        id="openai-key"
                        ref={openaiInputRef}
                        className="col-span-3"
                        type="password"
                        defaultValue={
                          localStorage.getItem("openai-api-key") || ""
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="anthropic-key" className="text-right">
                        Anthropic
                      </Label>
                      <Input
                        id="anthropic-key"
                        ref={anthropicInputRef}
                        className="col-span-3"
                        type="password"
                        defaultValue={
                          localStorage.getItem("anthropic-api-key") || ""
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveChanges}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          <div className="h-full w-full z-0" key={flowKey}>
            {/* <div className="fixed top-0 left-0 w-full h-full -mt-16
                flex items-center justify-center">
              Welcome to BranchingChat
            </div> */}
            <ReactFlowProvider>
              {useMemo(
                () => (
                  <Tree
                    selectedChatID={selectedChatID}
                    setChats={setChats}
                  />
                ),
                [selectedChatID]
              )}
            </ReactFlowProvider>
          </div>
        </div>
      </UserContext.Provider>
    </ModelContext.Provider>
  );
}
