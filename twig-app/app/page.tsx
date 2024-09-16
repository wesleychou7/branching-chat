"use client";
import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chat from "@/app/components/Chat";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";

import Tree from "./components/Tree";
import { setPage } from "./components/treeSlice";

// two pages: one for chat and one for tree

export default function Home() {
  const dispatch = useDispatch();
  const page = useSelector((state: RootState) => state.tree.page);

  if (page === "chat") {
    return (
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid sm={3} md={3}></Grid>
        <Grid sm={6} md={6} sx={{ height: "100%" }}>
          <Chat />
        </Grid>
        <Grid sm={3} md={3}>
          <Box position="relative" height="100%">
            <Button
              sx={{ position: "absolute", bottom: 0, right: 0, marginRight: 1 }}
              onClick={() => dispatch(setPage("tree"))}
            >
              Tree View
            </Button>
          </Box>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container sx={{ flexGrow: 1 }}>
        <Tree />
      </Grid>
    );
  }
}
