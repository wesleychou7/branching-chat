import Button from "@mui/joy/Button";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedNodeId, setPage } from "./treeSlice";
import type { RootState } from "@/app/store";

interface Props {
  id: string;
  text: string | undefined;
}

const Node = ({ id, text }: Props) => {
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(setSelectedNodeId(id));
    dispatch(setPage("chat"));
  };

  return (
    <Button onClick={onClick} sx={{ width: 150 }}>
      {text} {id}
    </Button>
  );
};

export default Node;
