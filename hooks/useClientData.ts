import { useState, useEffect } from 'react';
import { ClientType, FornecedorType } from '@/types/client';

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

export function useClientData() {
  const [clientes, setClientes] = useState<ClientType[]>([]);

  useEffect(() => {
    const dadosSalvos = loadFromLocalStorage("clientes");
    if (dadosSalvos && Array.isArray(dadosSalvos)) {
      setClientes(dadosSalvos);
    } else {
      setClientes([]);
    }
  }, []);

  const adicionarCliente = (nome: string, cnpj: string) => {
    const novoCliente: ClientType = {
      id: `cliente-${Date.now()}`,
      nome,
      cnpj,
      fornecedores: []
    };
    
    const clientesAtualizados = [...clientes, novoCliente];
    setClientes(clientesAtualizados);
    saveToLocalStorage("clientes", clientesAtualizados);
  };

  const editarCliente = (id: string, nome: string, cnpj: string) => {
    const clientesAtualizados = clientes.map(cliente => 
      cliente.id === id ? { ...cliente, nome, cnpj } : cliente
    );
    setClientes(clientesAtualizados);
    saveToLocalStorage("clientes", clientesAtualizados);
  };

  const removerCliente = (id: string) => {
    const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
    setClientes(clientesAtualizados);
    saveToLocalStorage("clientes", clientesAtualizados);
  };

  const adicionarFornecedor = (clienteId: string, nome: string) => {
    const clientesAtualizados = clientes.map(cliente => {
      if (cliente.id === clienteId) {
        const novoFornecedor: FornecedorType = {
          id: `fornecedor-${Date.now()}`,
          nome,
          clienteId
        };
        return {
          ...cliente,
          fornecedores: [...cliente.fornecedores, novoFornecedor]
        };
      }
      return cliente;
    });
    setClientes(clientesAtualizados);
    saveToLocalStorage("clientes", clientesAtualizados);
  };

  const removerFornecedor = (clienteId: string, fornecedorId: string) => {
    const clientesAtualizados = clientes.map(cliente => {
      if (cliente.id === clienteId) {
        return {
          ...cliente,
          fornecedores: cliente.fornecedores.filter(f => f.id !== fornecedorId)
        };
      }
      return cliente;
    });
    setClientes(clientesAtualizados);
    saveToLocalStorage("clientes", clientesAtualizados);
  };

  return {
    clientes,
    adicionarCliente,
    editarCliente,
    removerCliente,
    adicionarFornecedor,
    removerFornecedor
  };
} 