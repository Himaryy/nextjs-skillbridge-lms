import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import Logo from "@/public/logo_icon.png";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium "
        >
          <Image src={Logo} alt="Logo" className="size-9" />
          SkillBridgeLMS.
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By looking continue, you agree to our{" "}
          <span className="hover:text-primary hover:underline hover:cursor-default">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary hover:underline hover:cursor-default">
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
