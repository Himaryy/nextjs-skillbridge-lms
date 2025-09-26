import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function GetCourse(slug: string) {
  const course = await prisma.course.findUnique({
    // Using Slug cause when user click course page we get SLUG from URL not id
    // Can check page.tsx in slug folder
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: true,
      smallDescription: true,
      chapter: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  return course;
}
