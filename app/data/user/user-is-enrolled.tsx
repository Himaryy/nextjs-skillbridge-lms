import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export async function CheckIfCourseBought(courseId: string): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return false;

  // if user has session
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      // This is from @@uniqued in schema prisma
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
    select: {
      status: true,
    },
  });

  return enrollment?.status === "Success" ? true : false;
}
