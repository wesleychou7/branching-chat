"use client";
import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Chat from "@/app/components/Chat";
import { useState } from "react";

import FamilyTreeComponent from "./example/test";

// two pages: one for chat and one for tree

export default function Home() {
  const [page, setPage] = useState<string>("chat");

  return (
    <Grid container sx={{ flexGrow: 1 }}>
      <Grid sm={3} md={3}></Grid>
      <Grid sm={6} md={6} sx={{ height: "100%" }}>
        {page === "chat" && <Chat />}
        {page === "tree" && <FamilyTreeComponent />}
      </Grid>
      <Grid sm={3} md={3}></Grid>
    </Grid>
  );
}
