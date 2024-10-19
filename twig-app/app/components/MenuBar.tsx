import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import { Dispatch, SetStateAction } from "react";

interface Props {
  sideBarOpen: boolean;
  setSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const MenuBar = ({ sideBarOpen, setSideBarOpen }: Props) => {
  return (
    <Box p={1} display="flex">

      <Box marginLeft="auto">
        <Button></Button>
      </Box>
    </Box>
  );
};
export default MenuBar;
