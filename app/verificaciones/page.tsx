"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Plus, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { generateConstanciaPDF } from "@/lib/generate-constancia";

interface Verificacion {
  id: string;
  fecha: string;
  carreraProfesional: string;
  cantidadAulas: number;
  nombresAulas: string[];
  proyectorLimpieza: boolean;
  proyectorEncendido: boolean;
  proyectorCalibracion: boolean;
  proyectorCalibracionImg: string | null;
  proyectorHdmi: boolean;
  proyectorHdmiEstado: string | null;
  minipcEncendido: boolean;
  minipcSistemaOperativo: boolean;
  minipcIpNombre: string | null;
  minipcAntivirus: boolean;
  minipcOffice: boolean;
  minipcTiempoUso: string | null;
  minipcPerifericos: boolean;
  minipcPerifericosEstado: string | null;
  minipcConectividad: boolean;
  minipcConectividadImg: string | null;
  pizarraInstalacion: boolean;
  pizarraCalibracion: boolean;
  pizarraSoftware: boolean;
  pizarraSincronizacion: boolean;
  audioSonido: boolean;
  audioNitidez: boolean;
  internetConectividad: boolean;
  internetConectividadImg: string | null;
  internetCobertura: boolean;
  operativas: boolean;
  observaciones: string | null;
  createdAt: string;
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

const defaultForm = {
  fecha: new Date().toISOString().split("T")[0],
  carreraProfesional: "",
  cantidadAulas: 5,
  aulasText: "",
  proyectorLimpieza: false,
  proyectorEncendido: false,
  proyectorCalibracion: false,
  proyectorHdmi: false,
  proyectorHdmiEstado: "",
  minipcEncendido: false,
  minipcSistemaOperativo: false,
  minipcIpNombre: "",
  minipcAntivirus: false,
  minipcOffice: false,
  minipcTiempoUso: "",
  minipcPerifericos: false,
  minipcPerifericosEstado: "",
  minipcConectividad: false,
  pizarraInstalacion: false,
  pizarraCalibracion: false,
  pizarraSoftware: false,
  pizarraSincronizacion: false,
  audioSonido: false,
  audioNitidez: false,
  internetConectividad: false,
  internetCobertura: false,
  operativas: true,
  observaciones: "",
};

export default function VerificacionesPage() {
  const [verificaciones, setVerificaciones] = useState<Verificacion[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<Verificacion | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/verificaciones");
    const data = await res.json();
    setVerificaciones(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const set = <K extends keyof typeof defaultForm>(
    key: K,
    val: (typeof defaultForm)[K]
  ) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleCreate = async () => {
    setLoading(true);
    const nombresAulas = form.aulasText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      fecha: form.fecha,
      carreraProfesional: form.carreraProfesional,
      cantidadAulas: form.cantidadAulas,
      nombresAulas,
      proyectorLimpieza: form.proyectorLimpieza,
      proyectorEncendido: form.proyectorEncendido,
      proyectorCalibracion: form.proyectorCalibracion,
      proyectorHdmi: form.proyectorHdmi,
      proyectorHdmiEstado: form.proyectorHdmiEstado || null,
      minipcEncendido: form.minipcEncendido,
      minipcSistemaOperativo: form.minipcSistemaOperativo,
      minipcIpNombre: form.minipcIpNombre || null,
      minipcAntivirus: form.minipcAntivirus,
      minipcOffice: form.minipcOffice,
      minipcTiempoUso: form.minipcTiempoUso || null,
      minipcPerifericos: form.minipcPerifericos,
      minipcPerifericosEstado: form.minipcPerifericosEstado || null,
      minipcConectividad: form.minipcConectividad,
      pizarraInstalacion: form.pizarraInstalacion,
      pizarraCalibracion: form.pizarraCalibracion,
      pizarraSoftware: form.pizarraSoftware,
      pizarraSincronizacion: form.pizarraSincronizacion,
      audioSonido: form.audioSonido,
      audioNitidez: form.audioNitidez,
      internetConectividad: form.internetConectividad,
      internetCobertura: form.internetCobertura,
      operativas: form.operativas,
      observaciones: form.observaciones || null,
    };
    try {
      const res = await fetch("/api/verificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setForm(defaultForm);
      setOpenCreate(false);
      await fetchData();
      toast.success("Verificacion registrada correctamente", {
        description: `Carrera: ${form.carreraProfesional}`,
      });
    } catch {
      toast.error("Error al registrar la verificacion");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (v: Verificacion) => {
    const doc = generateConstanciaPDF({
      fecha: v.fecha,
      carreraProfesional: v.carreraProfesional,
      cantidadAulas: v.cantidadAulas,
      nombresAulas: v.nombresAulas,
      proyectorLimpieza: v.proyectorLimpieza,
      proyectorEncendido: v.proyectorEncendido,
      proyectorCalibracion: v.proyectorCalibracion,
      proyectorHdmi: v.proyectorHdmi,
      proyectorHdmiEstado: v.proyectorHdmiEstado || undefined,
      minipcEncendido: v.minipcEncendido,
      minipcSistemaOperativo: v.minipcSistemaOperativo,
      minipcIpNombre: v.minipcIpNombre || undefined,
      minipcAntivirus: v.minipcAntivirus,
      minipcOffice: v.minipcOffice,
      minipcTiempoUso: v.minipcTiempoUso || undefined,
      minipcPerifericos: v.minipcPerifericos,
      minipcPerifericosEstado: v.minipcPerifericosEstado || undefined,
      minipcConectividad: v.minipcConectividad,
      pizarraInstalacion: v.pizarraInstalacion,
      pizarraCalibracion: v.pizarraCalibracion,
      pizarraSoftware: v.pizarraSoftware,
      pizarraSincronizacion: v.pizarraSincronizacion,
      audioSonido: v.audioSonido,
      audioNitidez: v.audioNitidez,
      internetConectividad: v.internetConectividad,
      internetCobertura: v.internetCobertura,
      operativas: v.operativas,
      observaciones: v.observaciones || undefined,
    });
    doc.save(
      `Constancia_${v.carreraProfesional.replace(/\s+/g, "_")}_${v.fecha.split("T")[0]}.pdf`
    );
  };

  const checkMark = (val: boolean) =>
    val ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Si</Badge>
    ) : (
      <Badge variant="destructive">No</Badge>
    );

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Operatividad de Aulas Digitales
          </h1>
          <p className="text-sm text-muted-foreground">
            Verificacion tecnica y generacion de constancias
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Verificacion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Nueva Verificacion de Aulas Digitales
              </DialogTitle>
              <DialogDescription>
                Complete el checklist de verificacion tecnica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* General Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={form.fecha}
                    onChange={(e) => set("fecha", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="carrera">Carrera Profesional</Label>
                  <Input
                    id="carrera"
                    value={form.carreraProfesional}
                    onChange={(e) =>
                      set("carreraProfesional", e.target.value)
                    }
                    placeholder="Ej: Ingenieria de Sistemas"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantAulas">Cantidad de Aulas</Label>
                  <Input
                    id="cantAulas"
                    type="number"
                    min={1}
                    value={form.cantidadAulas}
                    onChange={(e) =>
                      set("cantidadAulas", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nombresAulas">
                    Nombres de Aulas (separados por coma)
                  </Label>
                  <Input
                    id="nombresAulas"
                    value={form.aulasText}
                    onChange={(e) => set("aulasText", e.target.value)}
                    placeholder="Ej: 101, 102, 103, 104, 105"
                  />
                </div>
              </div>

              <Separator />

              {/* 1. Proyector */}
              <div>
                <h3 className="font-semibold mb-3">
                  1. Proyector multimedia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox
                    id="pLimpieza"
                    checked={form.proyectorLimpieza}
                    onChange={(v) => set("proyectorLimpieza", v)}
                    label="Limpieza externa e interna (filtro y lente)"
                  />
                  <Checkbox
                    id="pEncendido"
                    checked={form.proyectorEncendido}
                    onChange={(v) => set("proyectorEncendido", v)}
                    label="Verificacion del correcto encendido y apagado"
                  />
                  <Checkbox
                    id="pCalibracion"
                    checked={form.proyectorCalibracion}
                    onChange={(v) => set("proyectorCalibracion", v)}
                    label="Calibracion de imagen (enfoque, nitidez, tamano)"
                  />
                  <Checkbox
                    id="pHdmi"
                    checked={form.proyectorHdmi}
                    onChange={(v) => set("proyectorHdmi", v)}
                    label="Conectividad mediante cable HDMI"
                  />
                </div>
                <div className="mt-2">
                  <Label htmlFor="hdmiEstado" className="text-sm">
                    Estado del cable HDMI
                  </Label>
                  <Input
                    id="hdmiEstado"
                    value={form.proyectorHdmiEstado}
                    onChange={(e) =>
                      set("proyectorHdmiEstado", e.target.value)
                    }
                    placeholder="Ej: Buen estado"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* 2. Mini PC */}
              <div>
                <h3 className="font-semibold mb-3">2. Mini PC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox
                    id="mEncendido"
                    checked={form.minipcEncendido}
                    onChange={(v) => set("minipcEncendido", v)}
                    label="Encendido, funcionamiento general y estado fisico"
                  />
                  <Checkbox
                    id="mSO"
                    checked={form.minipcSistemaOperativo}
                    onChange={(v) => set("minipcSistemaOperativo", v)}
                    label="Sistema operativo actualizado y activado (Win 11)"
                  />
                  <Checkbox
                    id="mAntivirus"
                    checked={form.minipcAntivirus}
                    onChange={(v) => set("minipcAntivirus", v)}
                    label="Software antivirus (Sophos) actualizado"
                  />
                  <Checkbox
                    id="mOffice"
                    checked={form.minipcOffice}
                    onChange={(v) => set("minipcOffice", v)}
                    label="Microsoft Office instalado y operativo"
                  />
                  <Checkbox
                    id="mPerifericos"
                    checked={form.minipcPerifericos}
                    onChange={(v) => set("minipcPerifericos", v)}
                    label="Perifericos: teclado y mouse operativos"
                  />
                  <Checkbox
                    id="mConectividad"
                    checked={form.minipcConectividad}
                    onChange={(v) => set("minipcConectividad", v)}
                    label="Conectividad a red institucional e internet"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label className="text-sm">IP / Nombre de PC</Label>
                    <Input
                      value={form.minipcIpNombre}
                      onChange={(e) =>
                        set("minipcIpNombre", e.target.value)
                      }
                      placeholder="Ej: 192.168.1.10 / PC-AULA1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Tiempo de uso</Label>
                    <Input
                      value={form.minipcTiempoUso}
                      onChange={(e) =>
                        set("minipcTiempoUso", e.target.value)
                      }
                      placeholder="Ej: 2 anos"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">
                      Estado pilas teclado/mouse
                    </Label>
                    <Input
                      value={form.minipcPerifericosEstado}
                      onChange={(e) =>
                        set("minipcPerifericosEstado", e.target.value)
                      }
                      placeholder="Ej: Pilas nuevas"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 3. Pizarra */}
              <div>
                <h3 className="font-semibold mb-3">
                  3. Pizarra interactiva y/o Ecran
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox
                    id="piInstalacion"
                    checked={form.pizarraInstalacion}
                    onChange={(v) => set("pizarraInstalacion", v)}
                    label="Instalacion y fijacion adecuada"
                  />
                  <Checkbox
                    id="piCalibracion"
                    checked={form.pizarraCalibracion}
                    onChange={(v) => set("pizarraCalibracion", v)}
                    label="Calibracion tactil y precision de escritura"
                  />
                  <Checkbox
                    id="piSoftware"
                    checked={form.pizarraSoftware}
                    onChange={(v) => set("pizarraSoftware", v)}
                    label="Funcionamiento con software interactivo"
                  />
                  <Checkbox
                    id="piSync"
                    checked={form.pizarraSincronizacion}
                    onChange={(v) => set("pizarraSincronizacion", v)}
                    label="Sincronizacion con Mini PC y proyector"
                  />
                </div>
              </div>

              <Separator />

              {/* 4. Audio */}
              <div>
                <h3 className="font-semibold mb-3">
                  4. Sistema de audio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox
                    id="aSonido"
                    checked={form.audioSonido}
                    onChange={(v) => set("audioSonido", v)}
                    label="Salida de sonido en diferentes niveles"
                  />
                  <Checkbox
                    id="aNitidez"
                    checked={form.audioNitidez}
                    onChange={(v) => set("audioNitidez", v)}
                    label="Nitidez y ausencia de interferencias"
                  />
                </div>
              </div>

              <Separator />

              {/* 5. Internet */}
              <div>
                <h3 className="font-semibold mb-3">
                  5. Internet - Access Point
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox
                    id="iConectividad"
                    checked={form.internetConectividad}
                    onChange={(v) => set("internetConectividad", v)}
                    label="Conectividad WiFi y estabilidad de senal"
                  />
                  <Checkbox
                    id="iCobertura"
                    checked={form.internetCobertura}
                    onChange={(v) => set("internetCobertura", v)}
                    label="Cobertura adecuada dentro del aula"
                  />
                </div>
              </div>

              <Separator />

              {/* Result */}
              <div className="space-y-3">
                <Checkbox
                  id="operativas"
                  checked={form.operativas}
                  onChange={(v) => set("operativas", v)}
                  label="Aulas plenamente operativas y habilitadas"
                />
                <div className="space-y-1">
                  <Label htmlFor="observaciones">
                    Observaciones (opcional)
                  </Label>
                  <Textarea
                    id="observaciones"
                    value={form.observaciones}
                    onChange={(e) => set("observaciones", e.target.value)}
                    placeholder="Observaciones generales..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenCreate(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Verificacion"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verificaciones Realizadas</CardDescription>
            <CardTitle className="text-3xl">
              {verificaciones.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Carreras Verificadas</CardDescription>
            <CardTitle className="text-3xl">
              {new Set(verificaciones.map((v) => v.carreraProfesional)).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aulas Operativas</CardDescription>
            <CardTitle className="text-3xl">
              {verificaciones.filter((v) => v.operativas).length} /{" "}
              {verificaciones.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verificaciones</CardTitle>
          <CardDescription>
            Historial de verificaciones de aulas digitales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Carrera Profesional</TableHead>
                  <TableHead>Aulas</TableHead>
                  <TableHead>Proyector</TableHead>
                  <TableHead>Mini PC</TableHead>
                  <TableHead>Pizarra</TableHead>
                  <TableHead>Audio</TableHead>
                  <TableHead>Internet</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificaciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay verificaciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  verificaciones.map((v) => {
                    const proyOk =
                      v.proyectorLimpieza &&
                      v.proyectorEncendido &&
                      v.proyectorCalibracion &&
                      v.proyectorHdmi;
                    const miniOk =
                      v.minipcEncendido &&
                      v.minipcSistemaOperativo &&
                      v.minipcAntivirus &&
                      v.minipcOffice &&
                      v.minipcPerifericos &&
                      v.minipcConectividad;
                    const pizOk =
                      v.pizarraInstalacion &&
                      v.pizarraCalibracion &&
                      v.pizarraSoftware &&
                      v.pizarraSincronizacion;
                    const audOk = v.audioSonido && v.audioNitidez;
                    const intOk =
                      v.internetConectividad && v.internetCobertura;

                    return (
                      <TableRow key={v.id}>
                        <TableCell>
                          {new Date(v.fecha).toLocaleDateString("es-PE")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {v.carreraProfesional}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {v.cantidadAulas} aulas
                          </Badge>
                        </TableCell>
                        <TableCell>{checkMark(proyOk)}</TableCell>
                        <TableCell>{checkMark(miniOk)}</TableCell>
                        <TableCell>{checkMark(pizOk)}</TableCell>
                        <TableCell>{checkMark(audOk)}</TableCell>
                        <TableCell>{checkMark(intOk)}</TableCell>
                        <TableCell>
                          {v.operativas ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Operativa
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Con observaciones
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelected(v);
                                setOpenDetail(true);
                              }}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(v)}
                              title="Descargar constancia PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Detail */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Verificacion</DialogTitle>
            <DialogDescription>
              {selected?.carreraProfesional} -{" "}
              {selected &&
                new Date(selected.fecha).toLocaleDateString("es-PE")}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Aulas:</span>{" "}
                  {selected.nombresAulas.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Cantidad:</span>{" "}
                  {selected.cantidadAulas}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">1. Proyector multimedia</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Limpieza: {checkMark(selected.proyectorLimpieza)}</div>
                  <div>Encendido: {checkMark(selected.proyectorEncendido)}</div>
                  <div>Calibracion: {checkMark(selected.proyectorCalibracion)}</div>
                  <div>HDMI: {checkMark(selected.proyectorHdmi)} {selected.proyectorHdmiEstado && `(${selected.proyectorHdmiEstado})`}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">2. Mini PC</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Encendido: {checkMark(selected.minipcEncendido)}</div>
                  <div>SO: {checkMark(selected.minipcSistemaOperativo)}</div>
                  <div>Antivirus: {checkMark(selected.minipcAntivirus)}</div>
                  <div>Office: {checkMark(selected.minipcOffice)}</div>
                  <div>Perifericos: {checkMark(selected.minipcPerifericos)} {selected.minipcPerifericosEstado && `(${selected.minipcPerifericosEstado})`}</div>
                  <div>Conectividad: {checkMark(selected.minipcConectividad)}</div>
                </div>
                {selected.minipcIpNombre && (
                  <p className="text-sm mt-1">IP/Nombre: {selected.minipcIpNombre}</p>
                )}
                {selected.minipcTiempoUso && (
                  <p className="text-sm">Tiempo de uso: {selected.minipcTiempoUso}</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">3. Pizarra interactiva</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Instalacion: {checkMark(selected.pizarraInstalacion)}</div>
                  <div>Calibracion: {checkMark(selected.pizarraCalibracion)}</div>
                  <div>Software: {checkMark(selected.pizarraSoftware)}</div>
                  <div>Sincronizacion: {checkMark(selected.pizarraSincronizacion)}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">4. Sistema de audio</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Sonido: {checkMark(selected.audioSonido)}</div>
                  <div>Nitidez: {checkMark(selected.audioNitidez)}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">5. Internet - Access Point</h4>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Conectividad: {checkMark(selected.internetConectividad)}</div>
                  <div>Cobertura: {checkMark(selected.internetCobertura)}</div>
                </div>
              </div>

              {selected.observaciones && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-1">Observaciones</h4>
                    <p className="text-sm text-muted-foreground">{selected.observaciones}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleDownloadPDF(selected)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar Constancia PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
