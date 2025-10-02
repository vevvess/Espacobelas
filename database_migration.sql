-- Script para criar as novas tabelas para agendamentos com múltiplos serviços e pagamentos
-- Execute este script no seu banco Neon quando possível

-- Tabela para relacionar serviços aos agendamentos com funcionários
CREATE TABLE IF NOT EXISTS agendamento_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
    funcionario_id UUID REFERENCES users_simple(id) ON DELETE SET NULL,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para múltiplas formas de pagamento por agendamento
CREATE TABLE IF NOT EXISTS agendamento_pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    forma_pagamento VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamento_servicos_agendamento_id ON agendamento_servicos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_servicos_funcionario_id ON agendamento_servicos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_pagamentos_agendamento_id ON agendamento_pagamentos(agendamento_id);

-- Adicionar campo valor_total na tabela agendamentos se não existir
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agendamentos' 
                   AND column_name = 'valor_total') THEN
        ALTER TABLE agendamentos ADD COLUMN valor_total DECIMAL(10,2);
    END IF;
END $$;

-- Remover campos antigos que não são mais necessários
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'agendamentos' 
               AND column_name = 'servico_id') THEN
        ALTER TABLE agendamentos DROP COLUMN servico_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'agendamentos' 
               AND column_name = 'valor') THEN
        ALTER TABLE agendamentos DROP COLUMN valor;
    END IF;
END $$;
