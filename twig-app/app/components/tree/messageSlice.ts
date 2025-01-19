import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { MessageType } from "../types";

// 1. Define the thunk
//    This returns a Promise, so you can await it in your React component
export const applyChangesThunk = createAsyncThunk(
  "message/applyChangesThunk",
  async (_, { dispatch }) => {
    // Dispatch your synchronous reducer
    dispatch(applyChanges());
  }
);

interface MessageState {
  nodeId: string;
  awaitingResponse: boolean;
  streamedMessage: string;
  messages: MessageType[];
  changes: MessageType[];
}

const initialState: MessageState = {
  nodeId: "",
  awaitingResponse: false,
  streamedMessage: "",
  messages: [],
  changes: [],
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNodeId: (state, action: PayloadAction<string>) => {
      state.nodeId = action.payload;
    },
    appendStreamedMessage: (state, action: PayloadAction<string>) => {
      state.streamedMessage += action.payload;
    },
    clearStreamedMessage: (state) => {
      state.streamedMessage = "";
    },
    setAwaitingResponse: (state, action: PayloadAction<boolean>) => {
      state.awaitingResponse = action.payload;
    },
    setMessages: (state, action: PayloadAction<MessageType[]>) => {
      state.messages = action.payload;
    },
    addChange: (state, action: PayloadAction<MessageType>) => {
      const existingMessageIndex = state.changes.findIndex(
        (msg) => msg.id === action.payload.id
      );
      if (existingMessageIndex === -1) {
        state.changes.push(action.payload);
      } else {
        state.changes[existingMessageIndex] = action.payload;
      }
    },

    // The synchronous reducer that gets run inside our thunk
    applyChanges: (state) => {
      state.messages = state.messages.reduce(
        (acc: MessageType[], message) => {
          const changeWithSameId = state.changes.find(
            (change) => change.id === message.id
          );
          return changeWithSameId
            ? [...acc, changeWithSameId]
            : [...acc, message];
        },
        []
      );
      state.changes = [];
    },
  },
  extraReducers: (builder) => {
    // If you want to do something else when applyChangesThunk is pending/fulfilled/rejected,
    // you can handle those here. Usually, for a purely sync operation, nothing special is needed.
    builder
      .addCase(applyChangesThunk.pending, (state) => {
        // e.g. set a "loading" flag if desired
      })
      .addCase(applyChangesThunk.fulfilled, (state) => {
        // e.g. clear a "loading" flag if desired
      })
      .addCase(applyChangesThunk.rejected, (state, action) => {
        // e.g. handle error
        console.error("applyChangesThunk error:", action.error);
      });
  },
});

export const {
  setNodeId,
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
  setMessages,
  addChange,
  applyChanges, // just the sync reducer
} = messageSlice.actions;

export default messageSlice.reducer;
