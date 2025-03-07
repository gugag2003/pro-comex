export interface ClientType {
    id: string;
    nome: string;
    cnpj: string;
    fornecedores: FornecedorType[];
}

export interface FornecedorType {
    id: string;
    nome: string;
    clienteId: string;
} 