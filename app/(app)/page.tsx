"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DragUpdate } from "@hello-pangea/dnd";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [tipoTab, setTipoTab] = useState<"todos" | "importacao" | "exportacao">("todos");
  const [mudancaStatus, setMudancaStatus] = useState<{
    processoId: string;
    origem: string;
    destino: string;
    referencia: string;
    destinationIndex: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'esquerda' | 'direita' | null>(null);

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
  
  // Filtrar processos baseado no termo de busca e tipo
  const processosFiltrados = processos.filter(processo => {
    const matchSearch = searchTerm === "" || // Se não houver termo de busca, retorna todos
      processo.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.importador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.exportador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.adquirente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.referenciaCliente.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = tipoTab === "todos" || processo.tipo === tipoTab;

    return matchSearch && matchTipo;
  });
  
  // Ordenar processos por ordem antes de distribuir nas colunas
  const processosOrdenados = [...processosFiltrados].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  
  processosOrdenados.forEach(processo => {
    const status = processo.status || "aguardando-embarque";
    if (colunasComItems[status]) {
      colunasComItems[status].items.push(processo);
    }
  });

  // Função para verificar a posição do mouse e iniciar o scroll
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.getElementById('kanban-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const zonaScroll = 100;
    
    // Verificar se o mouse está próximo das bordas
    if (e.clientX < rect.left + zonaScroll) {
      setScrollDirection('esquerda');
    } else if (e.clientX > rect.right - zonaScroll) {
      setScrollDirection('direita');
    } else {
      setScrollDirection(null);
    }
  };

  // Efeito para gerenciar o scroll automático
  useEffect(() => {
    if (!isDragging || !scrollDirection) {
      pararAutoScroll();
      return;
    }

    const container = document.getElementById('kanban-container');
    if (!container) return;

    const scrollAmount = 10; // Reduzido para 10 para um scroll mais preciso
    const intervalo = setInterval(() => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      if (scrollDirection === 'esquerda' && scrollLeft > 0) {
        container.scrollLeft = Math.max(0, scrollLeft - scrollAmount);
      } else if (scrollDirection === 'direita' && scrollLeft < scrollWidth - clientWidth) {
        container.scrollLeft = Math.min(scrollWidth - clientWidth, scrollLeft + scrollAmount);
      } else {
        setScrollDirection(null);
      }
    }, 16);

    setAutoScrollInterval(intervalo);

    return () => {
      clearInterval(intervalo);
      setAutoScrollInterval(null);
    };
  }, [isDragging, scrollDirection]);

  // Adicionar e remover o listener de mousemove
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      setScrollDirection(null);
    };
  }, [isDragging]);

  const onDragStart = () => {
    setIsDragging(true);
    setScrollDirection(null);
  };

  const onDragEnd = (result: DropResult) => {
    // Primeiro, limpar os estados de scroll
    setIsDragging(false);
    setScrollDirection(null);
    pararAutoScroll();

    // Se não houver destino, retornar
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    
    // Se o destino for o mesmo da origem, apenas reordenar
    if (source.droppableId === destination.droppableId) {
      reordenarProcessos(draggableId, destination.index, source.droppableId);
      return;
    }

    // Encontrar o processo que está sendo movido
    const processo = processos.find(p => p.id === draggableId);
    if (!processo) {
      return;
    }

    // Abrir o diálogo de confirmação antes de fazer a atualização
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
      // Atualizar o status e a ordem do processo apenas quando confirmar
      atualizarStatusEOrdem(
        mudancaStatus.processoId,
        mudancaStatus.destino,
        mudancaStatus.destinationIndex
      );
      setConfirmarMudancaStatus(false);
      setMudancaStatus(null);
    }
  };

  // Adicionar handler para cancelar a mudança
  const cancelarMudanca = () => {
    setConfirmarMudancaStatus(false);
    setMudancaStatus(null);
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

  // Função para parar o auto-scroll
  const pararAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
  };

  // Limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      pararAutoScroll();
      setIsDragging(false);
      setScrollDirection(null);
    };
  }, []);

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
    <div className="h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-500">Fluxo</h1>
            <p className="text-muted-foreground">
              Gerencie o fluxo dos seus processos
            </p>
          </div>
        </div>

        <Card className="mb-1">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Tabs
                value={tipoTab}
                onValueChange={(value) => setTipoTab(value as "todos" | "importacao" | "exportacao")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="importacao">Importação</TabsTrigger>
                  <TabsTrigger value="exportacao">Exportação</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar processos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => scrollHorizontal('esquerda')}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => scrollHorizontal('direita')}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div
            id="kanban-container"
            className="flex gap-4 overflow-x-auto h-full pb-4"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#4b5563 #1f2937',
              scrollBehavior: 'smooth'
            }}
          >
            {Object.values(colunasComItems).map((coluna) => (
              <div key={coluna.id} className="flex-shrink-0 w-80 mx-2 first:ml-0 last:mr-0">
                <Card className="h-full bg-muted/50 flex flex-col">
                  <CardHeader className="py-3 px-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {coluna.title}
                      </CardTitle>
                      <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded-full">
                        {coluna.items.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-y-auto">
                    <Droppable droppableId={coluna.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-full p-2"
                        >
                          {coluna.items.map((processo, index) => (
                            <Draggable
                              key={processo.id}
                              draggableId={processo.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2"
                                >
                                  <Card
                                    className="cursor-pointer hover:shadow-md transition-shadow bg-card"
                                    onClick={() => abrirDialogoProcesso(processo)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">
                                              {processo.referencia}
                                            </p>
                                            <div 
                                              className={`w-2 h-2 rounded-full ${
                                                processo.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                              }`} 
                                              title={processo.isActive ? 'Ativo' : 'Encerrado'}
                                            />
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {processo.tipo === "importacao"
                                              ? processo.importador
                                              : processo.exportador}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <p>
                                          {processo.tipo === "importacao"
                                            ? processo.fornecedor
                                            : processo.adquirente}
                                        </p>
                                        <p>{processo.referenciaCliente}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            processo.modal === "maritimo" ? "bg-blue-500/20 text-blue-500" :
                                            processo.modal === "aereo" ? "bg-violet-500/20 text-violet-500" :
                                            "bg-orange-500/20 text-orange-500"
                                          }`}>
                                            {processo.modal === "maritimo" ? "Marítimo" :
                                             processo.modal === "aereo" ? "Aéreo" : "Rodoviário"}
                                          </span>
                                          {processo.agenteCargas && (
                                            <span className="text-emerald-500">
                                              Agente: {processo.agenteCargas}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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
            <AlertDialogCancel onClick={cancelarMudanca}>
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