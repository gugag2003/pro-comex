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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, Users } from "lucide-react";
import { useClientData } from "@/hooks/useClientData";
import { Label } from "@/components/ui/label";
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

export default function ClientesPage() {
  const { 
    clientes, 
    adicionarCliente, 
    editarCliente, 
    removerCliente,
    adicionarFornecedor,
    removerFornecedor 
  } = useClientData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [isFornecedorDialogOpen, setIsFornecedorDialogOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [confirmarExclusaoFornecedor, setConfirmarExclusaoFornecedor] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: ""
  });
  
  const [novoFornecedor, setNovoFornecedor] = useState("");

  const resetForm = () => {
    setFormData({ nome: "", cnpj: "" });
    setModoEdicao(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCliente = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modoEdicao && clienteSelecionado) {
      editarCliente(clienteSelecionado, formData.nome, formData.cnpj);
    } else {
      adicionarCliente(formData.nome, formData.cnpj);
    }
    
    setIsClienteDialogOpen(false);
    resetForm();
  };

  const handleSubmitFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clienteSelecionado && novoFornecedor) {
      adicionarFornecedor(clienteSelecionado, novoFornecedor);
      setNovoFornecedor("");
      setIsFornecedorDialogOpen(false);
    }
  };

  const handleEdit = (id: string, nome: string, cnpj: string) => {
    setFormData({ nome, cnpj });
    setClienteSelecionado(id);
    setModoEdicao(true);
    setIsClienteDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setClienteSelecionado(id);
    setConfirmarExclusao(true);
  };

  const confirmarExcluirCliente = () => {
    if (clienteSelecionado) {
      removerCliente(clienteSelecionado);
      setConfirmarExclusao(false);
      setClienteSelecionado(null);
    }
  };

  const handleDeleteFornecedor = (fornecedorId: string) => {
    setFornecedorParaExcluir(fornecedorId);
    setConfirmarExclusaoFornecedor(true);
  };

  const confirmarExcluirFornecedor = () => {
    if (clienteSelecionado && fornecedorParaExcluir) {
      removerFornecedor(clienteSelecionado, fornecedorParaExcluir);
      setConfirmarExclusaoFornecedor(false);
      setFornecedorParaExcluir(null);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie clientes e seus fornecedores
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsClienteDialogOpen(true);
          }}
          className="bg-emerald-700 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredClientes.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="mb-2">Nenhum cliente cadastrado</p>
                      <Button
                        onClick={() => {
                          resetForm();
                          setIsClienteDialogOpen(true);
                        }}
                        variant="outline"
                        className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Primeiro Cliente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.cnpj}</TableCell>
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
                            onClick={() => {
                              setClienteSelecionado(cliente.id);
                              setIsFornecedorDialogOpen(true);
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Fornecedores ({cliente.fornecedores.length})
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(cliente.id, cliente.nome, cliente.cnpj)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(cliente.id)}
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

      {/* Dialog de Novo/Editar Cliente */}
      <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicao ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCliente}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cliente</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {modoEdicao ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Fornecedores */}
      <Dialog open={isFornecedorDialogOpen} onOpenChange={setIsFornecedorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Fornecedores - {clientes.find(c => c.id === clienteSelecionado)?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <form onSubmit={handleSubmitFornecedor} className="flex gap-2">
              <Input
                placeholder="Nome do fornecedor"
                value={novoFornecedor}
                onChange={(e) => setNovoFornecedor(e.target.value)}
                required
              />
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </form>
            <div className="space-y-2">
              {clienteSelecionado && clientes.find(c => c.id === clienteSelecionado)?.fornecedores.map((fornecedor) => (
                <div key={fornecedor.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span>{fornecedor.nome}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteFornecedor(fornecedor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClienteSelecionado(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluirCliente}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Exclusão de Fornecedor */}
      <AlertDialog open={confirmarExclusaoFornecedor} onOpenChange={setConfirmarExclusaoFornecedor}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este fornecedor?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFornecedorParaExcluir(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluirFornecedor}
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