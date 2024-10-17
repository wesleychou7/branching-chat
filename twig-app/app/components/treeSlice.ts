import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

type Line = {
  from: string;
  to: string;
};

type Message = {
  role: string;
  content: string | null;
};

export type Node = {
  name: string; // node name. not id!
  parent: string | null; // parent node id
  children: string[]; // array of child node ids
  messages: Message[];
};

export type Tree = {
  // key is the node id
  [id: string]: Node;
};

const initialState = {
  // for relation-graph
  rootId: "0",
  nodes: [{ id: "0", text: "New chat" }],
  lines: [] as Line[],
  latestId: "0",

  // tree
  tree: {
    "0": {
      name: "Chat 0",
      parent: null,
      children: [],
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
      ],
    },
  } as Tree,

  // others
  page: "chat" as "chat" | "tree",
  selectedNodeId: "0",

  selectedChatId: null as number | null,
  updateMessagesFlag: 0, // flag for useEffect dependency to indicate that messages have to be re-read from the database
};

export const treeSlice = createSlice({
  name: "tree",
  initialState: initialState,
  reducers: {
    addNode(state) {
      const newId = (Number(state.latestId) + 1).toString();

      state.nodes.push({
        id: newId,
        text: "New chat " + newId,
      });

      state.lines.push({
        from: state.selectedNodeId,
        to: newId,
      });

      state.tree[newId] = {
        name: "Chat " + newId,
        parent: state.selectedNodeId,
        children: [],
        messages: [],
      };

      state.tree[state.selectedNodeId].children.push(newId);
      state.latestId = newId;
      state.selectedNodeId = newId;
    },
    addMessage(
      state,
      action: PayloadAction<{
        id: string;
        role: string;
        content: string | null;
      }>
    ) {
      state.tree[action.payload.id].messages.push({
        role: action.payload.role,
        content: action.payload.content,
      });
    },
    setPage(state, action: PayloadAction<"chat" | "tree">) {
      state.page = action.payload;
    },
    setSelectedNodeId(state, action: PayloadAction<string>) {
      state.selectedNodeId = action.payload;
    },
    setSelectedChatId(state, action: PayloadAction<number | null>) {
      state.selectedChatId = action.payload;
    },
    setUpdateMessagesFlag(state) {
      state.updateMessagesFlag = state.updateMessagesFlag + 1;
    },
  },
});

export const {
  addNode,
  addMessage,
  setPage,
  setSelectedNodeId,
  setSelectedChatId,
  setUpdateMessagesFlag,
} = treeSlice.actions;

// Selectors

// Get all messages from the selected node up to the root
export const selectMessages = (state: RootState) => {
  const messages: Message[] = [];
  const nodeIds: string[] = [];
  let currentNodeId: string | null = state.tree.selectedNodeId;

  // Collect all node IDs from the selected node up to the root
  while (currentNodeId != null) {
    nodeIds.push(currentNodeId);
    currentNodeId = state.tree.tree[currentNodeId].parent;
  }

  // Reverse the array to get messages from root to selected node
  nodeIds.reverse();

  // Collect messages from each node
  nodeIds.forEach((nodeId) => {
    messages.push(...state.tree.tree[nodeId].messages);
  });

  return messages;
};

export default treeSlice.reducer;
