import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import IconButton from "@mui/joy/IconButton";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { setSelectedNodeId } from "@/app/components/treeSlice";
import type { Tree, Node } from "./treeSlice";
import { Dispatch, SetStateAction } from "react";

const Chat = ({ nodeId, node }: { nodeId: string; node: Node }) => {
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(setSelectedNodeId(nodeId))}>
      {node.name}
    </Button>
  );
};

const Chats = ({
  tree,
  nodeId,
  depth = 0,
}: {
  tree: Tree;
  nodeId: string;
  depth?: number;
}) => {
  const node = tree[nodeId];

  if (!node) return null;

  return (
    <Box sx={{ paddingLeft: depth === 0 ? 0 : 3 }}>
      <Chat nodeId={nodeId} node={node} />
      {node.children.map((childId) => (
        <Chats key={childId} tree={tree} nodeId={childId} depth={depth + 1} />
      ))}
    </Box>
  );
};

interface Props {
  setSideBarOpen: Dispatch<SetStateAction<boolean>>;
}

const SideBar = ({ setSideBarOpen }: Props) => {
  const tree = useSelector((state: RootState) => state.tree.tree);
  const rootNodeId = Object.keys(tree).find((id) => tree[id].parent === null);

  if (!rootNodeId) return null;

  return (
    <Box height="100%" bgcolor="#eeeeee">
      <Box width="100%" p={1}>
        <IconButton onClick={() => setSideBarOpen(false)}>
          <MenuRoundedIcon />
        </IconButton>
      </Box>
      <Chats tree={tree} nodeId={rootNodeId} />
    </Box>
  );
};

export default SideBar;
