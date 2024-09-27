"use client";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import Slide from "@mui/material/Slide";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";

import Chat from "@/app/components/Chat";
import SideBar from "@/app/components/SideBar";
import MenuBar from "@/app/components/MenuBar";
import Messages from "@/app/components/Messages";
import InputBox from "@/app/components/InputBox";
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
      <Slide direction="right" in={sideBarOpen} mountOnEnter unmountOnExit>
        <Grid size={3}>
          <SideBar setSideBarOpen={setSideBarOpen} />
        </Grid>
      </Slide>

      <Grid size={sideBarOpen ? 9 : 12}>
        <Box height="calc(100vh - 65px)" overflow="auto">
          <Box position="sticky" top="0" zIndex={999}>
            <MenuBar
              sideBarOpen={sideBarOpen}
              setSideBarOpen={setSideBarOpen}
            />
          </Box>
          <Box display="flex" justifyContent="center" flexGrow={1}>
            <Box width={750}>
              <Messages />
            </Box>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          height="65px"
          alignItems="center"
        >
          <Box width={750}>
            <InputBox />
          </Box>
          <Box mt={0.7} fontSize={13}>
            Buy me a coffee
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
