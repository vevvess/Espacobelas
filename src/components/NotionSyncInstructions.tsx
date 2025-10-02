import React from "react";
import { FiInfo, FiCheck, FiPhone, FiCalendar } from "react-icons/fi";

export default function NotionSyncInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <FiInfo className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-800 mb-2">
            Como funciona a sincronização com Notion
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              Esta ferramenta atualiza automaticamente os dados dos clientes no app 
              usando informações do banco de dados do Notion.
            </p>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4" />
                <span><strong>Telefones:</strong> Serão adicionados apenas para clientes que não têm telefone cadastrado</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span><strong>Aniversários:</strong> Serão convertidos em datas de nascimento para clientes sem data cadastrada</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4" />
                <span><strong>Correspondência:</strong> Clientes são encontrados por nome similar (ignora acentos e maiúsculas)</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-100 rounded border-l-4 border-blue-400">
              <p className="font-medium">Exemplo:</p>
              <p>Se Adriane Lima no Notion tem telefone "(81) 98886-1850" e aniversário "17/06", 
              e no app ela existe mas sem telefone e data de nascimento, 
              a sincronização irá adicionar esses dados automaticamente.</p>
            </div>

            <div className="mt-3 text-xs text-blue-600">
              <strong>Dica:</strong> Sempre execute "Testar Sincronização" primeiro para ver 
              quais clientes serão afetados antes de executar a sincronização real.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
