import "server-only";

import prisma from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function AdminGetRecentCourses() {
  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 3, //get 2 newly courses
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      price: true,
      status: true,
      fileKey: true,
      slug: true,
    },
  });

  return data;
}
