// This code should only run on server
// if this code run in client side , error will occured
import "server-only";

import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  slidingWindow,
  shield,
} from "@arcjet/next";
import { env } from "./env";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  slidingWindow,
  shield,
};

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  // define base rules, can also be empty.
  // this rule will run as default
  rules: [
    shield({
      mode: "LIVE", //DRY RUN : only clg the decision from arcjet, LIVE: will block all request
    }),
  ],
});
