import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F4F8] p-4">
      <LoginForm serverError={error} info={info} />
    </main>
  );
}
