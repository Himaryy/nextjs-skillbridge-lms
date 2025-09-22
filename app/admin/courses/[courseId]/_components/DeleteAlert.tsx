"use client";

import { tryCatch } from "@/hooks/try-catch";
import { useTransition } from "react";
import { DeleteCourseAction } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function DeleteCourseAlert({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();
  //   const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  function onSubmit() {
    // use trycatch from the library so no need to write try{}catch{} anymore
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        DeleteCourseAction(courseId)
      );

      // Check error from client
      if (error) {
        toast.error("An unexpected error occured. Please try again !");
        return;
      }

      // check error from server actions
      if (result.status === "success") {
        toast.success(result.message);

        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className={cn("w-full justify-start ")}>
          <Trash2 className="size-4 !my-2 text-destructive" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this course ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot bu undone. This will permanently delete from our
            server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={onSubmit} disabled={pending} variant="destructive">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
