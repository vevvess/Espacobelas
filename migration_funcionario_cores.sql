-- Migração para adicionar tabela de cores dos funcionários
-- Execute este SQL no seu banco Neon para criar a tabela

CREATE TABLE IF NOT EXISTS funcionario_cores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID NOT NULL REFERENCES users_simple(id) ON DELETE CASCADE,
  cor_hex VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(funcionario_id)
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_funcionario_cores_funcionario_id 
ON funcionario_cores(funcionario_id);

-- Comentários para documentação
COMMENT ON TABLE funcionario_cores IS 'Armazena cores personalizadas para cada funcionário';
COMMENT ON COLUMN funcionario_cores.funcionario_id IS 'Referência ao funcionário (users_simple)';
COMMENT ON COLUMN funcionario_cores.cor_hex IS 'Cor em formato hexadecimal (ex: #3B82F6)';

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela funcionario_cores criada com sucesso!' as status;
