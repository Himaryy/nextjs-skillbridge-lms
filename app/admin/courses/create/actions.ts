"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, courseSchemaType } from "@/lib/zodSchemas";
import { headers } from "next/headers";

export async function CreateCouse(
  values: courseSchemaType
): Promise<ApiResponse> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}
