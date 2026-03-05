"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, History, Upload, Search, X } from "lucide-react";
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
  ubicacion: string;
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
  ubicacion: "",
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
  const [speedFile, setSpeedFile] = useState<File | null>(null);
  const [notas, setNotas] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPabellon, setFilterPabellon] = useState("all");

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
      setAula("");
      setPingFile(null);
      setSpeedFile(null);
      setNotas("");
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
                <Input id="mac" value={form.mac} onChange={(e) => setForm({ ...form, mac: e.target.value })} placeholder="Ej: AA:BB:CC:DD:EE:FF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codPatrimonial">Cod. Patrimonial</Label>
                <Input id="codPatrimonial" value={form.codPatrimonial} onChange={(e) => setForm({ ...form, codPatrimonial: e.target.value })} placeholder="Ej: PAT-00123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pabellon">Pabellon</Label>
                <Input id="pabellon" value={form.pabellon} onChange={(e) => setForm({ ...form, pabellon: e.target.value })} placeholder="Ej: Pabellon A" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="ubicacion">Ubicacion</Label>
                <Input id="ubicacion" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej: Segundo piso, oficina 201" />
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPabellon} onValueChange={setFilterPabellon}>
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
                  <TableHead>Ubicacion</TableHead>
                  <TableHead>Senal</TableHead>
                  <TableHead>Densidad</TableHead>
                  <TableHead>Mediciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No se encontraron Access Points
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ap) => (
                    <TableRow key={ap.id}>
                      <TableCell className="font-medium">{ap.ap}</TableCell>
                      <TableCell>{ap.marca}</TableCell>
                      <TableCell>{ap.modelo}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ap.mac}</code>
                      </TableCell>
                      <TableCell>{ap.codPatrimonial}</TableCell>
                      <TableCell><Badge variant="secondary">{ap.pabellon}</Badge></TableCell>
                      <TableCell>{ap.ubicacion}</TableCell>
                      <TableCell>{ap.nombreSenal}</TableCell>
                      <TableCell>{ap.densidadSenal}</TableCell>
                      <TableCell><Badge variant="outline">{ap.mediciones.length}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
        </CardContent>
      </Card>

      {/* Dialog: Add Medicion */}
      <Dialog open={openMedicion} onOpenChange={setOpenMedicion}>
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
            <div className="space-y-2">
              <Label>Captura de Ping 8.8.8.8</Label>
              <Input type="file" accept="image/*" className="cursor-pointer" onChange={(e) => setPingFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Captura de Velocidad de Internet</Label>
              <Input type="file" accept="image/*" className="cursor-pointer" onChange={(e) => setSpeedFile(e.target.files?.[0] || null)} />
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
