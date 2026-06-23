"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  /** Incrementar para resetar o widget (ex.: após erro de submit). */
  resetSignal?: number;
}

export function TurnstileWidget({ onTokenChange, resetSignal = 0 }: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    if (resetSignal > 0) {
      ref.current?.reset();
      onTokenChange(null);
    }
    // resetSignal é o único gatilho intencional de reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p className="text-amber-600/90 text-xs text-center" role="status">
        Verificação de segurança não configurada (NEXT_PUBLIC_TURNSTILE_SITE_KEY).
      </p>
    );
  }

  return (
    <div className="flex justify-center min-h-[65px]">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{ theme: "dark", size: "flexible" }}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
      />
    </div>
  );
}
