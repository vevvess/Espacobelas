// Teste simples da funcionalidade de sincronização
// Este arquivo é apenas para demonstração e testes manuais

const testData = {
  notionClients: [
    {
      nome: "Adriane Lima",
      telefone: "(81) 98886-1850",
      aniversario: "17/06",
    },
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
  ],
  
  appClients: [
    {
      id: "1",
      nome: "Adriane Lima",
      telefone: null,
      data_nascimento: null,
    },
    {
      id: "2", 
      nome: "Leticia",
      telefone: "",
      data_nascimento: null,
    },
    {
      id: "3",
      nome: "João Silva", // não existe no Notion
      telefone: "(81) 99999-9999",
      data_nascimento: "1990-01-01",
    },
  ]
};

// Função para testar correspondência de nomes
function normalizeNome(nome) {
  return nome
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}

// Testar correspondência
console.log("=== TESTE DE CORRESPONDÊNCIA DE NOMES ===");
testData.notionClients.forEach(clienteNotion => {
  console.log(`\nBuscando correspondência para: ${clienteNotion.nome}`);
  const nomeNormalizado = normalizeNome(clienteNotion.nome);
  
  const matches = testData.appClients.filter(clienteApp => {
    const nomeAppNormalizado = normalizeNome(clienteApp.nome);
    return (
      nomeAppNormalizado === nomeNormalizado ||
      nomeAppNormalizado.includes(nomeNormalizado) ||
      nomeNormalizado.includes(nomeAppNormalizado)
    );
  });
  
  if (matches.length > 0) {
    matches.forEach(match => {
      console.log(`  ✓ Encontrado: ${match.nome} (ID: ${match.id})`);
      
      // Verificar se precisa de updates
      const needsTelefone = clienteNotion.telefone && (!match.telefone || match.telefone.trim() === "");
      const needsDataNascimento = clienteNotion.aniversario && !match.data_nascimento;
      
      if (needsTelefone || needsDataNascimento) {
        console.log(`    📝 Atualizações necessárias:`);
        if (needsTelefone) console.log(`      - Telefone: ${clienteNotion.telefone}`);
        if (needsDataNascimento) console.log(`      - Aniversário: ${clienteNotion.aniversario}`);
      } else {
        console.log(`    ✅ Dados já completos`);
      }
    });
  } else {
    console.log(`  ❌ Não encontrado no app`);
  }
});

console.log("\n=== RESUMO ===");
const totalNotion = testData.notionClients.length;
const totalApp = testData.appClients.length;
const matched = testData.notionClients.filter(clienteNotion => {
  const nomeNormalizado = normalizeNome(clienteNotion.nome);
  return testData.appClients.some(clienteApp => {
    const nomeAppNormalizado = normalizeNome(clienteApp.nome);
    return (
      nomeAppNormalizado === nomeNormalizado ||
      nomeAppNormalizado.includes(nomeNormalizado) ||
      nomeNormalizado.includes(nomeAppNormalizado)
    );
  });
}).length;

console.log(`Total de clientes no Notion: ${totalNotion}`);
console.log(`Total de clientes no App: ${totalApp}`);
console.log(`Correspondências encontradas: ${matched}`);
console.log(`Taxa de correspondência: ${Math.round((matched / totalNotion) * 100)}%`);
