import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Line = {
  from: string;
  to: string;
};

type Messages = {
  [key: string]: { role: string; content: string }[];
};

const initialState = {
  // for relation-graph
  rootId: "0",
  nodes: [{ id: "0", text: "New chat" }],
  lines: [] as Line[],
  latestId: "0",

  // for openai
  messages: {
    "0": [{ role: "system", content: "You are a helpful assistant." }],
  } as Messages,

  // others
  page: "chat" as "chat" | "tree",
  selectedNodeId: "0",
};

export const treeSlice = createSlice({
  name: "tree",
  initialState: initialState,
  reducers: {
    addNode(state, action: PayloadAction<string>) {
      const newId = (state.latestId + 1).toString();

      state.nodes.push({
        id: newId,
        text: "New chat " + newId,
      });

      state.lines.push({
        from: action.payload,
        to: newId,
      });

      state.latestId = newId;
    },
    addMessage(
      state,
      action: PayloadAction<{ id: string; role: string; content: string }>
    ) {
      state.messages[action.payload.id].push({
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

export const { addNode, addMessage, setPage, setSelectedNodeId } = treeSlice.actions;

export default treeSlice.reducer;
