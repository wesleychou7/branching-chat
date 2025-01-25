import { AiOutlineQuestionCircle } from "react-icons/ai";
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Info() {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-gray-600">
        <AiOutlineQuestionCircle size={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {/* <DropdownMenuItem className="cursor-pointer">
          <span>What is BranchingChat?</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/privacy-policy")}
        >
          <span>Privacy Policy</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
