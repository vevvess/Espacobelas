import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiEyeOff,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  getCorOffline,
  getAllCoresOffline,
  getColorVariants,
  isLightColor,
} from "@/services/funcionarioColorsOffline";
import { getFuncionarios } from "@/services/funcionarioService";

interface Funcionario {
  id: string;
  nome: string;
  username: string;
  is_admin: boolean;
  ativo: boolean;
}

interface FuncionarioLegendaProps {
  agendamentos?: any[];
  className?: string;
}

export function FuncionarioLegenda({
  agendamentos = [],
  className = "",
}: FuncionarioLegendaProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [coresPersonalizadas, setCoresPersonalizadas] = useState<
    Record<string, string>
  >({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const funcionariosData = await getFuncionarios();
      const coresData = getAllCoresOffline();

      setFuncionarios(funcionariosData);
      setCoresPersonalizadas(coresData);
    } catch (error) {
      console.error("Erro ao carregar dados da legenda:", error);
    } finally {
      setLoading(false);
    }
  };

  // Contar quantos agendamentos cada funcionário tem
  const contarAgendamentosPorFuncionario = () => {
    const contadores: Record<string, number> = {};

    agendamentos.forEach((agendamento) => {
      const funcionariosDoAgendamento = new Set<string>();

      // Funcionário principal
      if (agendamento.funcionario_id) {
        funcionariosDoAgendamento.add(agendamento.funcionario_id);
      }

      // Funcionários dos serviços
      agendamento.servicos?.forEach((servico: any) => {
        if (servico.funcionario_id) {
          funcionariosDoAgendamento.add(servico.funcionario_id);
        }
      });

      // Incrementar contador para cada funcionário
      funcionariosDoAgendamento.forEach((funcionarioId) => {
        contadores[funcionarioId] = (contadores[funcionarioId] || 0) + 1;
      });
    });

    return contadores;
  };

  const contadores = contarAgendamentosPorFuncionario();

  // Ordenar funcionários por número de agendamentos (desc) e depois por nome
  const funcionariosOrdenados = [...funcionarios].sort((a, b) => {
    const countA = contadores[a.id] || 0;
    const countB = contadores[b.id] || 0;

    if (countA !== countB) {
      return countB - countA; // Decrescente por número de agendamentos
    }

    return a.nome.localeCompare(b.nome); // Alfabético por nome
  });

  // Filtrar apenas funcionários com agendamentos (para a versão compacta)
  const funcionariosComAgendamentos = funcionariosOrdenados.filter(
    (funcionario) => contadores[funcionario.id] > 0,
  );

  const funcionariosParaExibir = isExpanded
    ? funcionariosOrdenados
    : funcionariosComAgendamentos;

  if (loading) {
    return (
      <div className={`bella-card animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className={`bella-card ${className}`}>
        <button
          onClick={() => setIsVisible(true)}
          className="w-full flex items-center justify-between p-2 text-sm text-bella-600 hover:text-bella-800"
        >
          <span className="flex items-center space-x-2">
            <FiEye className="w-4 h-4" />
            <span>Mostrar Legenda de Funcionários</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bella-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-bella-600" />
          <h3 className="font-semibold text-bella-800">Funcionários</h3>
          {funcionariosComAgendamentos.length > 0 && (
            <span className="text-xs bg-bella-100 text-bella-600 px-2 py-1 rounded-full">
              {funcionariosComAgendamentos.length} ativo
              {funcionariosComAgendamentos.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {funcionarios.length > funcionariosComAgendamentos.length && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-bella-600 hover:text-bella-800 flex items-center space-x-1"
            >
              <span>{isExpanded ? "Compactar" : "Ver Todos"}</span>
              {isExpanded ? (
                <FiChevronUp className="w-3 h-3" />
              ) : (
                <FiChevronDown className="w-3 h-3" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsVisible(false)}
            className="text-bella-400 hover:text-bella-600"
          >
            <FiEyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="space-y-2">
        {funcionariosParaExibir.length === 0 ? (
          <p className="text-sm text-bella-500 italic text-center py-4">
            {isExpanded
              ? "Nenhum funcionário cadastrado"
              : "Nenhum funcionário com agendamentos hoje"}
          </p>
        ) : (
          funcionariosParaExibir.map((funcionario) => {
            const cor = getCorOffline(funcionario.id);
            const variants = getColorVariants(cor);
            const quantidade = contadores[funcionario.id] || 0;

            return (
              <div
                key={funcionario.id}
                className="flex items-center justify-between p-2 rounded-lg border transition-colors hover:shadow-sm"
                style={{
                  backgroundColor: variants.light,
                  borderColor: variants.border,
                }}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border"
                    style={{
                      backgroundColor: cor,
                      borderColor: variants.border,
                      color: isLightColor(cor) ? "#000" : "#fff",
                    }}
                  >
                    {funcionario.nome.charAt(0).toUpperCase()}
                  </div>

                  {/* Nome */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-bella-800">
                        {funcionario.nome}
                      </span>
                      {funcionario.is_admin && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-bella-600">
                      @{funcionario.username}
                    </div>
                  </div>
                </div>

                {/* Contador */}
                {quantidade > 0 && (
                  <div className="text-xs bg-white bg-opacity-70 text-bella-700 px-2 py-1 rounded border">
                    {quantidade} agend.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer com estatísticas */}
      {agendamentos.length > 0 && (
        <div className="mt-4 pt-3 border-t border-bella-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-bella-600">
            <div className="text-center">
              <div className="font-semibold text-bella-800">
                {agendamentos.length}
              </div>
              <div>Agendamentos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-bella-800">
                {funcionariosComAgendamentos.length}
              </div>
              <div>Funcionários</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
