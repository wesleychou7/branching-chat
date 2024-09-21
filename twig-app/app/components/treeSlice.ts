import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

type Line = {
  from: string;
  to: string;
};

type Message = {
  role: string;
  content: string;
};

type Tree = {
  [id: string]: {
    // node id
    parent: string | null; // parent node id
    messages: Message[];
  };
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
      // node id
      parent: null,
      messages: [{ role: "system", content: "You are a helpful assistant." }],
    },
  } as Tree,

  // messages: {
  //   "0": [{ role: "system", content: "You are a helpful assistant." }],
  // } as Messages,

  // others
  page: "chat" as "chat" | "tree",
  selectedNodeId: "0",
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

      state.tree[newId] = { parent: state.selectedNodeId, messages: [] };
      state.latestId = newId;
      state.selectedNodeId = newId;
    },
    addMessage(
      state,
      action: PayloadAction<{ id: string; role: string; content: string }>
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
  },
});

export const { addNode, addMessage, setPage, setSelectedNodeId } =
  treeSlice.actions;

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
