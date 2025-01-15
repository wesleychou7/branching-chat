import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseClient } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Image from "next/image";

interface Props {
  session: Session | null;
}

export default function Profile({ session }: Props) {
  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error(error);
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 cursor-pointer">
            <Image
              src={session?.user.user_metadata.avatar_url}
              alt="Profile"
              width={32}
              height={32}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
