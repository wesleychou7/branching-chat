import { configureStore } from "@reduxjs/toolkit";
import messageReducer from "@/app/components/tree/messageSlice";

export const store = configureStore({
   reducer: {
      "message": messageReducer
   },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store