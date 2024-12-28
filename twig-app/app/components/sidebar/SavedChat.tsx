import { useState } from "react";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LuPencil } from "react-icons/lu";
import { HiOutlineTrash } from "react-icons/hi";
import supabase from "@/app/supabase";
import { ChatType } from "@/app/components/types";

interface Props {
  name: string;
  chat_id: string;
  selectedChatID: string | null;
  setSelectedChatID: React.Dispatch<React.SetStateAction<string | null>>;
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
}

const SavedChat = ({
  name,
  chat_id,
  selectedChatID,
  setSelectedChatID,
  setChats,
}: Props) => {
  const [hover, setHover] = useState<boolean>(false);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>(name);

  async function onClickSaveRename() {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chat_id ? { ...chat, name: renameInput } : chat
      )
    );

    const response = await supabase
      .from("chats")
      .update({ name: renameInput })
      .eq("id", chat_id);

    if (response.error) console.error(response.error);
  }

  async function onClickDelete() {
    setChats((prevChats) =>
      prevChats.filter((chat) => chat.id !== chat_id)
    );

    const response = await supabase.from("chats").delete().eq("id", chat_id);

    if (response.error) console.error(response.error);
  }

  return (
    <div
      className={`flex justify-between items-center rounded-lg transition-colors duration-75 ${
        selectedChatID === chat_id ? "bg-gray-200" : ""
      } ${hover ? "bg-gray-200" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        if (!popupOpen) setHover(false);
      }}
    >
      <button
        onClick={() => setSelectedChatID(chat_id)}
        className="cursor-pointer pl-3 pr-0 w-full overflow-hidden text-left text-sm border-none bg-transparent h-[35px]"
      >
        <div
          className={`overflow-hidden ${
            hover ? "text-clip" : "text-ellipsis"
          } whitespace-nowrap`}
        >
          {name}
        </div>
      </button>

      <DropdownMenu
        open={popupOpen}
        onOpenChange={() => {
          setPopupOpen(!popupOpen);
          if (!popupOpen) setHover(true);
          else setHover(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button className={`p-1 mr-1 ${!hover ? "invisible" : ""}`}>
            <MoreHorizRoundedIcon className="text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-16">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setDialogOpen(true);
                setPopupOpen(false);
              }}
            >
              <div className="flex items-center">
                <LuPencil className="mr-2" /> Rename
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-600 focus:text-red-600">
              <button onClick={onClickDelete} className="flex items-center">
                <HiOutlineTrash className="mr-2" /> Delete
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
          setRenameInput(name);
        }}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="name"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
          />

          <DialogFooter>
            <DialogClose>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            {renameInput && renameInput !== name ? (
              <DialogClose>
                <Button onClick={onClickSaveRename}>
                  Save
                </Button>
              </DialogClose>
            ) : (
              <Button disabled>
                Save
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedChat;
