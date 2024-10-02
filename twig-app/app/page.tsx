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
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(0);

  return (
    <Grid container height="100vh">
      {sideBarOpen && (
        <Grid size={3}>
          <SideBar setSideBarOpen={setSideBarOpen} />
        </Grid>
      )}

      <Grid size={sideBarOpen ? 9 : 12}>
        <Box
          height={`calc(99vh - ${inputBoxHeight}px)`}
          overflow="auto"
        >
          <Box position="sticky" top="0" zIndex={0}>
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
          alignItems="center"
        >
          <Box width={750}>
            <InputBox setInputBoxHeight={setInputBoxHeight}/>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
