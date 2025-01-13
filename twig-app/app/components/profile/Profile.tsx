import { BiSolidUserCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3">
        <button>Sign Up</button>
        <button onClick={() => router.push("/login")}>Login</button>
      </div>
    </div>
  );
}
