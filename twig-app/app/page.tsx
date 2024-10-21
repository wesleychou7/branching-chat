"use client";
import { useState } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import SideBar from "@/app/components/sidebar/SideBar";
import MenuBar from "@/app/components/MenuBar";
import Chat from "@/app/components/Chat";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function Home() {
  const initialNodes = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
    { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  ];
  const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];
  const [page, setPage] = useState<"chat" | "tree">("chat");

  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);
  const [selectedChatID, setSelectedChatID] = useState<number | null>(null);

  return (
    <Grid container>
      <Box
        position="absolute"
        top={0}
        left={0}
        zIndex={100}
        width={300}
        height="100vh"
      >
        <SideBar
          selectedChatID={selectedChatID}
          setSelectedChatID={setSelectedChatID}
        />
      </Box>

      <Box height="100vh" width="100vw">
        {page === "tree" && (
          <div>
            <ReactFlow nodes={initialNodes} edges={initialEdges} />
          </div>
        )}
        {page === "chat" && (
          <div>
            <Box position="absolute" top={0} left={80} right={0} zIndex={0}>
              <MenuBar />
            </Box>

            <Chat
              selectedChatID={selectedChatID}
              setSelectedChatID={setSelectedChatID}
            />
          </div>
        )}
      </Box>
    </Grid>
  );
}
