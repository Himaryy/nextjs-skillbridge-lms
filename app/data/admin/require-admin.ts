import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

// use cache for 1 render pass
// so when requireAdmin called in other file
// it wont be check, cause already cache
export const requireAdmin = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role !== "admin") {
    return redirect("/not-admin");
  }

  return session;
});
