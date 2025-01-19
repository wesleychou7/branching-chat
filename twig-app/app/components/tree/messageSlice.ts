import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageType } from "../types";

const initialState = {
  nodeId: "",
  awaitingResponse: false,
  streamedMessage: "",
  messages: [] as MessageType[],
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNodeId: (state, action: PayloadAction<string>) => {
      state.nodeId = action.payload;
    },
    appendStreamedMessage: (state, action: PayloadAction<string>) => {
      state.streamedMessage = state.streamedMessage + action.payload;
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
  },
});

export const {
  setNodeId,
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
  setMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
