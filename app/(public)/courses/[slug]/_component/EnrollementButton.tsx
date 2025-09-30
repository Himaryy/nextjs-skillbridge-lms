"use client";

import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { EnrollCourseAction } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function EnrollmentButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();

  function onSubmit() {
    // use trycatch from the library so no need to write try{}catch{} anymore
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        EnrollCourseAction(courseId)
      );

      // Check error from client
      if (error) {
        toast.error("An unexpected error occured. Please try again !");
        return;
      }

      // check error from server actions
      if (result.status === "success") {
        toast.success(result.message);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button onClick={onSubmit} disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Loading ...
        </>
      ) : (
        "Enroll Now !"
      )}
    </Button>
  );
}
