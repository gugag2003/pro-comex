export interface ProcessType {
    id: string;
    referencia: string;
    tipo: "importacao" | "exportacao";
    importador?: string;
    exportador?: string;
    adquirente: string;
    fornecedor: string;
    referenciaCliente: string;
    modal: "maritimo" | "aereo" | "rodoviario";
    status: string;
    dataCriacao: string;
    agenteCargas?: string;
    isActive: boolean;
    ordem?: number;
}