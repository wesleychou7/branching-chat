"use client";
import Grid from "@mui/joy/Grid";
import Box from "@mui/joy/Box";
import Chat from "@/app/components/chat";

export default function Home() {
  return (
    <Grid container sx={{ flexGrow: 1 }}>
      <Grid sm={3} md={3}></Grid>
      <Grid sm={6} md={6} sx={{ height: "100%" }}>
        <Chat />
      </Grid>
      <Grid sm={3} md={3}></Grid>
    </Grid>
  );
}
