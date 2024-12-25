import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  nodeId: "",
  awaitingResponse: false,
  streamedMessage: "",
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

    // call immediately when user submits a message
    setAwaitingResponse: (state, action: PayloadAction<boolean>) => {
      state.awaitingResponse = action.payload;
    },
  },
});

export const {
  setNodeId,
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
} = messageSlice.actions;

export default messageSlice.reducer;
