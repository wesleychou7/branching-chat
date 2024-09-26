"use client";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import Chat from "@/app/components/Chat";
import SideBar from "@/app/components/SideBar";
import MenuBar from "@/app/components/MenuBar";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { setPage, addNode } from "./components/treeSlice";

export default function Home() {
  const dispatch = useDispatch();
  const page = useSelector((state: RootState) => state.tree.page);
  const selectedNodeId = useSelector(
    (state: RootState) => state.tree.selectedNodeId
  );

  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);

  return (
    <Grid container height="100vh">
      {sideBarOpen && (
        <Grid size={3}>
          <SideBar setSideBarOpen={setSideBarOpen} />
        </Grid>
      )}

      <Grid size={sideBarOpen ? 9 : 12} display="flex" flexDirection="column">
        <MenuBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />

        <Box display="flex" justifyContent="center">
          <Box width={750}>
            <Chat />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
