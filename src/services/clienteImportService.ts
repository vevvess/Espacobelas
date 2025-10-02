import { sql } from "@/lib/neon";
import { aniversarioParaData } from "../utils/dateFormatters";

// Lista de clientes fornecida pelo usuário
const clientesParaImportar = [
  { nome: "SABRINA", aniversario: "02/01", telefone: "" },
  { nome: "LANE", aniversario: "04/01", telefone: "86654683" },
  { nome: "FERNANDA DELGADO", aniversario: "05/01", telefone: "993547226" },
  { nome: "ELIONAI", aniversario: "07/01", telefone: "986197035" },
  { nome: "ANA MARIA", aniversario: "09/01", telefone: "988678849" },
  { nome: "IRIREIA", aniversario: "09/01", telefone: "985862659" },
  { nome: "ANA CELIA", aniversario: "14/01", telefone: "9888479466" },
  { nome: "TEREZA CRISTINA", aniversario: "20/01", telefone: "988392352" },
  { nome: "ALCIONE", aniversario: "21/01", telefone: "998603548" },
  { nome: "DARLEN", aniversario: "22/01", telefone: "99176270" },
  { nome: "LANE LIMA", aniversario: "25/01", telefone: "96268987" },
  { nome: "GUILHERMINA", aniversario: "26/01", telefone: "985847485" },
  { nome: "JULIANA", aniversario: "29/01", telefone: "973283373" },
  { nome: "ANA CAROLINA", aniversario: "02/02", telefone: "986188404" },
  { nome: "KAILA", aniversario: "02/02", telefone: "8173448988" },
  { nome: "ARIMA", aniversario: "05/02", telefone: "" },
  { nome: "JOSE", aniversario: "05/02", telefone: "" },
  { nome: "MARCELA", aniversario: "09/02", telefone: "984928703" },
  { nome: "TACIANA", aniversario: "10/02", telefone: "99578014" },
  { nome: "LIDIANE", aniversario: "11/02", telefone: "" },
  { nome: "JOSY", aniversario: "15/02", telefone: "989082505" },
  { nome: "IASMIN", aniversario: "23/02", telefone: "819967000000" },
  { nome: "ELIZAMA", aniversario: "25/02", telefone: "" },
  { nome: "WENDY", aniversario: "21/02", telefone: "" },
  { nome: "KLAVY", aniversario: "22/02", telefone: "9973433832" },
  { nome: "CARLA", aniversario: "01/03", telefone: "81995826565" },
  { nome: "ANDREIA", aniversario: "10/03", telefone: "" },
  { nome: "NATALY", aniversario: "14/03", telefone: "995421727" },
  { nome: "VERUSKA", aniversario: "15/03", telefone: "81995486651" },
  { nome: "TAISA", aniversario: "19/03", telefone: "993359215" },
  { nome: "EDVANIA", aniversario: "19/03", telefone: "987385907" },
  { nome: "ANA PAULA", aniversario: "19/03", telefone: "983594093" },
  { nome: "LARA", aniversario: "20/03", telefone: "95396356" },
  { nome: "RENATA", aniversario: "20/03", telefone: "" },
  { nome: "SINTIA", aniversario: "27/03", telefone: "96710074" },
  { nome: "CATARINA", aniversario: "28/03", telefone: "996235888" },
  { nome: "MANU", aniversario: "29/03", telefone: "996718111" },
  { nome: "MARLEI", aniversario: "01/04", telefone: "992929793" },
  { nome: "SANDRA", aniversario: "04/04", telefone: "998526514" },
  { nome: "ELIANE MARIA", aniversario: "13/04", telefone: "97695286" },
  { nome: "BRENDA", aniversario: "13/04", telefone: "96015826" },
  { nome: "CRISTIANE MARIA", aniversario: "15/04", telefone: "998379791" },
  { nome: "ELIELSON", aniversario: "18/04", telefone: "" },
  { nome: "SUELEN", aniversario: "18/04", telefone: "997468208" },
  { nome: "MARIA EDUARDA", aniversario: "19/04", telefone: "985625229" },
  { nome: "JULIANA", aniversario: "19/04", telefone: "988947250" },
  { nome: "LAURA", aniversario: "23/04", telefone: "8781431631" },
  { nome: "JESSICA", aniversario: "24/04", telefone: "96645526" },
  { nome: "NUELI", aniversario: "26/04", telefone: "985770708" },
  { nome: "CIDA", aniversario: "28/04", telefone: "97695286" },
  { nome: "POLY", aniversario: "28/04", telefone: "98661772" },
  { nome: "ANINHA", aniversario: "30/04", telefone: "986187579" },
  { nome: "FATIMA", aniversario: "30/04", telefone: "9957300216" },
  { nome: "SUELI", aniversario: "05/05", telefone: "98076395" },
  { nome: "LARISSA", aniversario: "08/05", telefone: "987700728" },
  { nome: "VITÓRIA", aniversario: "10/05", telefone: "" },
  { nome: "JOSY", aniversario: "11/05", telefone: "8197220962" },
  { nome: "DONA MARCIA", aniversario: "12/05", telefone: "986017981" },
  { nome: "VITÓRIA", aniversario: "14/05", telefone: "985112419" },
  { nome: "IZABELA", aniversario: "27/05", telefone: "" },
  { nome: "ADENILZA", aniversario: "05/06", telefone: "" },
  { nome: "ANALICE MAE DE ADLA", aniversario: "06/06", telefone: "" },
  { nome: "CRISTINA", aniversario: "06/06", telefone: "97542415" },
  { nome: "ELIZABETH GODELHA", aniversario: "08/06", telefone: "986231354" },
  { nome: "ANA CAROLINA", aniversario: "12/06", telefone: "994660097" },
  { nome: "ROSY", aniversario: "16/06", telefone: "995942334" },
  { nome: "CELIA", aniversario: "19/06", telefone: "" },
  { nome: "PATRICIA", aniversario: "22/06", telefone: "986033175" },
  { nome: "LAUDICEIA", aniversario: "27/06", telefone: "9897770177" },
  { nome: "CIDA", aniversario: "01/06", telefone: "" },
  { nome: "JESSICA", aniversario: "01/06", telefone: "81986057313" },
  { nome: "LIVIA", aniversario: "01/06", telefone: "81983328040" },
  { nome: "PATRICIA", aniversario: "04/06", telefone: "" },
  { nome: "KYARA", aniversario: "09/06", telefone: "999686127" },
  { nome: "NATALIA", aniversario: "26/06", telefone: "8192307556" },
  { nome: "MIRELLY", aniversario: "01/07", telefone: "99142274" },
  { nome: "MARIANE", aniversario: "01/07", telefone: "996963083" },
  { nome: "JULIANA", aniversario: "05/07", telefone: "988203101" },
  { nome: "THAMIRES", aniversario: "06/07", telefone: "99773480" },
  { nome: "LARISSAYSA", aniversario: "11/07", telefone: "999297077" },
  { nome: "FERNANDA DE FATIMA", aniversario: "14/07", telefone: "" },
  { nome: "GABRIELA", aniversario: "18/07", telefone: "99322843" },
  { nome: "MIRELA", aniversario: "19/07", telefone: "983378893" },
  { nome: "NATALIA", aniversario: "26/07", telefone: "986971050" },
  { nome: "LUCIA", aniversario: "27/07", telefone: "8197133074" },
  { nome: "VELUZA AZEVEDO", aniversario: "28/07", telefone: "985561320" },
  { nome: "MARIA", aniversario: "07/08", telefone: "982176314" },
  { nome: "RUNILDA", aniversario: "08/08", telefone: "21995480025" },
  { nome: "JO", aniversario: "11/08", telefone: "996249637" },
  { nome: "LEIDE", aniversario: "13/08", telefone: "999890349" },
  { nome: "ROSINHA", aniversario: "15/08", telefone: "986519481" },
  { nome: "RAISA", aniversario: "16/08", telefone: "992924886" },
  { nome: "VINICIUS", aniversario: "17/08", telefone: "989217291" },
  { nome: "CLAUDINEIA", aniversario: "18/08", telefone: "984685647" },
  { nome: "OLIVIA", aniversario: "21/08", telefone: "988588879" },
  { nome: "VERA", aniversario: "21/08", telefone: "988507033" },
  { nome: "FLAVIA", aniversario: "21/08", telefone: "" },
  { nome: "ERICA", aniversario: "23/08", telefone: "96209903" },
  { nome: "JOSEIMEIA", aniversario: "23/08", telefone: "988316152" },
  { nome: "ANA CLAUDIA", aniversario: "25/08", telefone: "986058050" },
  { nome: "ROSANGELA", aniversario: "26/08", telefone: "991872359" },
  { nome: "NATALIE", aniversario: "27/08", telefone: "8198952768" },
  { nome: "MAYLANE", aniversario: "29/08", telefone: "985580277" },
  { nome: "CECILIA", aniversario: "30/08", telefone: "81985603053" },
  { nome: "MARIA EDUARDA", aniversario: "01/09", telefone: "" },
  { nome: "MARIA", aniversario: "01/09", telefone: "11992372741" },
  { nome: "ROSA", aniversario: "02/09", telefone: "984599585" },
  { nome: "MARGGARIDA", aniversario: "09/09", telefone: "8196303481" },
  { nome: "AMANDA", aniversario: "14/09", telefone: "" },
  { nome: "LETICIA", aniversario: "17/09", telefone: "99064708" },
  { nome: "ANA PAULA", aniversario: "17/09", telefone: "81986507636" },
  { nome: "PATRICIA CRISTINA", aniversario: "20/09", telefone: "" },
  { nome: "TEREZINHA", aniversario: "22/09", telefone: "981823180" },
  { nome: "TEREZA", aniversario: "22/09", telefone: "9823180" },
  { nome: "BETANIA", aniversario: "29/09", telefone: "8198812269" },
  { nome: "KAILA", aniversario: "02/10", telefone: "8173448988" },
  { nome: "RAFAELA FRANCISCA", aniversario: "02/10", telefone: "95563242" },
  { nome: "FABIANA FILHA DE NA", aniversario: "05/10", telefone: "981818637" },
  { nome: "JACK GUERRA", aniversario: "10/10", telefone: "99979602" },
  { nome: "MARIA NATALICE", aniversario: "11/10", telefone: "98191789" },
  { nome: "FATIMA", aniversario: "20/10", telefone: "994349470" },
  { nome: "MARINALVA", aniversario: "20/10", telefone: "983760490" },
  { nome: "RAFAELA AQUINA", aniversario: "21/10", telefone: "81984033042" },
  { nome: "MAGDA", aniversario: "22/10", telefone: "995694383" },
  { nome: "FABIANA", aniversario: "22/10", telefone: "992931716" },
  { nome: "LUCIANE DE MARQUES", aniversario: "24/10", telefone: "982333927" },
  { nome: "SANDRA AMARAL", aniversario: "26/10", telefone: "" },
  { nome: "ERICA", aniversario: "26/10", telefone: "8199877597" },
  { nome: "INGRID", aniversario: "28/10", telefone: "986749892" },
  { nome: "STEFANIA", aniversario: "30/10", telefone: "984489609" },
  { nome: "RAYANE ARAUJO", aniversario: "31/10", telefone: "989989967" },
  { nome: "JULIANA", aniversario: "06/11", telefone: "992093777" },
  { nome: "MARIA NATALICE", aniversario: "11/11", telefone: "98191789" },
  { nome: "JULIA", aniversario: "14/11", telefone: "983779543" },
  { nome: "JOSIANE", aniversario: "17/11", telefone: "987560945" },
  { nome: "ELIZANGELA", aniversario: "17/11", telefone: "" },
  { nome: "JOSEANE", aniversario: "17/11", telefone: "987560945" },
  { nome: "MARIANA", aniversario: "19/11", telefone: "86233739" },
  { nome: "SUANEY", aniversario: "23/11", telefone: "81986200143" },
  { nome: "ELIUMA BRITO", aniversario: "23/11", telefone: "9864405883" },
  { nome: "BEATRIZ", aniversario: "24/11", telefone: "98652328" },
  { nome: "ANA PAULA", aniversario: "26/11", telefone: "" },
  { nome: "LUCIANA", aniversario: "27/11", telefone: "987200241" },
  { nome: "LUCIANA", aniversario: "30/11", telefone: "994945472" },
  { nome: "MARIA HELENA", aniversario: "02/12", telefone: "96512126" },
  { nome: "ANALICE", aniversario: "02/12", telefone: "988588444" },
  { nome: "NEIDE", aniversario: "02/12", telefone: "988588444" },
  { nome: "LAIANE", aniversario: "03/12", telefone: "988105431" },
  { nome: "SUZANA", aniversario: "04/12", telefone: "986253995" },
  { nome: "NEISE", aniversario: "08/12", telefone: "996653391" },
  { nome: "BRENDA", aniversario: "13/12", telefone: "96015826" },
  { nome: "ROSELY NOGUEIRA", aniversario: "23/12", telefone: "996418070" },
  { nome: "ALINE", aniversario: "25/12", telefone: "996633715" },
  { nome: "FERNANDA MOURA", aniversario: "25/12", telefone: "" },
  { nome: "TACIANA", aniversario: "28/12", telefone: "" },
  { nome: "LETICIA", aniversario: "28/12", telefone: "8191821605" },
  { nome: "MIRELA", aniversario: "19/12", telefone: "983378893" },
  { nome: "ARACI", aniversario: "19/03", telefone: "(81) 99622-8285" },
  { nome: "MARIA DOS PRAZERES", aniversario: "22/03", telefone: "(81) 98642-4313" },
  { nome: "CATIA", aniversario: "27/03", telefone: "(81) 99858-5458" },
  { nome: "CATARINE", aniversario: "28/03", telefone: "(81) 99711-6117" },
  { nome: "ELIZABETH CRISTINA", aniversario: "02/03", telefone: "(81) 98648-6164" },
];

// Função para normalizar nome para comparação
function normalizeNome(nome: string): string {
  return nome
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}

// Função para normalizar telefone
function normalizeTelefone(telefone: string): string {
  if (!telefone || telefone.trim() === "") return "";
  
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

// Função principal para importar clientes
export async function importarClientesLista(userId: string): Promise<{
  success: boolean;
  novosClientes: number;
  clientesAtualizados: number;
  clientesIgnorados: number;
  errors: string[];
  details: any[];
}> {
  const results = {
    success: true,
    novosClientes: 0,
    clientesAtualizados: 0,
    clientesIgnorados: 0,
    errors: [] as string[],
    details: [] as any[],
  };

  try {
    console.log("Iniciando importação de clientes...");

    // Buscar todos os clientes existentes no app
    const clientesExistentes = await sql`
      SELECT id, nome, telefone, data_nascimento, user_simple_id
      FROM clientes
      ORDER BY nome
    `;

    console.log(`Encontrados ${clientesExistentes.length} clientes existentes no app`);
    console.log(`Lista para importar: ${clientesParaImportar.length} clientes`);

    // Para cada cliente da lista, verificar se deve ser importado ou atualizado
    for (const clienteLista of clientesParaImportar) {
      try {
        const nomeNormalizado = normalizeNome(clienteLista.nome);
        
        // Procurar cliente no app por nome similar
        const clienteExistente = clientesExistentes.find((cliente: any) => {
          const nomeAppNormalizado = normalizeNome(cliente.nome);
          return (
            nomeAppNormalizado === nomeNormalizado ||
            nomeAppNormalizado.includes(nomeNormalizado) ||
            nomeNormalizado.includes(nomeAppNormalizado)
          );
        });

        if (clienteExistente) {
          // Cliente já existe - verificar se precisa atualizar informações faltantes
          const updates: any = {};
          let needsUpdate = false;

          // Verificar se precisa atualizar telefone
          const telefoneNormalizado = normalizeTelefone(clienteLista.telefone);
          if (telefoneNormalizado && (!clienteExistente.telefone || clienteExistente.telefone.trim() === "")) {
            updates.telefone = telefoneNormalizado;
            needsUpdate = true;
          }

          // Verificar se precisa atualizar data de nascimento
          const dataNascimento = aniversarioParaData(clienteLista.aniversario);
          if (dataNascimento && !clienteExistente.data_nascimento) {
            updates.data_nascimento = dataNascimento.toISOString().split('T')[0];
            needsUpdate = true;
          }

          if (needsUpdate) {
            // Atualizar cliente existente
            if (updates.telefone && updates.data_nascimento) {
              await sql`
                UPDATE clientes 
                SET telefone = ${updates.telefone}, 
                    data_nascimento = ${updates.data_nascimento}, 
                    updated_at = NOW()
                WHERE id = ${clienteExistente.id}
              `;
            } else if (updates.telefone) {
              await sql`
                UPDATE clientes 
                SET telefone = ${updates.telefone}, 
                    updated_at = NOW()
                WHERE id = ${clienteExistente.id}
              `;
            } else if (updates.data_nascimento) {
              await sql`
                UPDATE clientes 
                SET data_nascimento = ${updates.data_nascimento}, 
                    updated_at = NOW()
                WHERE id = ${clienteExistente.id}
              `;
            }

            results.clientesAtualizados++;
            results.details.push({
              nome: clienteLista.nome,
              clienteId: clienteExistente.id,
              acao: "atualizado",
              updates: updates
            });

            console.log(`✓ ${clienteLista.nome} atualizado:`, updates);
          } else {
            results.clientesIgnorados++;
            results.details.push({
              nome: clienteLista.nome,
              clienteId: clienteExistente.id,
              acao: "ignorado",
              motivo: "dados já completos"
            });
            console.log(`- ${clienteLista.nome}: dados já completos, ignorado`);
          }
        } else {
          // Cliente não existe - criar novo
          const telefoneNormalizado = normalizeTelefone(clienteLista.telefone);
          const dataNascimento = aniversarioParaData(clienteLista.aniversario);

          const resultado = await sql`
            INSERT INTO clientes (
              user_simple_id, 
              nome, 
              telefone, 
              data_nascimento, 
              created_at, 
              updated_at
            )
            VALUES (
              ${userId}, 
              ${clienteLista.nome}, 
              ${telefoneNormalizado || null}, 
              ${dataNascimento ? dataNascimento.toISOString().split('T')[0] : null}, 
              NOW(), 
              NOW()
            )
            RETURNING *
          `;

          results.novosClientes++;
          results.details.push({
            nome: clienteLista.nome,
            clienteId: resultado[0].id,
            acao: "criado",
            telefone: telefoneNormalizado,
            aniversario: clienteLista.aniversario
          });

          console.log(`+ ${clienteLista.nome}: novo cliente criado`);
        }
      } catch (error) {
        const errorMsg = `Erro ao processar ${clienteLista.nome}: ${error instanceof Error ? error.message : error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`Importação concluída:`);
    console.log(`- Novos clientes: ${results.novosClientes}`);
    console.log(`- Clientes atualizados: ${results.clientesAtualizados}`);
    console.log(`- Clientes ignorados: ${results.clientesIgnorados}`);
    console.log(`- Erros: ${results.errors.length}`);
    
  } catch (error) {
    results.success = false;
    const errorMsg = `Erro geral na importação: ${error instanceof Error ? error.message : error}`;
    results.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return results;
}

// Função para preview da importação (modo dry-run)
export async function previewImportacaoClientes(): Promise<{
  novosClientes: any[];
  clientesParaAtualizar: any[];
  clientesIgnorados: any[];
  total: number;
}> {
  const results = {
    novosClientes: [] as any[],
    clientesParaAtualizar: [] as any[],
    clientesIgnorados: [] as any[],
    total: clientesParaImportar.length,
  };

  try {
    // Buscar todos os clientes existentes no app
    const clientesExistentes = await sql`
      SELECT id, nome, telefone, data_nascimento
      FROM clientes
      ORDER BY nome
    `;

    // Para cada cliente da lista, verificar o que seria feito
    for (const clienteLista of clientesParaImportar) {
      const nomeNormalizado = normalizeNome(clienteLista.nome);
      
      const clienteExistente = clientesExistentes.find((cliente: any) => {
        const nomeAppNormalizado = normalizeNome(cliente.nome);
        return (
          nomeAppNormalizado === nomeNormalizado ||
          nomeAppNormalizado.includes(nomeNormalizado) ||
          nomeNormalizado.includes(nomeAppNormalizado)
        );
      });

      if (clienteExistente) {
        const telefoneNormalizado = normalizeTelefone(clienteLista.telefone);
        const dataNascimento = aniversarioParaData(clienteLista.aniversario);
        
        const needsTelefoneUpdate = telefoneNormalizado && (!clienteExistente.telefone || clienteExistente.telefone.trim() === "");
        const needsDataNascimentoUpdate = dataNascimento && !clienteExistente.data_nascimento;

        if (needsTelefoneUpdate || needsDataNascimentoUpdate) {
          results.clientesParaAtualizar.push({
            nome: clienteLista.nome,
            nomeExistente: clienteExistente.nome,
            updates: {
              ...(needsTelefoneUpdate && { telefone: telefoneNormalizado }),
              ...(needsDataNascimentoUpdate && { aniversario: clienteLista.aniversario }),
            }
          });
        } else {
          results.clientesIgnorados.push({
            nome: clienteLista.nome,
            motivo: "dados já completos"
          });
        }
      } else {
        results.novosClientes.push({
          nome: clienteLista.nome,
          telefone: normalizeTelefone(clienteLista.telefone),
          aniversario: clienteLista.aniversario
        });
      }
    }
  } catch (error) {
    console.error("Erro no preview de importação:", error);
  }

  return results;
}
