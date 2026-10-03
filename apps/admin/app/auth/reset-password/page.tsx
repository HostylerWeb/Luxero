import AdminResetPasswordPageWrapper from "./AdminResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  return <AdminResetPasswordPageWrapper initialEmail={email ?? ""} initialToken={token ?? ""} />;
}
