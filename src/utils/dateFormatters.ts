/**
 * Utilitários para formatação de datas de aniversário
 * Converte entre diferentes formatos mantendo apenas dia e mês
 */

/**
 * Formata uma data completa para exibir apenas dia e mês (DD/MM)
 */
export function formatarAniversario(data: Date | string | null): string {
  if (!data) return "";
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  if (isNaN(dataObj.getTime())) return "";
  
  const dia = dataObj.getDate().toString().padStart(2, '0');
  const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
  
  return `${dia}/${mes}`;
}

/**
 * Converte formato DD/MM para data completa (usando ano padrão 1990)
 */
export function aniversarioParaData(aniversario: string): Date | null {
  if (!aniversario || !aniversario.includes('/')) return null;
  
  const [dia, mes] = aniversario.split('/');
  
  if (!dia || !mes) return null;
  
  const diaNum = parseInt(dia);
  const mesNum = parseInt(mes);
  
  // Validar dia e mês
  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12) return null;
  
  // Usar 1990 como ano padrão para manter compatibilidade
  return new Date(1990, mesNum - 1, diaNum);
}

/**
 * Verifica se é aniversário hoje
 */
export function isAniversarioHoje(data: Date | string | null): boolean {
  if (!data) return false;
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  const hoje = new Date();
  
  return (
    dataObj.getDate() === hoje.getDate() &&
    dataObj.getMonth() === hoje.getMonth()
  );
}

/**
 * Verifica se é aniversário neste mês
 */
export function isAniversarioEsteMes(data: Date | string | null): boolean {
  if (!data) return false;
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  const hoje = new Date();
  
  return dataObj.getMonth() === hoje.getMonth();
}

/**
 * Verifica se o aniversário está próximo (dentro de 7 dias)
 */
export function isAniversarioProximo(data: Date | string | null): boolean {
  if (!data) return false;
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  const hoje = new Date();
  
  const proximoAniversario = new Date(
    hoje.getFullYear(),
    dataObj.getMonth(),
    dataObj.getDate(),
  );

  if (proximoAniversario < hoje) {
    proximoAniversario.setFullYear(hoje.getFullYear() + 1);
  }

  const diasAteAniversario = Math.ceil(
    (proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diasAteAniversario <= 7;
}

/**
 * Calcula a idade baseada na data de nascimento
 * (mantém funcionalidade existente)
 */
export function calcularIdade(nascimento: Date | string | null): number | null {
  if (!nascimento) return null;
  
  const hoje = new Date();
  const dataNasc = typeof nascimento === 'string' ? new Date(nascimento) : nascimento;
  
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = dataNasc.getMonth();

  if (
    mesAtual < mesNasc ||
    (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())
  ) {
    idade--;
  }
  
  return idade;
}

/**
 * Valida se uma string de aniversário está no formato correto (DD/MM)
 */
export function validarFormatoAniversario(aniversario: string): boolean {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/;
  return regex.test(aniversario);
}

/**
 * Formata entrada de aniversário automaticamente (adiciona / conforme o usuário digita)
 */
export function formatarEntradaAniversario(valor: string): string {
  // Remove caracteres não numéricos
  let digits = valor.replace(/\D/g, '');
  
  // Limita a 4 dígitos (DDMM)
  if (digits.length > 4) {
    digits = digits.slice(0, 4);
  }
  
  // Adiciona a barra automaticamente
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  
  return digits;
}
