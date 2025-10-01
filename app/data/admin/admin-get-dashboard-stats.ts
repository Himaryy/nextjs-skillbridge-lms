import "server-only";

import prisma from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function AdminGetDashboardStats() {
  await requireAdmin();

  // Get 4 data
  const [totalSignups, totalCustomers, totalCourses, totalLessons] =
    await Promise.all([
      // Total Sign up
      prisma.user.count(),
      // total customer
      prisma.user.count({
        where: {
          // get only enrolled user customer
          enrollment: {
            some: {}, // prisma relation filter that finds atleast one enrollment
          },
        },
      }),
      // Total courses
      prisma.course.count(),
      // total lesson
      prisma.lesson.count(),
    ]);

  return {
    totalSignups,
    totalCustomers,
    totalCourses,
    totalLessons,
  };
}
