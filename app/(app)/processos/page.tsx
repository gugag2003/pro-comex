"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useProcessData } from "@/hooks/useProcessData";
import { useClientData } from "@/hooks/useClientData";
import { ProcessType } from "@/types/process";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProcessoTipo = "importacao" | "exportacao";
type ProcessoModal = "maritimo" | "aereo" | "rodoviario";

interface FormDataType extends Omit<ProcessType, 'id' | 'status' | 'dataCriacao'> {
  id?: string;
}

export default function ProcessosPage() {
  const { processos, adicionarProcesso, atualizarProcesso, removerProcesso } = useProcessData();
  const { clientes } = useClientData();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoTab, setTipoTab] = useState<ProcessoTipo>("importacao");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [processoParaExcluir, setProcessoParaExcluir] = useState<ProcessType | null>(null);
  const [adquirenteEImportador, setAdquirenteEImportador] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<FormDataType>({
    referencia: "",
    tipo: "importacao",
    importador: "",
    exportador: "",
    adquirente: "",
    fornecedor: "",
    referenciaCliente: "",
    modal: "maritimo",
    agenteCargas: "",
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      referencia: "",
      tipo: "importacao",
      importador: "",
      exportador: "",
      adquirente: "",
      fornecedor: "",
      referenciaCliente: "",
      modal: "maritimo",
      agenteCargas: "",
      isActive: true
    });
    setModoEdicao(false);
    setClienteSelecionado(null);
    setAdquirenteEImportador(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "tipo" && (value === "importacao" || value === "exportacao")) {
      setFormData((prev) => ({ ...prev, tipo: value }));
    } else if (name === "modal" && (value === "maritimo" || value === "aereo" || value === "rodoviario")) {
      setFormData((prev) => ({ ...prev, modal: value }));
    } else if (name === "importador") {
      const cliente = clientes.find(c => c.id === value);
      setClienteSelecionado(value);
      setFormData((prev) => ({
        ...prev,
        importador: cliente?.nome || "",
        adquirente: adquirenteEImportador ? cliente?.nome || "" : prev.adquirente,
        fornecedor: "" // Resetar fornecedor quando mudar o importador
      }));
    } else if (name === "exportador") {
      const cliente = clientes.find(c => c.id === value);
      setClienteSelecionado(value);
      setFormData((prev) => ({
        ...prev,
        exportador: cliente?.nome || "",
        adquirente: adquirenteEImportador ? cliente?.nome || "" : prev.adquirente,
        fornecedor: "" // Resetar fornecedor quando mudar o exportador
      }));
    } else if (name === "fornecedor") {
      setFormData((prev) => ({ ...prev, fornecedor: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modoEdicao && formData.id) {
      // Atualiza o processo existente
      atualizarProcesso({
        ...formData,
        id: formData.id,
        status: processoParaExcluir?.status || "aguardando-embarque",
        dataCriacao: processoParaExcluir?.dataCriacao || new Date().toISOString(),
        isActive: processoParaExcluir?.status !== "encerrados"
      } as ProcessType);
    } else {
      // Cria um novo processo
      const novoProcesso: ProcessType = {
        ...formData,
        id: `processo-${Date.now()}`,
        status: "aguardando-embarque",
        dataCriacao: new Date().toISOString(),
        isActive: true
      };
      
      adicionarProcesso(novoProcesso);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (processo: ProcessType) => {
    setFormData({
      ...processo,
    });
    // Encontrar o cliente pelo nome do importador
    const cliente = clientes.find(c => c.nome === processo.importador);
    if (cliente) {
      setClienteSelecionado(cliente.id);
    }
    setModoEdicao(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (processo: ProcessType) => {
    setProcessoParaExcluir(processo);
    setConfirmarExclusao(true);
  };

  const confirmarExcluirProcesso = () => {
    if (processoParaExcluir) {
      removerProcesso(processoParaExcluir.id);
      setConfirmarExclusao(false);
      setProcessoParaExcluir(null);
    }
  };

  const handleAdquirenteCheckboxChange = (checked: boolean) => {
    setAdquirenteEImportador(checked);
    if (checked && clienteSelecionado) {
      const cliente = clientes.find(c => c.id === clienteSelecionado);
      setFormData(prev => ({
        ...prev,
        adquirente: cliente?.nome || "",
        fornecedor: "" // Resetar fornecedor quando mudar o adquirente
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        adquirente: "",
        fornecedor: "" // Resetar fornecedor quando mudar o adquirente
      }));
    }
  };

  const filteredProcessos = processos.filter(processo =>
    processo.tipo === tipoTab &&
    (processo.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
     processo.importador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     processo.exportador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     processo.adquirente.toLowerCase().includes(searchTerm.toLowerCase()) ||
     processo.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
     processo.referenciaCliente.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500">Processos</h1>
          <p className="text-muted-foreground">
            Gerencie seus processos de importação e exportação
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-emerald-700 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Processo
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Tabs
              value={tipoTab}
              onValueChange={(value) => setTipoTab(value as ProcessoTipo)}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger key="importacao-tab" value="importacao">Importação</TabsTrigger>
                <TabsTrigger key="exportacao-tab" value="exportacao">Exportação</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full sm:w-64 ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar processos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referência</TableHead>
                <TableHead>
                  {tipoTab === "importacao" ? "Importador" : "Exportador"}
                </TableHead>
                <TableHead>Adquirente</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Referência do Cliente</TableHead>
                <TableHead>Modal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!processos || processos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="mb-2">Nenhum processo cadastrado</p>
                      <Button
                        onClick={() => {
                          resetForm();
                          setIsDialogOpen(true);
                        }}
                        variant="outline"
                        className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Processo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProcessos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    Nenhum processo encontrado para os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcessos.map((processo) => (
                  <TableRow key={processo.id}>
                    <TableCell className="font-medium">
                      {processo.referencia}
                    </TableCell>
                    <TableCell>
                      {tipoTab === "importacao"
                        ? processo.importador
                        : processo.exportador}
                    </TableCell>
                    <TableCell>{processo.adquirente}</TableCell>
                    <TableCell>{processo.fornecedor}</TableCell>
                    <TableCell>{processo.referenciaCliente}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        processo.modal === "maritimo" ? "bg-blue-500/20 text-blue-500" :
                        processo.modal === "aereo" ? "bg-violet-500/20 text-violet-500" :
                        "bg-orange-500/20 text-orange-500"
                      }`}>
                        {processo.modal === "maritimo" ? "Marítimo" :
                         processo.modal === "aereo" ? "Aéreo" : "Rodoviário"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            processo.isActive ? 'bg-emerald-500' : 'bg-red-500'
                          }`} 
                        />
                        <span className="text-xs text-muted-foreground">
                          {processo.isActive ? 'Ativo' : 'Encerrado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            key={`edit-${processo.id}`}
                            onClick={() => handleEdit(processo)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            key={`delete-${processo.id}`}
                            className="text-red-600"
                            onClick={() => handleDelete(processo)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog de Novo/Editar Processo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicao ? "Editar Processo" : "Novo Processo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    onValueChange={(value) => handleSelectChange("tipo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="importacao">Importação</SelectItem>
                      <SelectItem value="exportacao">Exportação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modal">Modal</Label>
                  <Select
                    name="modal"
                    value={formData.modal}
                    onValueChange={(value) => handleSelectChange("modal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maritimo">Marítimo</SelectItem>
                      <SelectItem value="aereo">Aéreo</SelectItem>
                      <SelectItem value="rodoviario">Rodoviário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referência</Label>
                <Input
                  id="referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {formData.tipo === "importacao" ? (
                <div className="space-y-2">
                  <Label htmlFor="importador">Importador</Label>
                  <Select
                    name="importador"
                    value={clienteSelecionado || ""}
                    onValueChange={(value) => handleSelectChange("importador", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o importador" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="exportador">Exportador</Label>
                  <Select
                    name="exportador"
                    value={clienteSelecionado || ""}
                    onValueChange={(value) => {
                      const cliente = clientes.find(c => c.id === value);
                      setClienteSelecionado(value);
                      setFormData(prev => ({
                        ...prev,
                        exportador: cliente?.nome || "",
                        adquirente: adquirenteEImportador ? cliente?.nome || "" : prev.adquirente
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o exportador" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="adquirente">Adquirente</Label>
                <Input
                  id="adquirente"
                  name="adquirente"
                  value={formData.adquirente}
                  onChange={handleInputChange}
                  disabled={adquirenteEImportador}
                  required
                />
                {formData.tipo === "importacao" && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="adquirenteCheckbox"
                      checked={adquirenteEImportador}
                      onCheckedChange={handleAdquirenteCheckboxChange}
                    />
                    <label
                      htmlFor="adquirenteCheckbox"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Adquirente é o Importador
                    </label>
                  </div>
                )}
              </div>

              {formData.tipo === "exportacao" && (
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="adquirenteCheckbox"
                    checked={adquirenteEImportador}
                    onCheckedChange={handleAdquirenteCheckboxChange}
                  />
                  <label
                    htmlFor="adquirenteCheckbox"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Adquirente é o Exportador
                  </label>
                </div>
              )}

              {formData.tipo === "importacao" && clienteSelecionado && (
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Select
                    name="fornecedor"
                    value={formData.fornecedor}
                    onValueChange={(value) => handleSelectChange("fornecedor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes
                        .find(c => c.id === clienteSelecionado)
                        ?.fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.nome}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.tipo === "exportacao" && (
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Select
                    name="fornecedor"
                    value={formData.fornecedor}
                    onValueChange={(value) => handleSelectChange("fornecedor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes
                        .find(c => c.id === clienteSelecionado)
                        ?.fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.nome}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="referenciaCliente">Referência do Cliente</Label>
                <Input
                  id="referenciaCliente"
                  name="referenciaCliente"
                  value={formData.referenciaCliente}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                <Input
                  id="agenteCargas"
                  name="agenteCargas"
                  value={formData.agenteCargas}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {modoEdicao ? "Salvar Alterações" : "Criar Processo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo {processoParaExcluir?.referencia}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProcessoParaExcluir(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluirProcesso}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}