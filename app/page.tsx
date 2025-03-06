"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessData } from "@/hooks/useProcessData";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FluxoPage() {
  const { processos, atualizarStatusProcesso, atualizarProcesso } = useProcessData();
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agenteCargas, setAgenteCargas] = useState("");

  const colunas = {
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
  
  processos.forEach(processo => {
    const status = processo.status || "aguardando-embarque";
    if (colunasComItems[status]) {
      colunasComItems[status].items.push(processo);
    }
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Moveu dentro da mesma coluna, não precisa atualizar o status
      return;
    }
    
    // Atualiza o status do processo
    atualizarStatusProcesso(draggableId, destination.droppableId);
  };

  const abrirDialogoProcesso = (processo) => {
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
  const scrollHorizontal = (direcao) => {
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

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500">Fluxo de Processos</h1>
          <p className="text-muted-foreground">
            Gerencie o status dos processos arrastando os cartões entre as colunas
          </p>
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
                                <div className="text-sm font-medium mb-1">
                                  {item.referencia}
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
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={salvarAgenteCargas} 
                  className="bg-emerald-700 hover:bg-emerald-600"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}