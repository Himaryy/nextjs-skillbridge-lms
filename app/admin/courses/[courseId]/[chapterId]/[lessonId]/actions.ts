"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonsSchema, lessonsSchemaType } from "@/lib/zodSchemas";

export async function UpdateLessonAction(
  values: lessonsSchemaType,
  id: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    // Value validation
    const result = lessonsSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    // Create mutation using prisma
    await prisma.lesson.update({
      where: {
        id: id,
      },
      data: {
        title: result.data.name,
        description: result.data.description,
        thumbnailKey: result.data.thumbnailKey,
        videoKey: result.data.videoKey,
      },
    });

    return {
      status: "success",
      message: "Lesson updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update lesson",
    };
  }
}
