export interface SendWhatsAppResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia mensagem de texto via Evolution API.
 * @param phone Número com DDD (ex: 11999999999 ou 5511999999999)
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<SendWhatsAppResult> {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE || "barcelos";

  if (!url || !key) {
    return {
      ok: false,
      error: "Evolution API não configurada (EVOLUTION_API_URL e EVOLUTION_API_KEY)",
    };
  }

  const numero = phone.replace(/\D/g, "");
  if (!numero || numero.length < 10) {
    return { ok: false, error: "Número inválido" };
  }

  const numberWithCountry = numero.startsWith("55") ? numero : `55${numero}`;
  const baseUrl = url.replace(/\/$/, "");
  const endpoint = `${baseUrl}/message/sendText/${instance}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
      },
      body: JSON.stringify({
        number: numberWithCountry,
        text: message,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      let errMsg = `Evolution API: ${res.status}`;
      try {
        const json = JSON.parse(body) as { message?: string; error?: string };
        errMsg = json.message || json.error || body || errMsg;
      } catch {
        if (body) errMsg = body.slice(0, 200);
      }
      return { ok: false, error: errMsg };
    }

    const data = (await res.json()) as { key?: { id?: string } };
    return { ok: true, messageId: data?.key?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Erro de conexão: ${msg}` };
  }
}
