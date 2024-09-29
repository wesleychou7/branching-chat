"use client";
import Grid from "@mui/material/Grid2";
import Box from "@mui/joy/Box";
import SideBar from "@/app/components/SideBar";
import MenuBar from "@/app/components/MenuBar";
import Messages from "@/app/components/messages/Messages";
import InputBox from "@/app/components/InputBox";
import { useState } from "react";

export default function Home() {
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);

  return (
    <Grid container height="100vh">
      {sideBarOpen && (
        <Grid size={3}>
          <SideBar setSideBarOpen={setSideBarOpen} />
        </Grid>
      )}

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
