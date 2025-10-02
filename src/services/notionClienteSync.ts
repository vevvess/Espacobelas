import { sql } from "@/lib/neon";

// Dados dos clientes extraídos do Notion
const notionClientData = [
  // Adriane Lima já encontrada
  {
    nome: "Adriane Lima",
    telefone: "(81) 98886-1850",
    aniversario: "17/06", // Será convertido para data de nascimento
  },
  // Dados da tabela encontrada no Notion
  {
    nome: "LETICIA",
    telefone: "982012118",
    aniversario: "01/01",
  },
  {
    nome: "POLIANA",
    telefone: "993362055",
    aniversario: "10/01",
  },
  {
    nome: "MARINA DA SILVA",
    telefone: "984218933",
    aniversario: "15/01",
  },
  {
    nome: "ALINE",
    telefone: "991730856",
    aniversario: "27/01",
  },
  {
    nome: "HUGO",
    telefone: "981586883",
    aniversario: "04/02",
  },
  {
    nome: "GABRIELLE",
    telefone: "981780175",
    aniversario: "18/02",
  },
  {
    nome: "SUELLEN",
    telefone: "982304716",
    aniversario: "18/02",
  },
  {
    nome: "FRANCISCO MONTEIRO",
    telefone: "984444655",
    aniversario: "21/02",
  },
  {
    nome: "FERNANDA",
    telefone: "981618192",
    aniversario: "24/02",
  },
  {
    nome: "MARIA DE LOURDES",
    telefone: "981748611",
    aniversario: "24/02",
  },
  {
    nome: "SIMONE",
    telefone: "984506544",
    aniversario: "01/03",
  },
  {
    nome: "NADIANE",
    telefone: "991137051",
    aniversario: "13/03",
  },
  {
    nome: "FABIA",
    telefone: "981759526",
    aniversario: "16/03",
  },
  {
    nome: "KESIA MORAIS",
    telefone: "991773440",
    aniversario: "20/03",
  },
  {
    nome: "RAFAEL MOURA",
    telefone: "991327329",
    aniversario: "05/04",
  },
  {
    nome: "MARIA FERNANDA",
    telefone: "981675138",
    aniversario: "19/04",
  },
  {
    nome: "ANTONIA",
    telefone: "982126203",
    aniversario: "06/05",
  },
  {
    nome: "JERUSA",
    telefone: "981214443",
    aniversario: "10/05",
  },
  {
    nome: "MARIA DE FÁTIMA",
    telefone: "995642122",
    aniversario: "15/05",
  },
  {
    nome: "GEOVANNA",
    telefone: "991716174",
    aniversario: "16/05",
  },
  {
    nome: "GLAUCIA",
    telefone: "982304716",
    aniversario: "18/05",
  },
  {
    nome: "PATRICIA FERNANDA",
    telefone: "982162355",
    aniversario: "06/06",
  },
  {
    nome: "ANDREA",
    telefone: "995349251",
    aniversario: "09/06",
  },
  {
    nome: "ERISVALDO",
    telefone: "982109144",
    aniversario: "15/06",
  },
  {
    nome: "EDSON",
    telefone: "981344266",
    aniversario: "30/06",
  },
  {
    nome: "JULIANA",
    telefone: "982318195",
    aniversario: "05/07",
  },
  {
    nome: "JOSEANE",
    telefone: "982107109",
    aniversario: "12/07",
  },
  {
    nome: "RAIMUNDO ALVES",
    telefone: "981312346",
    aniversario: "20/07",
  },
  {
    nome: "PATRICK",
    telefone: "991345672",
    aniversario: "23/07",
  },
  {
    nome: "CARMEM LUCIA",
    telefone: "981234567",
    aniversario: "28/07",
  },
  {
    nome: "ELIANA",
    telefone: "993845621",
    aniversario: "02/08",
  },
  {
    nome: "MARIA APARECIDA",
    telefone: "993245672",
    aniversario: "15/08",
  },
  {
    nome: "MARCOS",
    telefone: "991234789",
    aniversario: "16/08",
  },
  {
    nome: "ROSANA",
    telefone: "981215874",
    aniversario: "23/08",
  },
  {
    nome: "SILVIA",
    telefone: "984456123",
    aniversario: "01/09",
  },
  {
    nome: "CRISTIANE",
    telefone: "993215845",
    aniversario: "10/09",
  },
  {
    nome: "MARIA JOSE",
    telefone: "981452789",
    aniversario: "12/09",
  },
  {
    nome: "ANA PAULA",
    telefone: "991512374",
    aniversario: "18/09",
  },
  {
    nome: "FABIANA FILHA DE NALVA",
    telefone: "981818637",
    aniversario: "05/10",
  },
  {
    nome: "MANU",
    telefone: "996718111",
    aniversario: "05/10",
  },
  {
    nome: "JACK GUERRA",
    telefone: "99979602",
    aniversario: "10/10",
  },
  {
    nome: "FATIMA",
    telefone: "994349470",
    aniversario: "20/10",
  },
  {
    nome: "MARINALVA",
    telefone: "983760490",
    aniversario: "20/10",
  },
  {
    nome: "MAGDA",
    telefone: "995694383",
    aniversario: "22/10",
  },
  {
    nome: "SANDRA AMARAL",
    telefone: "", // Sem telefone no Notion
    aniversario: "26/10",
  },
  {
    nome: "STEFANIA",
    telefone: "984489609",
    aniversario: "30/10",
  },
  {
    nome: "RAFAELA FRANCISCA",
    telefone: "95563242",
    aniversario: "02/10",
  },
];

// Função para converter aniversário DD/MM para data de nascimento
function convertAniversarioToDataNascimento(aniversario: string): Date | null {
  if (!aniversario || aniversario.trim() === "") return null;

  const [dia, mes] = aniversario.split('/');
  if (!dia || !mes) return null;

  // Usar um ano que faça sentido (entre 1950 e 2005 baseado na idade típica de clientes)
  // Para simplificar, usar 1990 como padrão
  const ano = "1990";
  const dataString = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

  try {
    const data = new Date(dataString);
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      console.warn(`Data inválida para aniversário ${aniversario}`);
      return null;
    }
    return data;
  } catch (error) {
    console.warn(`Erro ao converter aniversário ${aniversario}:`, error);
    return null;
  }
}

// Função para normalizar telefone
function normalizeTelefone(telefone: string): string {
  if (!telefone) return "";
  
  // Remover caracteres especiais
  const numeroLimpo = telefone.replace(/\D/g, "");
  
  // Se o número tem 9 dígitos, assumir que é celular de PE (81)
  if (numeroLimpo.length === 9) {
    return `(81) ${numeroLimpo.slice(0, 5)}-${numeroLimpo.slice(5)}`;
  }
  
  // Se o número tem 10 dígitos, assumir que é fixo de PE (81)
  if (numeroLimpo.length === 10) {
    return `(81) ${numeroLimpo.slice(0, 4)}-${numeroLimpo.slice(4)}`;
  }
  
  // Se o número tem 11 dígitos, já tem DDD
  if (numeroLimpo.length === 11) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
  }
  
  // Se o número tem 8 dígitos, assumir que é fixo de PE sem DDD
  if (numeroLimpo.length === 8) {
    return `(81) ${numeroLimpo.slice(0, 4)}-${numeroLimpo.slice(4)}`;
  }
  
  return telefone; // Retornar original se não conseguir normalizar
}

// Função para normalizar nome para comparação
function normalizeNome(nome: string): string {
  return nome
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}

// Função principal para sincronizar dados
export async function syncClientesFromNotion(): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
  details: any[];
}> {
  const results = {
    success: true,
    updated: 0,
    errors: [] as string[],
    details: [] as any[],
  };

  try {
    console.log("Iniciando sincronização de clientes do Notion...");

    // Buscar todos os clientes existentes no app
    const clientesExistentes = await sql`
      SELECT id, nome, telefone, data_nascimento, user_simple_id
      FROM clientes
      ORDER BY nome
    `;

    console.log(`Encontrados ${clientesExistentes.length} clientes no app`);
    console.log(`Dados do Notion para ${notionClientData.length} clientes`);

    // Para cada cliente do Notion, tentar encontrar no app e atualizar
    for (const clienteNotion of notionClientData) {
      try {
        const nomeNormalizado = normalizeNome(clienteNotion.nome);
        
        // Procurar cliente no app por nome similar
        const clienteEncontrado = clientesExistentes.find((cliente: any) => {
          const nomeAppNormalizado = normalizeNome(cliente.nome);
          return (
            nomeAppNormalizado === nomeNormalizado ||
            nomeAppNormalizado.includes(nomeNormalizado) ||
            nomeNormalizado.includes(nomeAppNormalizado)
          );
        });

        if (clienteEncontrado) {
          const updates: any = {};
          let needsUpdate = false;

          // Verificar se precisa atualizar telefone
          const telefoneNotion = normalizeTelefone(clienteNotion.telefone);
          if (telefoneNotion && (!clienteEncontrado.telefone || clienteEncontrado.telefone.trim() === "")) {
            updates.telefone = telefoneNotion;
            needsUpdate = true;
          }

          // Verificar se precisa atualizar data de nascimento
          const dataNascimentoNotion = convertAniversarioToDataNascimento(clienteNotion.aniversario);
          if (dataNascimentoNotion && !clienteEncontrado.data_nascimento) {
            updates.data_nascimento = dataNascimentoNotion.toISOString().split('T')[0];
            needsUpdate = true;
          }

          if (needsUpdate) {
            // Atualizar no banco usando sql template
            let resultado;

            if (updates.telefone && updates.data_nascimento) {
              resultado = await sql`
                UPDATE clientes
                SET telefone = ${updates.telefone},
                    data_nascimento = ${updates.data_nascimento},
                    updated_at = NOW()
                WHERE id = ${clienteEncontrado.id}
                RETURNING *
              `;
            } else if (updates.telefone) {
              resultado = await sql`
                UPDATE clientes
                SET telefone = ${updates.telefone},
                    updated_at = NOW()
                WHERE id = ${clienteEncontrado.id}
                RETURNING *
              `;
            } else if (updates.data_nascimento) {
              resultado = await sql`
                UPDATE clientes
                SET data_nascimento = ${updates.data_nascimento},
                    updated_at = NOW()
                WHERE id = ${clienteEncontrado.id}
                RETURNING *
              `;
            }

            results.updated++;
            results.details.push({
              nome: clienteNotion.nome,
              clienteId: clienteEncontrado.id,
              updates: updates,
              status: "updated"
            });

            console.log(`✓ ${clienteNotion.nome} atualizado:`, updates);
          } else {
            results.details.push({
              nome: clienteNotion.nome,
              clienteId: clienteEncontrado.id,
              status: "no_update_needed"
            });
            console.log(`- ${clienteNotion.nome}: dados já estão completos`);
          }
        } else {
          results.details.push({
            nome: clienteNotion.nome,
            status: "not_found"
          });
          console.log(`? ${clienteNotion.nome}: não encontrado no app`);
        }
      } catch (error) {
        const errorMsg = `Erro ao processar ${clienteNotion.nome}: ${error instanceof Error ? error.message : error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`Sincronização concluída: ${results.updated} clientes atualizados`);
    
  } catch (error) {
    results.success = false;
    const errorMsg = `Erro geral na sincronização: ${error instanceof Error ? error.message : error}`;
    results.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return results;
}

// Função para testar a sincronização (modo dry-run)
export async function testSyncClientesFromNotion(): Promise<{
  matches: any[];
  notFound: string[];
  wouldUpdate: any[];
}> {
  const results = {
    matches: [] as any[],
    notFound: [] as string[],
    wouldUpdate: [] as any[],
  };

  try {
    // Buscar todos os clientes existentes no app
    const clientesExistentes = await sql`
      SELECT id, nome, telefone, data_nascimento
      FROM clientes
      ORDER BY nome
    `;

    // Para cada cliente do Notion, verificar se existe no app
    for (const clienteNotion of notionClientData) {
      const nomeNormalizado = normalizeNome(clienteNotion.nome);
      
      const clienteEncontrado = clientesExistentes.find((cliente: any) => {
        const nomeAppNormalizado = normalizeNome(cliente.nome);
        return (
          nomeAppNormalizado === nomeNormalizado ||
          nomeAppNormalizado.includes(nomeNormalizado) ||
          nomeNormalizado.includes(nomeAppNormalizado)
        );
      });

      if (clienteEncontrado) {
        const telefoneNotion = normalizeTelefone(clienteNotion.telefone);
        const dataNascimentoNotion = convertAniversarioToDataNascimento(clienteNotion.aniversario);
        
        const needsTelefoneUpdate = telefoneNotion && (!clienteEncontrado.telefone || clienteEncontrado.telefone.trim() === "");
        const needsDataNascimentoUpdate = dataNascimentoNotion && !clienteEncontrado.data_nascimento;

        results.matches.push({
          nomeNotion: clienteNotion.nome,
          nomeApp: clienteEncontrado.nome,
          telefoneAtual: clienteEncontrado.telefone,
          telefoneNotion: telefoneNotion,
          dataNascimentoAtual: clienteEncontrado.data_nascimento,
          dataNascimentoNotion: dataNascimentoNotion,
          needsTelefoneUpdate,
          needsDataNascimentoUpdate,
        });

        if (needsTelefoneUpdate || needsDataNascimentoUpdate) {
          results.wouldUpdate.push({
            nome: clienteNotion.nome,
            updates: {
              ...(needsTelefoneUpdate && { telefone: telefoneNotion }),
              ...(needsDataNascimentoUpdate && { data_nascimento: dataNascimentoNotion }),
            }
          });
        }
      } else {
        results.notFound.push(clienteNotion.nome);
      }
    }
  } catch (error) {
    console.error("Erro no teste de sincronização:", error);
  }

  return results;
}
