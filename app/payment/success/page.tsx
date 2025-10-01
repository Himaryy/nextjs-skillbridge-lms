"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfetti } from "@/hooks/use-confetti";
import { ArrowRight, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function PaymentSuccessfullPage() {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    triggerConfetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // one time render, when purcahse successfully, so no need triggerConfetti inside array
  //   71213

  return (
    <div className="w-full min-h-screen flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <CardContent>
          <div className="w-full flex justify-center">
            <CheckIcon className="size-12 p-2 bg-green-500/30 text-green-500 rounded-full" />
          </div>
          <div className="mt-3 text-center sm:mt-5 w-full">
            <h2 className="text-xl font-semibold">Payment Successfull</h2>
            <p className="text-sm text-muted-foreground tracking-tight text-balance mt-2">
              Congrats, your payment was successfull. You should now have access
              to the course !.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                className: "w-full mt-5",
              })}
            >
              Go To Dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
