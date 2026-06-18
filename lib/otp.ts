import { randomInt } from "crypto";

export const OTP_EXPIRA_MINUTOS = 5;

export function gerarCodigoOtp(): string {
  return String(randomInt(100000, 999999));
}

export function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

export function telefoneValido(telefone: string): boolean {
  const digits = normalizarTelefone(telefone);
  return digits.length >= 10 && digits.length <= 13;
}
