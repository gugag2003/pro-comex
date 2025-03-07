// hooks/useProcessData.ts
import { useState, useEffect } from "react";
import { ProcessType } from "@/types/process";

// Função auxiliar para salvar no localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  }
};

// Função auxiliar para carregar do localStorage
const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error);
      return null;
    }
  }
  return null;
};

// Função para validar e corrigir um processo
const validarProcesso = (processo: ProcessType): ProcessType => {
  return {
    ...processo,
    id: processo.id || `processo-${Date.now()}`,
    status: processo.status || "aguardando-embarque",
    dataCriacao: processo.dataCriacao || new Date().toISOString(),
    tipo: processo.tipo || "importacao",
    modal: processo.modal || "maritimo",
    referencia: processo.referencia || "",
    adquirente: processo.adquirente || "",
    fornecedor: processo.fornecedor || "",
    referenciaCliente: processo.referenciaCliente || "",
    importador: processo.tipo === "importacao" ? (processo.importador || "") : undefined,
    exportador: processo.tipo === "exportacao" ? (processo.exportador || "") : undefined,
    agenteCargas: processo.agenteCargas || ""
  };
};

export function useProcessData() {
  const [processos, setProcessos] = useState<ProcessType[]>([]);

  // Carrega os dados do localStorage na inicialização
  useEffect(() => {
    const dadosSalvos = loadFromLocalStorage("processos");
    if (dadosSalvos && Array.isArray(dadosSalvos)) {
      // Garante que todos os processos tenham dados válidos
      const processosValidados = dadosSalvos.map(validarProcesso);
      setProcessos(processosValidados);
      // Salva os dados validados de volta no localStorage
      saveToLocalStorage("processos", processosValidados);
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
    const processoValidado = validarProcesso(novoProcesso);
    const processosAtualizados = [...processos, processoValidado];
    setProcessos(processosAtualizados);
    saveToLocalStorage("processos", processosAtualizados);
  };

  // Função para atualizar um processo existente
  const atualizarProcesso = (processoAtualizado: ProcessType) => {
    const processoValidado = validarProcesso(processoAtualizado);
    const processosAtualizados = processos.map(processo => 
      processo.id === processoValidado.id ? processoValidado : processo
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
        const processoAtualizado = { ...processo, status: novoStatus };
        return validarProcesso(processoAtualizado);
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