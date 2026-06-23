"use client";

import { useActionState } from "react";
import { confirmarTelefone, reenviarCodigoTelefone } from "@/app/confirmar-telefone/actions";
import { useActionToast } from "@/components/hooks/use-action-toast";
import { WaveDivider } from "@/components/ui/wave-divider";

type Props = {
  telefoneMascarado: string;
  returnUrl?: string | null;
};

export function ConfirmarTelefoneForms({ telefoneMascarado, returnUrl }: Props) {
  const [confirmState, confirmAction] = useActionState(confirmarTelefone, null);
  const [reenviarState, reenviarAction] = useActionState(reenviarCodigoTelefone, null);

  useActionToast(confirmState);
  useActionToast(reenviarState);

  return (
    <div className="lavo-section w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Confirmar telefone</h1>
        <p className="mt-1 lavo-muted">
          Enviamos um código de 6 dígitos no WhatsApp para{" "}
          <span className="font-medium text-foreground">{telefoneMascarado}</span>
        </p>
      </div>
      <WaveDivider className="-mx-1" />

      <form action={confirmAction} className="space-y-4">
        {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}
        <label className="lavo-label">
          Código de verificação
          <input
            name="codigo"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            placeholder="000000"
            className="lavo-input mt-1 text-center text-lg tracking-[0.3em]"
          />
        </label>
        <button type="submit" className="lavo-btn-primary">
          Confirmar
        </button>
      </form>

      <form action={reenviarAction}>
        <button type="submit" className="lavo-btn-outline w-full">
          Reenviar código
        </button>
      </form>
    </div>
  );
}
