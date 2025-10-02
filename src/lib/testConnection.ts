import { sql } from "./neon";

// Teste simples de conectividade
export const testDatabaseConnection = async () => {
  try {
    console.log("🔍 Testando conectividade básica...");

    // Teste básico
    const basicTest = await sql`SELECT 1 as test, NOW() as current_time`;
    console.log("✅ Teste básico:", basicTest[0]);

    // Teste de tabelas
    const tablesTest = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('agendamentos', 'clientes', 'servicos', 'users_simple')
    `;
    console.log(
      "✅ Tabelas encontradas:",
      tablesTest.map((t) => t.table_name),
    );

    // Teste de usuários
    const usersTest = await sql`SELECT COUNT(*) as total FROM users_simple`;
    console.log("✅ Total de usuários:", usersTest[0].total);

    return { success: true, message: "Conectividade OK" };
  } catch (error) {
    console.error("❌ Erro no teste de conectividade:", error);
    return { success: false, error: error?.message || "Erro desconhecido" };
  }
};

// Disponibilizar globalmente para debug
if (typeof window !== "undefined") {
  (window as any).testDatabaseConnection = testDatabaseConnection;
  console.log("🔧 Comando disponível: window.testDatabaseConnection()");
}
