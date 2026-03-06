"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Eye, X, Image as ImageIcon } from "lucide-react";

interface Medicion {
  id: string;
  aula: string;
  interfaz24Image: string;
  interfaz5Image: string;
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
  mediciones: Medicion[];
}

function ImageOverlay({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      style={{ pointerEvents: "auto" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 cursor-pointer"
      onMouseDown={onClose}
    >
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 cursor-pointer text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors z-10"
      >
        <X className="h-8 w-8" />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

export default function HistorialPage() {
  const params = useParams();
  const [ap, setAP] = useState<AccessPoint | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicion | null>(null);

  const fetchAP = useCallback(async () => {
    const res = await fetch(`/api/access-points/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setAP(data);
    }
  }, [params.id]);

  useEffect(() => {
    fetchAP();
  }, [fetchAP]);

  if (!ap) {
    return (
      <main className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Cargando...
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/access-points">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            Historial de Mediciones - {ap.ap}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ap.nombreSenal} | {ap.pabellon} | {ap.piso} | {ap.ubicacion}
          </p>
        </div>
      </div>

      {/* AP Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos del Access Point</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">AP:</span>{" "}
              <span className="font-medium">{ap.ap}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Marca:</span>{" "}
              <span className="font-medium">{ap.marca}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Modelo:</span>{" "}
              <span className="font-medium">{ap.modelo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">MAC:</span>{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {ap.mac}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Cod. Patrimonial:</span>{" "}
              <span className="font-medium">{ap.codPatrimonial}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pabellon:</span>{" "}
              <Badge variant="secondary">{ap.pabellon}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Piso:</span>{" "}
              <span className="font-medium">{ap.piso}</span>
            </div>
            <div>
              <span className="text-muted-foreground">IP:</span>{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ap.ip}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Senal:</span>{" "}
              <span className="font-medium">{ap.nombreSenal}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Densidad:</span>{" "}
              <span className="font-medium">{ap.densidadSenal}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mediciones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mediciones</CardTitle>
          <CardDescription>
            {ap.mediciones.length} medicion(es) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead className="text-center">2.4 GHz</TableHead>
                  <TableHead className="text-center">5 GHz</TableHead>
                  <TableHead className="text-center">Ping 8.8.8.8</TableHead>
                  <TableHead className="text-center">Velocidad</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-center w-[100px]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ap.mediciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No hay mediciones registradas para este AP
                    </TableCell>
                  </TableRow>
                ) : (
                  ap.mediciones.map((med, i) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {ap.mediciones.length - i}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(med.createdAt).toLocaleDateString("es-PE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(med.createdAt).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{med.aula || "---"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {med.interfaz24Image ? (
                          <button
                            onClick={() => setPreviewImage(med.interfaz24Image)}
                            className="inline-block border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                          >
                            <img src={med.interfaz24Image} alt="2.4 GHz" className="h-16 w-28 object-cover" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {med.interfaz5Image ? (
                          <button
                            onClick={() => setPreviewImage(med.interfaz5Image)}
                            className="inline-block border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                          >
                            <img src={med.interfaz5Image} alt="5 GHz" className="h-16 w-28 object-cover" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => setPreviewImage(med.pingImage)}
                          className="inline-block border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                        >
                          <img
                            src={med.pingImage}
                            alt="Ping"
                            className="h-16 w-28 object-cover"
                          />
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => setPreviewImage(med.speedImage)}
                          className="inline-block border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                        >
                          <img
                            src={med.speedImage}
                            alt="Velocidad"
                            className="h-16 w-28 object-cover"
                          />
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                          {med.notas || "---"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedMed(med);
                            setOpenDetail(true);
                          }}
                          title="Ver detalle completo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Medicion Detail */}
      <Dialog
        open={openDetail}
        onOpenChange={(open) => {
          // Don't close if image preview is open
          if (!open && previewImage) return;
          setOpenDetail(open);
        }}
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            // Prevent closing when clicking on image overlay
            if (previewImage) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing when image overlay handles Escape
            if (previewImage) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Detalle de Medicion</DialogTitle>
          </DialogHeader>
          {selectedMed && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Aula:</span>{" "}
                  <Badge variant="secondary">
                    {selectedMed.aula || "---"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-medium">
                    {new Date(selectedMed.createdAt).toLocaleString("es-PE")}
                  </span>
                </div>
              </div>
              {(selectedMed.interfaz24Image || selectedMed.interfaz5Image) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMed.interfaz24Image && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Interfaz 2.4 GHz
                      </p>
                      <div
                        className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setPreviewImage(selectedMed.interfaz24Image)}
                      >
                        <img src={selectedMed.interfaz24Image} alt="2.4 GHz" className="w-full h-auto" />
                      </div>
                    </div>
                  )}
                  {selectedMed.interfaz5Image && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Interfaz 5 GHz
                      </p>
                      <div
                        className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setPreviewImage(selectedMed.interfaz5Image)}
                      >
                        <img src={selectedMed.interfaz5Image} alt="5 GHz" className="w-full h-auto" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Ping 8.8.8.8
                  </p>
                  <div
                    className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => setPreviewImage(selectedMed.pingImage)}
                  >
                    <img
                      src={selectedMed.pingImage}
                      alt="Ping test"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Velocidad de Internet
                  </p>
                  <div
                    className="border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => setPreviewImage(selectedMed.speedImage)}
                  >
                    <img
                      src={selectedMed.speedImage}
                      alt="Speed test"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
              {selectedMed.notas && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMed.notas}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Overlay - renders on top of everything */}
      {previewImage && (
        <ImageOverlay
          src={previewImage}
          onClose={() => setPreviewImage("")}
        />
      )}
    </main>
  );
}
