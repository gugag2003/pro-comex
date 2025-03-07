"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessData } from "@/hooks/useProcessData";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProcessType } from "@/types/process";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ColunaType {
  id: string;
  title: string;
  items: ProcessType[];
}

interface ColunasType {
  [key: string]: ColunaType;
}

export default function FluxoPage() {
  const { processos, atualizarStatusProcesso, atualizarProcesso, reordenarProcessos, atualizarStatusEOrdem } = useProcessData();
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agenteCargas, setAgenteCargas] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmarMudancaStatus, setConfirmarMudancaStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mudancaStatus, setMudancaStatus] = useState<{
    processoId: string;
    origem: string;
    destino: string;
    referencia: string;
    destinationIndex: number;
  } | null>(null);

  useEffect(() => {
    // Aguardar os dados serem carregados
    if (processos.length > 0) {
      setLoading(false);
    }
  }, [processos]);

  const colunas: ColunasType = {
    "aguardando-embarque": {
      id: "aguardando-embarque",
      title: "Aguardando Embarque",
      items: [],
    },
    "em-transito": {
      id: "em-transito",
      title: "Em Trânsito",
      items: [],
    },
    "aguardando-registro": {
      id: "aguardando-registro",
      title: "Aguardando Registro",
      items: [],
    },
    "registrar-di": {
      id: "registrar-di",
      title: "Registrar DI",
      items: [],
    },
    "aguardando-canal": {
      id: "aguardando-canal",
      title: "Aguardando Canal",
      items: [],
    },
    "aguardando-fechamento": {
      id: "aguardando-fechamento",
      title: "Aguardando Fechamento",
      items: [],
    },
    encerrados: {
      id: "encerrados",
      title: "Encerrados",
      items: [],
    },
  };

  // Distribuir os processos nas colunas conforme o status
  const colunasComItems = { ...colunas };
  
  // Filtrar processos baseado no termo de busca
  const processosFiltrados = processos.filter(processo =>
    searchTerm === "" || // Se não houver termo de busca, retorna todos
    processo.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.importador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.exportador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.adquirente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.referenciaCliente.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Ordenar processos por ordem antes de distribuir nas colunas
  const processosOrdenados = [...processosFiltrados].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  
  processosOrdenados.forEach(processo => {
    const status = processo.status || "aguardando-embarque";
    if (colunasComItems[status]) {
      colunasComItems[status].items.push(processo);
    }
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Moveu dentro da mesma coluna, atualizar a ordem
      reordenarProcessos(draggableId, destination.index, source.droppableId);
      return;
    }

    // Encontra o processo que está sendo movido
    const processo = processos.find(p => p.id === draggableId);
    if (!processo) return;
    
    // Abre o diálogo de confirmação
    setMudancaStatus({
      processoId: draggableId,
      origem: source.droppableId,
      destino: destination.droppableId,
      referencia: processo.referencia,
      destinationIndex: destination.index
    });
    setConfirmarMudancaStatus(true);
  };

  const confirmarMudanca = () => {
    if (mudancaStatus) {
      atualizarStatusEOrdem(
        mudancaStatus.processoId, 
        mudancaStatus.destino, 
        mudancaStatus.destinationIndex
      );
      setConfirmarMudancaStatus(false);
      setMudancaStatus(null);
    }
  };

  const abrirDialogoProcesso = (processo: ProcessType) => {
    setProcessoSelecionado(processo);
    setAgenteCargas(processo.agenteCargas || "");
    setDialogOpen(true);
  };

  const salvarAgenteCargas = () => {
    if (processoSelecionado) {
      const processoAtualizado = {
        ...processoSelecionado,
        agenteCargas
      };
      atualizarProcesso(processoAtualizado);
      setDialogOpen(false);
    }
  };

  // Controles para scroll horizontal
  const scrollHorizontal = (direcao: 'esquerda' | 'direita') => {
    const container = document.getElementById('kanban-container');
    const scrollAmount = 300; // pixels para scrollar
    
    if (container) {
      if (direcao === 'esquerda') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Carregando processos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500">Fluxo de Processos</h1>
          <p className="text-muted-foreground">
            Gerencie o status dos processos arrastando os cartões entre as colunas
          </p>
        </div>
        <div className="flex items-center gap-4 sm:ml-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar processos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollHorizontal('esquerda')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollHorizontal('direita')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div 
        id="kanban-container"
        className="flex overflow-x-auto pb-4 h-[calc(100vh-150px)]"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#4b5563 #1f2937'
        }}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.values(colunasComItems).map((coluna) => (
            <div key={coluna.id} className="flex-shrink-0 w-80 mx-2 first:ml-0 last:mr-0">
              <Card className="h-full bg-muted/50 flex flex-col">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">
                    {coluna.title} 
                    <span className="ml-2 text-xs bg-muted-foreground/20 px-2 py-1 rounded-full">
                      {coluna.items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2 flex-grow overflow-y-auto">
                  <Droppable droppableId={coluna.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-full"
                      >
                        {coluna.items.map((item, index) => (
                          item && item.id ? (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2 bg-card hover:bg-accent transition-colors p-3 cursor-pointer"
                                  onClick={() => abrirDialogoProcesso(item)}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {item.referencia}
                                    </span>
                                    <div 
                                      className={`w-2 h-2 rounded-full ${
                                        item.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                      }`} 
                                      title={item.isActive ? 'Ativo' : 'Encerrado'}
                                    />
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {item.tipo === "importacao" ? 
                                      `Importador: ${item.importador || 'N/A'}` : 
                                      `Exportador: ${item.exportador || 'N/A'}`}
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      {item.referenciaCliente}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                      item.modal === "maritimo" ? "bg-blue-500/20 text-blue-500" :
                                      item.modal === "aereo" ? "bg-violet-500/20 text-violet-500" :
                                      "bg-orange-500/20 text-orange-500"
                                    }`}>
                                      {item.modal === "maritimo" ? "Marítimo" :
                                       item.modal === "aereo" ? "Aéreo" : "Rodoviário"}
                                    </span>
                                  </div>
                                  {item.agenteCargas && (
                                    <div className="mt-2 text-xs text-emerald-500">
                                      Agente: {item.agenteCargas}
                                    </div>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ) : null
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </DragDropContext>
      </div>

      {/* Diálogo de detalhes do processo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Processo: {processoSelecionado?.referencia}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </DialogHeader>
          
          {processoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium mb-1">Tipo</p>
                  <p className="text-sm text-muted-foreground">
                    {processoSelecionado.tipo === "importacao" ? "Importação" : "Exportação"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Modal</p>
                  <p className="text-sm text-muted-foreground">
                    {processoSelecionado.modal === "maritimo" ? "Marítimo" :
                     processoSelecionado.modal === "aereo" ? "Aéreo" : "Rodoviário"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    {processoSelecionado.tipo === "importacao" ? "Importador" : "Exportador"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {processoSelecionado.tipo === "importacao" ? 
                      processoSelecionado.importador : processoSelecionado.exportador}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Adquirente</p>
                  <p className="text-sm text-muted-foreground">{processoSelecionado.adquirente}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Fornecedor</p>
                  <p className="text-sm text-muted-foreground">{processoSelecionado.fornecedor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Referência do Cliente</p>
                  <p className="text-sm text-muted-foreground">{processoSelecionado.referenciaCliente}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-2">Informações Adicionais</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                    <Input
                      id="agenteCargas"
                      value={agenteCargas}
                      onChange={(e) => setAgenteCargas(e.target.value)}
                      placeholder="Nome do agente de cargas"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={salvarAgenteCargas}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Mudança de Status */}
      <AlertDialog open={confirmarMudancaStatus} onOpenChange={setConfirmarMudancaStatus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mover o processo {mudancaStatus?.referencia} da lista &quot;{
                colunas[mudancaStatus?.origem || ""]?.title
              }&quot; para &quot;{
                colunas[mudancaStatus?.destino || ""]?.title
              }&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMudancaStatus(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmarMudanca}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}