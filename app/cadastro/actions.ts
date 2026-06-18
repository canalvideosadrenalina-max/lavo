"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const role = formData.get("role") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, role } },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(error.message)}`);
  }

  redirect(role === "LAVAJATO" ? "/painel" : "/");
}
