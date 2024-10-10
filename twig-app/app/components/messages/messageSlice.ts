import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  awaitingResponse: false,
  streaming: false,
  streamedMessage: "",
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
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

    // call when the response is being received
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.streaming = action.payload;
    },
  },
});

export const {
  appendStreamedMessage,
  clearStreamedMessage,
  setAwaitingResponse,
  setStreaming,
} = messageSlice.actions;

export default messageSlice.reducer;
