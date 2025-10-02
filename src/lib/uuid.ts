/**
 * Gera um UUID v4 válido
 * Usa crypto.randomUUID() se disponível, senão gera manualmente
 */
export function generateUUID(): string {
  // Verifica se crypto.randomUUID está disponível (navegadores modernos)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para navegadores mais antigos
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Valida se uma string é um UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * UUIDs pré-definidos para o sistema
 */
export const SYSTEM_UUIDS = {
  ADMIN_USER: "550e8400-e29b-41d4-a716-446655440000",
  TEST_USER: "550e8400-e29b-41d4-a716-446655440001",
} as const;
