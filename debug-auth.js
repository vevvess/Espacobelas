// Script para debugar autenticação
console.log('=== DEBUG AUTENTICAÇÃO ===');

// Verificar localStorage
const savedUser = localStorage.getItem('simple_auth_user');
console.log('LocalStorage user:', savedUser ? JSON.parse(savedUser) : 'Nenhum');

// Verificar se há usuario no contexto React
console.log('Estado atual da aplicação:', window.location.href);

// Testar login direto
async function testLogin() {
  try {
    // Fazer login com Weslley
    console.log('Testando login com Weslley...');
    
    // Simular que o usuario foi setado
    const adminUser = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      username: "Weslley",
      nome: "Weslley Raphael",
      is_admin: true,
      can_edit_all: true,
      ativo: true,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('simple_auth_user', JSON.stringify(adminUser));
    console.log('Usuario salvo no localStorage:', adminUser);
    
    // Recarregar página
    window.location.reload();
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar teste
testLogin();
