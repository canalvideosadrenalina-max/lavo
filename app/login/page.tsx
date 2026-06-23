import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#F0F4F8] p-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
