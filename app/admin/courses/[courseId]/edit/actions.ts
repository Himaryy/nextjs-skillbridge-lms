"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import prisma from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import {
  chaptersSchema,
  chaptersSchemaType,
  courseSchema,
  courseSchemaType,
  lessonsSchema,
} from "@/lib/zodSchemas";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

// Protec route
const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function EditCourseActions(
  data: courseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You have been blocked due to rate limiting",
        };
      } else {
        return {
          status: "error",
          message:
            "You are a bot !. If this is mistake please contact our support.",
        };
      }
    }

    const result = courseSchema.safeParse(data);

    if (!result) {
      return {
        status: "error",
        message: "Invalid Data",
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      },
    });

    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update course",
    };
  }
}

export async function ReorderLessonsActions(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "No lessons provided for re-ordering",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapterId,
        },
        data: {
          position: lesson.position,
        },
      })
    );

    // update database using $transaction to run all not 1 by 1
    await prisma.$transaction(updates);

    // refetch data using revalidatePath
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lessons re-ordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to re-ordering lesson",
    };
  }
}

export async function ReorderChaptersActions(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "No Chapter provided to re-ordering",
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId,
        },
        data: {
          position: chapter.position,
        },
      })
    );

    // update database using $transaction to run all not 1 by 1
    await prisma.$transaction(updates);

    // refetch Data
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapter re-ordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to re-order chapter",
    };
  }
}

export async function CreateChapterActions(
  values: chaptersSchemaType
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = chaptersSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    // Calculate position for chapter
    // Get the highest position 1st then + 1
    await prisma.$transaction(async (tx) => {
      const maxPosition = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          // if there is a chapter then new chapter + 1 for position if not then 1
          position: (maxPosition?.position ?? 0) + 1,
        },
      });
    });

    // fetch data / revalidate
    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create chapter",
    };
  }
}

export async function CreateLessonActions(
  values: chaptersSchemaType
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = lessonsSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    // Calculate position for lesson
    // Get the highest position 1st then + 1
    await prisma.$transaction(async (tx) => {
      const maxPosition = await tx.lesson.findFirst({
        where: {
          chapterId: result.data.chapterId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description,
          videoKey: result.data.videoKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          // if there is a chapter then new chapter + 1 for position if not then 1
          position: (maxPosition?.position ?? 0) + 1,
        },
      });
    });

    // fetch data / revalidate
    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create lesson",
    };
  }
}

export async function DeleteLessonActions({
  chapterId,
  courseId,
  lessonId,
}: {
  chapterId: string;
  courseId: string;
  lessonId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    // Get all lessons
    const chapterWithLessons = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!chapterWithLessons) {
      return {
        status: "error",
        message: "Chapter not found.",
      };
    }

    const lessons = chapterWithLessons.lessons;

    // get spesific Lesson
    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Lesson not found in the chapter.",
      };
    }

    // Get remaining lesson except lesson want to delete
    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    // Reorder position
    const updates = remainingLessons.map((lesson, index) => {
      return prisma.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: index + 1,
        },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({
        where: {
          id: lessonId,
          chapterId: chapterId,
        },
      }),
    ]);

    // Refetch / revalidate
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "lesson successfully deleted",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete lesson",
    };
  }
}

export async function DeleteChapterActions({
  chapterId,
  courseId,
}: {
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    // Get all course
    const courseWithChapter = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapter: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapter) {
      return {
        status: "error",
        message: "Course not found.",
      };
    }

    const chapters = courseWithChapter.chapter;

    // get spesific chapter
    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId
    );

    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Chapter not found in the Course.",
      };
    }

    // Get remaining lesson except lesson want to delete
    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId
    );

    // Reorder position
    const updates = remainingChapters.map((chapter, index) => {
      return prisma.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          position: index + 1,
        },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: {
          id: chapterId,
        },
      }),
    ]);

    // Refetch / revalidate
    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapter successfully deleted",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete chapter",
    };
  }
}
