"use server";

import { VerifyUser } from "@/app/data/user/verify-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import prisma from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 3,
  })
);

export async function EnrollCourseAction(
  courseId: string
  //   add never because in try there is no return statement
  // because when trx successfully it should redirect
): Promise<ApiResponse | never> {
  // Check session
  const user = await VerifyUser();

  let checkoutUrl: string;

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been block",
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    // Check if user already have stripeCustomerId
    let stripeCustomerId: string;
    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    // if user doesnt have stripe customer id then create from stripe
    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId?.stripeCustomerId;
    } else {
      // create Stripe Cusomter ID
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      // Update data for stripe custoemr id
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: stripeCustomerId,
        },
      });
    }

    const result = await prisma.$transaction(async (trx) => {
      const existingEnrollment = await trx.enrollment.findUnique({
        where: {
          // this userId_courseId its called @@uniqued in schema prisma
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
        select: {
          status: true,
          id: true,
        },
      });

      if (existingEnrollment?.status === "Success") {
        return {
          status: "success",
          message: "You already enrolled in this course",
        };
      }

      let enrollment;

      if (existingEnrollment) {
        enrollment = await trx.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            amount: course.price,
            status: "Pending",
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await trx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            amount: course.price,
            status: "Pending",
          },
        });
      }

      //   Checkout session stripe
      const checkoutSession = await stripe.checkout.sessions.create({
        // Link with stripe custoemr id that made before
        customer: stripeCustomerId,
        line_items: [
          {
            price: "price_1SCzQ83KRNeXmNLRQmlFwTug",
            quantity: 1,
          },
        ],
        mode: "payment",
        // use better auth url because its define local URL = localhost3000
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          enrollmentId: enrollment.id,
        },
      });

      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url,
      };
    });

    checkoutUrl = result.checkoutUrl as string;
  } catch (error) {
    if (error instanceof stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment system error. Please try again later..",
      };
    }
    return {
      status: "error",
      message: "Failed to enrolled course",
    };
  }

  redirect(checkoutUrl);
}
