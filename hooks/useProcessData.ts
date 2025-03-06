// hooks/useProcessData.ts
import { useState, useEffect } from "react";
import { ProcessType } from "@/types/process";

// Função auxiliar para salvar no localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Função auxiliar para carregar do localStorage
const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export function useProcessData() {
  const [processos, setProcessos] = useState<ProcessType[]>([]);

  // Carrega os dados do localStorage na inicialização
  useEffect(() => {
    const dadosSalvos = loadFromLocalStorage("processos");
    if (dadosSalvos) {
      setProcessos(dadosSalvos);
    } else {
      // Dados iniciais para demonstração
      const dadosIniciais: ProcessType[] = [
        {
          id: "processo-1",
          referencia: "IMP-2023-001",
          tipo: "importacao",
          importador: "Empresa ABC Ltda",
          adquirente: "ABC Comércio",
          fornecedor: "Shanghai Trading Co.",
          referenciaCliente: "PO-45678",
          modal: "maritimo",
          status: "aguardando-embarque",
          dataCriacao: "2023-06-15T10:30:00Z",
          agenteCargas: "Global Shipping"
        },
        {
          id: "processo-2",
          referencia: "IMP-2023-002",
          tipo: "importacao",
          importador: "Indústrias XYZ",
          adquirente: "XYZ Manufatura",
          fornecedor: "German Machines GmbH",
          referenciaCliente: "REF-9876",
          modal: "aereo",
          status: "em-transito",
          dataCriacao: "2023-06-20T14:15:00Z"
        },
        {
          id: "processo-3",
          referencia: "EXP-2023-001",
          tipo: "exportacao",
          exportador: "Produtos Brasileiros S.A.",
          adquirente: "US Distributors Inc.",
          fornecedor: "Produtos Brasileiros S.A.",
          referenciaCliente: "EXP2023-123",
          modal: "maritimo",
          status: "aguardando-registro",
          dataCriacao: "2023-06-25T09:00:00Z"
        }
      ];
      setProcessos(dadosIniciais);
      saveToLocalStorage("processos", dadosIniciais);
    }
  }, []);

  // Função para adicionar um novo processo
  const adicionarProcesso = (novoProcesso: ProcessType) => {
    const processosAtualizados = [...processos, novoProcesso];
    setProcessos(processosAtualizados);
    saveToLocalStorage("processos", processosAtualizados);
  };

  // Função para atualizar um processo existente
  const atualizarProcesso = (processoAtualizado: ProcessType) => {
    const processosAtualizados = processos.map(processo => 
      processo.id === processoAtualizado.id ? processoAtualizado : processo
    );
    setProcessos(processosAtualizados);
    saveToLocalStorage("processos", processosAtualizados);
  };

  // Função para remover um processo
  const removerProcesso = (id: string) => {
    const processosAtualizados = processos.filter(processo => processo.id !== id);
    setProcessos(processosAtualizados);
    saveToLocalStorage("processos", processosAtualizados);
  };

  // Função para atualizar o status de um processo
  const atualizarStatusProcesso = (id: string, novoStatus: string) => {
    const processosAtualizados = processos.map(processo => {
      if (processo.id === id) {
        return { ...processo, status: novoStatus };
      }
      return processo;
    });
    setProcessos(processosAtualizados);
    saveToLocalStorage("processos", processosAtualizados);
  };

  return {
    processos,
    adicionarProcesso,
    atualizarProcesso,
    removerProcesso,
    atualizarStatusProcesso
  };
}