"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Plus, History, Upload, Search, X, Camera, ImageIcon, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Medicion {
  id: string;
  aula: string;
  pingImage: string;
  speedImage: string;
  notas: string | null;
  createdAt: string;
}

interface AccessPoint {
  id: string;
  ap: string;
  marca: string;
  modelo: string;
  mac: string;
  codPatrimonial: string;
  pabellon: string;
  piso: string;
  ubicacion: string;
  ip: string;
  nombreSenal: string;
  densidadSenal: string;
  createdAt: string;
  mediciones: Medicion[];
}

const initialForm = {
  ap: "",
  marca: "",
  modelo: "",
  mac: "",
  codPatrimonial: "",
  pabellon: "",
  piso: "",
  ubicacion: "",
  ip: "",
  nombreSenal: "",
  densidadSenal: "",
};

export default function AccessPointsPage() {
  const router = useRouter();
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openMedicion, setOpenMedicion] = useState(false);
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedAP, setSelectedAP] = useState<AccessPoint | null>(null);
  const [aula, setAula] = useState("");
  const [pingFile, setPingFile] = useState<File | null>(null);
  const [pingPreview, setPingPreview] = useState<string | null>(null);
  const [speedFile, setSpeedFile] = useState<File | null>(null);
  const [speedPreview, setSpeedPreview] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const pingCameraRef = useRef<HTMLInputElement>(null);
  const pingFileRef = useRef<HTMLInputElement>(null);
  const speedCameraRef = useRef<HTMLInputElement>(null);
  const speedFileRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPabellon, setFilterPabellon] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [editId, setEditId] = useState("");

  const fetchAPs = useCallback(async () => {
    const res = await fetch("/api/access-points");
    const data = await res.json();
    setAccessPoints(data);
  }, []);

  useEffect(() => {
    fetchAPs();
  }, [fetchAPs]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/access-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm(initialForm);
      setOpenCreate(false);
      await fetchAPs();
      toast.success("Access Point registrado correctamente");
    } catch {
      toast.error("Error al registrar el Access Point");
    } finally {
      setLoading(false);
    }
  };

  const formatMacInput = (value: string) => {
    // Remove non-hex chars, uppercase, insert : every 2 chars, max 17 chars (XX:XX:XX:XX:XX:XX)
    const clean = value.replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(0, 12);
    return clean.match(/.{1,2}/g)?.join(":") || clean;
  };

  const openEditDialog = (ap: AccessPoint) => {
    setEditId(ap.id);
    setEditForm({
      ap: ap.ap,
      marca: ap.marca,
      modelo: ap.modelo,
      mac: ap.mac,
      codPatrimonial: ap.codPatrimonial,
      pabellon: ap.pabellon,
      piso: ap.piso,
      ubicacion: ap.ubicacion,
      ip: ap.ip,
      nombreSenal: ap.nombreSenal,
      densidadSenal: ap.densidadSenal,
    });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/access-points/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setOpenEdit(false);
      await fetchAPs();
      toast.success("Access Point actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el Access Point");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const resetMedicionForm = () => {
    setAula("");
    setPingFile(null);
    setPingPreview(null);
    setSpeedFile(null);
    setSpeedPreview(null);
    setNotas("");
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleAddMedicion = async () => {
    if (!selectedAP || !pingFile || !speedFile || !aula) return;
    setLoading(true);
    try {
      const [pingUrl, speedUrl] = await Promise.all([
        uploadFile(pingFile),
        uploadFile(speedFile),
      ]);
      const res = await fetch(`/api/access-points/${selectedAP.id}/mediciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aula,
          pingImage: pingUrl,
          speedImage: speedUrl,
          notas: notas || null,
        }),
      });
      if (!res.ok) throw new Error();
      resetMedicionForm();
      setOpenMedicion(false);
      await fetchAPs();
      toast.success("Medicion registrada correctamente", {
        description: `AP: ${selectedAP.ap} | Aula: ${aula}`,
      });
    } catch {
      toast.error("Error al registrar la medicion");
    } finally {
      setLoading(false);
    }
  };

  const pabellones = [
    ...new Set(accessPoints.map((ap) => ap.pabellon)),
  ].filter(Boolean);

  const filtered = accessPoints.filter((ap) => {
    const matchSearch =
      searchTerm === "" ||
      ap.ap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.nombreSenal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPabellon =
      filterPabellon === "all" || ap.pabellon === filterPabellon;
    return matchSearch && matchPabellon;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedAPs = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registro de Access Points</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los APs y sus mediciones historicas
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar AP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Access Point</DialogTitle>
              <DialogDescription>
                Complete los datos del Access Point a registrar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ap">AP</Label>
                <Input id="ap" value={form.ap} onChange={(e) => setForm({ ...form, ap: e.target.value })} placeholder="Ej: AP-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ej: Cisco" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input id="modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Ej: AIR-CAP3702I" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mac">MAC</Label>
                <Input id="mac" value={form.mac} onChange={(e) => setForm({ ...form, mac: formatMacInput(e.target.value) })} placeholder="Ej: AA:BB:CC:DD:EE:FF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codPatrimonial">Cod. Patrimonial</Label>
                <Input id="codPatrimonial" value={form.codPatrimonial} onChange={(e) => setForm({ ...form, codPatrimonial: e.target.value })} placeholder="Ej: PAT-00123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pabellon">Pabellon</Label>
                <Select value={form.pabellon} onValueChange={(v) => setForm({ ...form, pabellon: v })}>
                  <SelectTrigger id="pabellon" className="cursor-pointer">
                    <SelectValue placeholder="Seleccionar pabellon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pabellon A">Pabellon A</SelectItem>
                    <SelectItem value="Pabellon B">Pabellon B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="piso">Piso</Label>
                <Select value={form.piso} onValueChange={(v) => setForm({ ...form, piso: v })}>
                  <SelectTrigger id="piso" className="cursor-pointer">
                    <SelectValue placeholder="Seleccionar piso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piso 1">Piso 1</SelectItem>
                    <SelectItem value="Piso 2">Piso 2</SelectItem>
                    <SelectItem value="Piso 3">Piso 3</SelectItem>
                    <SelectItem value="Piso 4">Piso 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="ubicacion">Ubicacion</Label>
                <Input id="ubicacion" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej: Oficina 201, Sala de reuniones" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">Direccion IP</Label>
                <Input id="ip" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="Ej: 192.168.1.10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreSenal">Nombre de Senal</Label>
                <Input id="nombreSenal" value={form.nombreSenal} onChange={(e) => setForm({ ...form, nombreSenal: e.target.value })} placeholder="Ej: WIFI-CAMPUS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="densidadSenal">Densidad de Senal</Label>
                <Input id="densidadSenal" value={form.densidadSenal} onChange={(e) => setForm({ ...form, densidadSenal: e.target.value })} placeholder="Ej: -45 dBm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Guardando..." : "Guardar AP"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total APs Registrados</CardDescription>
            <CardTitle className="text-3xl">{accessPoints.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Mediciones</CardDescription>
            <CardTitle className="text-3xl">
              {accessPoints.reduce((acc, ap) => acc + ap.mediciones.length, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pabellones</CardDescription>
            <CardTitle className="text-3xl">{pabellones.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por AP, marca, senal, MAC, ubicacion..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={filterPabellon} onValueChange={(v) => { setFilterPabellon(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por pabellon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pabellones</SelectItem>
                {pabellones.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Access Points</CardTitle>
          <CardDescription>Lista de todos los APs registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AP</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>MAC</TableHead>
                  <TableHead>Cod. Patrimonial</TableHead>
                  <TableHead>Pabellon</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Ubicacion</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Senal</TableHead>
                  <TableHead>Densidad</TableHead>
                  <TableHead>Mediciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      No se encontraron Access Points
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAPs.map((ap) => (
                    <TableRow key={ap.id}>
                      <TableCell className="font-medium">{ap.ap}</TableCell>
                      <TableCell>{ap.marca}</TableCell>
                      <TableCell>{ap.modelo}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ap.mac}</code>
                      </TableCell>
                      <TableCell>{ap.codPatrimonial}</TableCell>
                      <TableCell><Badge variant="secondary">{ap.pabellon}</Badge></TableCell>
                      <TableCell>{ap.piso}</TableCell>
                      <TableCell>{ap.ubicacion}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ap.ip}</code>
                      </TableCell>
                      <TableCell>{ap.nombreSenal}</TableCell>
                      <TableCell>{ap.densidadSenal}</TableCell>
                      <TableCell><Badge variant="outline">{ap.mediciones.length}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openEditDialog(ap)} title="Editar AP">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => { setSelectedAP(ap); setOpenMedicion(true); }} title="Agregar medicion">
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => router.push(`/access-points/${ap.id}/historial`)} title="Ver historial">
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filas por pagina:</span>
              <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2">
                {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filtered.length)} de {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? "default" : "outline"}
                      size="sm"
                      className="cursor-pointer w-8 h-8 p-0"
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Add Medicion */}
      <Dialog open={openMedicion} onOpenChange={(open) => { if (!open) resetMedicionForm(); setOpenMedicion(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Medicion</DialogTitle>
            <DialogDescription>
              AP: {selectedAP?.ap} - {selectedAP?.nombreSenal} ({selectedAP?.pabellon})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="aula">Aula (punto de medicion)</Label>
              <Input id="aula" value={aula} onChange={(e) => setAula(e.target.value)} placeholder="Ej: Aula 201, Lab. Computo 1" />
            </div>

            {/* Ping capture */}
            <div className="space-y-2">
              <Label>Captura de Ping 8.8.8.8</Label>
              <input ref={pingCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setPingFile, setPingPreview)} />
              <input ref={pingFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setPingFile, setPingPreview)} />
              {pingPreview ? (
                <div className="relative group">
                  <img src={pingPreview} alt="Ping preview" className="w-full h-40 object-cover rounded-lg border" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => pingCameraRef.current?.click()}>
                      <Camera className="mr-1 h-4 w-4" /> Retomar
                    </Button>
                    <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => pingFileRef.current?.click()}>
                      <ImageIcon className="mr-1 h-4 w-4" /> Cambiar
                    </Button>
                    <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setPingFile(null); setPingPreview(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => pingCameraRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => pingFileRef.current?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Galeria / Archivo
                  </Button>
                </div>
              )}
            </div>

            {/* Speed capture */}
            <div className="space-y-2">
              <Label>Captura de Velocidad de Internet</Label>
              <input ref={speedCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setSpeedFile, setSpeedPreview)} />
              <input ref={speedFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setSpeedFile, setSpeedPreview)} />
              {speedPreview ? (
                <div className="relative group">
                  <img src={speedPreview} alt="Speed preview" className="w-full h-40 object-cover rounded-lg border" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => speedCameraRef.current?.click()}>
                      <Camera className="mr-1 h-4 w-4" /> Retomar
                    </Button>
                    <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => speedFileRef.current?.click()}>
                      <ImageIcon className="mr-1 h-4 w-4" /> Cambiar
                    </Button>
                    <Button size="sm" variant="destructive" className="cursor-pointer" onClick={() => { setSpeedFile(null); setSpeedPreview(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => speedCameraRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 cursor-pointer" onClick={() => speedFileRef.current?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Galeria / Archivo
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones adicionales..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenMedicion(false)}>Cancelar</Button>
            <Button onClick={handleAddMedicion} disabled={loading || !aula || !pingFile || !speedFile}>
              {loading ? "Subiendo..." : "Guardar Medicion"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit AP */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Access Point</DialogTitle>
            <DialogDescription>
              Modifique los datos del Access Point.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>AP</Label>
              <Input value={editForm.ap} onChange={(e) => setEditForm({ ...editForm, ap: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input value={editForm.marca} onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input value={editForm.modelo} onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>MAC</Label>
              <Input value={editForm.mac} onChange={(e) => setEditForm({ ...editForm, mac: formatMacInput(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Cod. Patrimonial</Label>
              <Input value={editForm.codPatrimonial} onChange={(e) => setEditForm({ ...editForm, codPatrimonial: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Pabellon</Label>
              <Select value={editForm.pabellon} onValueChange={(v) => setEditForm({ ...editForm, pabellon: v })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Seleccionar pabellon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pabellon A">Pabellon A</SelectItem>
                  <SelectItem value="Pabellon B">Pabellon B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Piso</Label>
              <Select value={editForm.piso} onValueChange={(v) => setEditForm({ ...editForm, piso: v })}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Seleccionar piso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Piso 1">Piso 1</SelectItem>
                  <SelectItem value="Piso 2">Piso 2</SelectItem>
                  <SelectItem value="Piso 3">Piso 3</SelectItem>
                  <SelectItem value="Piso 4">Piso 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Ubicacion</Label>
              <Input value={editForm.ubicacion} onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Direccion IP</Label>
              <Input value={editForm.ip} onChange={(e) => setEditForm({ ...editForm, ip: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nombre de Senal</Label>
              <Input value={editForm.nombreSenal} onChange={(e) => setEditForm({ ...editForm, nombreSenal: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Densidad de Senal</Label>
              <Input value={editForm.densidadSenal} onChange={(e) => setEditForm({ ...editForm, densidadSenal: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Guardando..." : "Actualizar AP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Image Preview */}
      <Dialog open={openImagePreview} onOpenChange={setOpenImagePreview}>
        <DialogContent className="max-w-4xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button size="sm" variant="ghost" className="absolute top-2 right-2 z-10" onClick={() => setOpenImagePreview(false)}>
              <X className="h-4 w-4" />
            </Button>
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
