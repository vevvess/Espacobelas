import React from "react";
import { FiInfo, FiClock, FiCheckCircle, FiDollarSign } from "react-icons/fi";

export function StatusAutomaticoInfo() {
  return (
    <div className="bella-card bg-blue-50 border-blue-200">
      <div className="flex items-start space-x-3">
        <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 mb-2">
            Sistema de Status Automático
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="flex items-center space-x-2">
              <FiClock className="w-4 h-4" />
              <span>
                <strong>Início:</strong> Quando chegar o horário exato, muda
                automaticamente para "Em Andamento"
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FiDollarSign className="w-4 h-4" />
              <span>
                <strong>Finalização:</strong> Após a duração dos serviços,
                aparece minimizado aguardando pagamento
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-4 h-4" />
              <span>
                <strong>Conclusão:</strong> Admin confirma pagamento no card
                minimizado para finalizar
              </span>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
              <strong>Fluxo Completo:</strong>
              <br />
              • 09:00: Inicia automaticamente (amarelo)
              <br />
              • 10:40: Aguarda pagamento (laranja)
              <br />• Admin confirma → Concluído (roxo)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
