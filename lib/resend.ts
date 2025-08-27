// This code should only run on server
// if this code run in client side , error will occured
import "server-only";

import { env } from "./env";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);
