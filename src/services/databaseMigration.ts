import { sql } from "@/lib/neon";

/**
 * Adiciona a coluna funcionario_id à tabela agendamentos se ela não existir
 */
export async function addFuncionarioIdColumn(): Promise<boolean> {
  try {
    console.log("Verificando se coluna funcionario_id existe...");

    // Verificar se a coluna já existe
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'funcionario_id'
      ) as exists
    `;

    if (columnExists[0].exists) {
      console.log("Coluna funcionario_id já existe");
      return true;
    }

    console.log("Adicionando coluna funcionario_id...");

    // Adicionar a coluna
    await sql`
      ALTER TABLE agendamentos 
      ADD COLUMN funcionario_id UUID REFERENCES users_simple(id)
    `;

    console.log("Coluna funcionario_id adicionada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao adicionar coluna funcionario_id:", error);
    return false;
  }
}

/**
 * Executa todas as migrações necessárias
 */
export async function runMigrations(): Promise<void> {
  console.log("Executando migrações do banco de dados...");

  try {
    await addFuncionarioIdColumn();
    console.log("Migrações executadas com sucesso");
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
  }
}
