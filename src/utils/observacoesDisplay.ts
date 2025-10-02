/**
 * Utilitário para limpar observações para exibição segura na interface
 */

/**
 * Limpa observações removendo qualquer código JSON ou tags técnicas
 * que possam aparecer na interface do usuário
 */
export function cleanObservacoesForDisplay(observacoes: string | null | undefined): string {
  if (!observacoes || typeof observacoes !== "string") {
    return "";
  }

  try {
    // Primeiro, tentar extrair observações de JSON estruturado
    const servicosMatch = observacoes.match(/\[SERVICOS:(.+?)\]/);
    if (servicosMatch) {
      try {
        let jsonData = servicosMatch[1];
        
        // Corrigir problemas comuns de JSON
        jsonData = jsonData
          .replace(/,\s*}]/g, "}]")
          .replace(/,\s*}/g, "}")
          .replace(/"\s*}/g, '"}')
          .replace(/"\s*]/g, '"]');
        
        const data = JSON.parse(jsonData);
        if (data.observacoes_usuario && typeof data.observacoes_usuario === "string") {
          return data.observacoes_usuario.trim();
        }
      } catch (jsonError) {
        console.warn("Erro ao processar JSON de observações:", jsonError);
      }
    }

    // Fallback: remover todas as tags técnicas e JSON
    let cleaned = observacoes
      .replace(/\[FUNC:[^\]]+\]/g, "") // Remove tags de funcionário
      .replace(/\[SERVICOS:.+?\]/g, "") // Remove tags de serviços
      .replace(/\{[^}]*"servicos"[^}]*\}/g, "") // Remove objetos JSON de serviços
      .replace(/\{[^}]*\}/g, "") // Remove qualquer objeto JSON
      .replace(/\[[^\]]*\]/g, "") // Remove arrays JSON
      .replace(/^\s*,+\s*/, "") // Remove vírgulas no início
      .replace(/\s*,+\s*$/, "") // Remove vírgulas no final
      .trim();

    // Se restou algo que não é JSON, retornar
    if (cleaned && !cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      return cleaned;
    }

    return "";
  } catch (error) {
    console.warn("Erro ao limpar observações:", error);
    
    // Último recurso: tentar extrair qualquer texto que não seja código
    return observacoes
      .replace(/[{}[\]]/g, " ") // Substituir brackets por espaços
      .replace(/[",]/g, " ") // Substituir aspas e vírgulas por espaços
      .replace(/\s+/g, " ") // Normalizar espaços
      .replace(/\b\w+:/g, "") // Remover propriedades JSON (palavra:)
      .trim();
  }
}

/**
 * Detecta se uma string de observações contém código JSON ou tags técnicas
 */
export function hasCodeInObservacoes(observacoes: string | null | undefined): boolean {
  if (!observacoes || typeof observacoes !== "string") {
    return false;
  }

  return (
    observacoes.includes('[SERVICOS:') ||
    observacoes.includes('[FUNC:') ||
    observacoes.includes('{"') ||
    observacoes.includes('observacoes_usuario') ||
    observacoes.includes('servico_id')
  );
}

/**
 * Valida se observações estão em formato adequado para exibição
 */
export function validateObservacoesForDisplay(observacoes: string | null | undefined): {
  isValid: boolean;
  cleaned: string;
  hadCode: boolean;
} {
  const hadCode = hasCodeInObservacoes(observacoes);
  const cleaned = cleanObservacoesForDisplay(observacoes);
  const isValid = cleaned.length > 0 && !hasCodeInObservacoes(cleaned);

  return {
    isValid,
    cleaned,
    hadCode
  };
}
