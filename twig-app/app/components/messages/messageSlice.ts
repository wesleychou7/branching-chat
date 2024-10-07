import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
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

    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.streaming = action.payload;
    },
  },
});

export const { appendStreamedMessage, clearStreamedMessage, setStreaming } =
  messageSlice.actions;

export default messageSlice.reducer;
