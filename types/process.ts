export type ProcessType = {
    id: string;
    referencia: string;
    tipo: "importacao" | "exportacao";
    importador?: string;
    exportador?: string;
    adquirente: string;
    fornecedor: string;
    referenciaCliente: string;
    modal: "maritimo" | "aereo" | "rodoviario";
    status: "aguardando-embarque" | "em-transito" | "aguardando-registro" | "registrar-di" | "aguardando-fechamento" | "encerrados";
    dataCriacao: string;
  };