import prisma from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function AdminGetCourses() {
  // Only admin can fetch data
  await requireAdmin();

  const data = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
    },
  });

  return data;
}

export type AdminCourseType = Awaited<ReturnType<typeof AdminGetCourses>>[0];
