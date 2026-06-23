"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { showToast } from "@/lib/toast";

export function useActionToast(state: ActionResult | null | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (!state) return;

    if (state.error) showToast.error(state.error);
    if (state.warning) showToast.warning(state.warning);
    if (state.success) showToast.success(state.success);
    if (state.info) showToast.info(state.info);
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state, router]);
}
