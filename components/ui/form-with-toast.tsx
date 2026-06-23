"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "@/components/hooks/use-action-toast";

type FormAction = (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;

type Props = {
  action: FormAction;
  children: ReactNode;
  className?: string;
};

export function FormWithToast({ action, children, className }: Props) {
  const [state, formAction] = useActionState(action, null);
  useActionToast(state);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
