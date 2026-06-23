import { headers } from "next/headers";

type TurnstileVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verificarTokenTurnstile(
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: true };
  }

  if (!token.trim()) {
    return { ok: false, error: "Complete a verificação de segurança." };
  }

  const headersList = await headers();
  const remoteip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    undefined;

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
  });
  if (remoteip) body.set("remoteip", remoteip);

  let data: TurnstileVerifyResponse;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: "Não foi possível validar a verificação de segurança. Tente novamente.",
      };
    }

    data = (await res.json()) as TurnstileVerifyResponse;
  } catch {
    return {
      ok: false,
      error: "Não foi possível validar a verificação de segurança. Tente novamente.",
    };
  }

  if (!data.success) {
    return { ok: false, error: "Verificação de segurança inválida ou expirada. Tente novamente." };
  }

  return { ok: true };
}
