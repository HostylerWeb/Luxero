import AdminForgotPasswordPageWrapper from "./AdminForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <AdminForgotPasswordPageWrapper initialEmail={email ?? ""} />;
}
