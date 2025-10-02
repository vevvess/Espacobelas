import { useEffect, useState } from "react";
import { getFuncionarios, type Funcionario } from "@/services/funcionarioService";

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFuncionarios();
      setFuncionarios(data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { funcionarios, loading, error, reload: load };
}
