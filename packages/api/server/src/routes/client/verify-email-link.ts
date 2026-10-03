import { Hono } from "hono";

// Belt-and-suspenders fallback for email clients that mangle query params.
// Primary verification path is the client-side verify page
// (/auth/verify?email=X&code=Y) where the BA SDK calls
// emailOtp.verifyEmail() interactively.
const app = new Hono();

app.get("/", async (c) => {
  const email = c.req.query("email") || "";
  const code = c.req.query("code") || "";

  if (email && /^\d{6}$/.test(code)) {
    return c.redirect(
      `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&code=${code}`,
      302
    );
  }

  return c.redirect(
    email
      ? `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`
      : "/auth/sign-up",
    302
  );
});

export default app;
