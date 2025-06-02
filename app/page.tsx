import { auth } from "@/server/auth";
import Dashboard from "./dashboard/page";

export default async function page() {
  const session = await auth();
  if (!session) return;
  return (
    <div>
      <Dashboard currentUser={session.user} />
    </div>
  );
}
