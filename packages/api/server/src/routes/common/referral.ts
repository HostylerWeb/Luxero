import { Profile } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { getCurrentContext } from "@luxero/api-infra/env";
import { Hono } from "hono";

const app = new Hono();

app.get("/:refCode", async (c) => {
  try {
    const { refCode } = c.req.param();
    const frontendUrl = getCurrentContext().frontendUrl;
    const signUpUrl = new URL("/auth/sign-up", frontendUrl);

    await dbConnect();

    const referrer = await Profile.findOne({ referralCode: refCode.toUpperCase() }).lean();
    if (referrer?.referralCode) {
      signUpUrl.searchParams.set("ref", referrer.referralCode);
    }

    return c.redirect(signUpUrl.toString(), 302);
  } catch (err: unknown) {
    console.error("Referral redirect error:", err);
    return c.redirect(new URL("/auth/sign-up", getCurrentContext().frontendUrl).toString(), 302);
  }
});

export default app;
