import { jsPDF } from "jspdf";

interface VerificacionData {
  fecha: string;
  carreraProfesional: string;
  cantidadAulas: number;
  nombresAulas: string[];
  proyectorLimpieza: boolean;
  proyectorEncendido: boolean;
  proyectorCalibracion: boolean;
  proyectorHdmi: boolean;
  proyectorHdmiEstado?: string;
  minipcEncendido: boolean;
  minipcSistemaOperativo: boolean;
  minipcIpNombre?: string;
  minipcAntivirus: boolean;
  minipcOffice: boolean;
  minipcTiempoUso?: string;
  minipcPerifericos: boolean;
  minipcPerifericosEstado?: string;
  minipcConectividad: boolean;
  pizarraInstalacion: boolean;
  pizarraCalibracion: boolean;
  pizarraSoftware: boolean;
  pizarraSincronizacion: boolean;
  audioSonido: boolean;
  audioNitidez: boolean;
  internetConectividad: boolean;
  internetCobertura: boolean;
  operativas: boolean;
  observaciones?: string;
}

function check(val: boolean): string {
  return val ? "[X]" : "[  ]";
}

export function generateConstanciaPDF(data: VerificacionData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(
    "CONSTANCIA DE VERIFICACION Y OPERATIVIDAD DE AULAS DIGITALES",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const fechaObj = new Date(data.fecha + "T12:00:00");
  const dia = fechaObj.getDate();
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const mes = meses[fechaObj.getMonth()];
  const anio = fechaObj.getFullYear();

  const aulasListStr = data.nombresAulas.join(", ");
  const cantTexto =
    data.cantidadAulas === 1
      ? "1 (01) aula digital"
      : `${data.cantidadAulas} (0${data.cantidadAulas}) aulas digitales`;

  const intro = `Por medio de la presente, se deja constancia que con fecha ${dia} de ${mes} del ${anio}, se realizo la verificacion tecnica, revision de instalacion y pruebas de funcionamiento de las ${cantTexto} (${aulasListStr}) de la Carrera Profesional de ${data.carreraProfesional} de la UNAMAD.`;

  const lines = doc.splitTextToSize(intro, contentWidth);
  doc.text(lines, margin, y);
  y += lines.length * 5 + 4;

  const intro2 =
    "Durante la inspeccion tecnica se verifico en cada aula la correcta instalacion, configuracion y operatividad de los siguientes equipos tecnologicos:";
  const lines2 = doc.splitTextToSize(intro2, contentWidth);
  doc.text(lines2, margin, y);
  y += lines2.length * 5 + 6;

  // Section helper
  function section(title: string) {
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;
  }

  function item(label: string, checked: boolean, extra?: string) {
    const text = `${check(checked)} ${label}${extra ? ` (${extra})` : ""}`;
    const wrapped = doc.splitTextToSize(text, contentWidth - 5);
    doc.text(wrapped, margin + 5, y);
    y += wrapped.length * 5;
  }

  // 1. Proyector
  section("1. Proyector multimedia");
  item("Limpieza externa e interna (filtro y lente)", data.proyectorLimpieza);
  item("Verificacion del correcto encendido y apagado", data.proyectorEncendido);
  item("Calibracion de imagen (enfoque, nitidez, tamano y alineacion)", data.proyectorCalibracion);
  item(
    "Prueba de conectividad mediante cable HDMI",
    data.proyectorHdmi,
    data.proyectorHdmiEstado || undefined
  );
  y += 2;

  // 2. Mini PC
  section("2. Mini PC");
  item("Verificacion de encendido, funcionamiento general y estado fisico", data.minipcEncendido);
  item("Comprobacion del sistema operativo actualizado y activado (Windows 11)", data.minipcSistemaOperativo);
  if (data.minipcIpNombre) {
    doc.text(`     IP / Nombre PC: ${data.minipcIpNombre}`, margin + 5, y);
    y += 5;
  }
  item("Revision y actualizacion de software antivirus (Sophos)", data.minipcAntivirus);
  item("Verificacion del paquete Microsoft Office instalado y operativo", data.minipcOffice);
  if (data.minipcTiempoUso) {
    doc.text(`     Tiempo de uso: ${data.minipcTiempoUso}`, margin + 5, y);
    y += 5;
  }
  item(
    "Revision y operatividad de perifericos: teclado y mouse",
    data.minipcPerifericos,
    data.minipcPerifericosEstado || undefined
  );
  item("Conectividad a red institucional e internet (UNAMAD WiFi)", data.minipcConectividad);
  y += 2;

  // 3. Pizarra
  section("3. Pizarra interactiva y/o Ecran");
  item("Verificacion de instalacion y fijacion adecuada a pared o soporte", data.pizarraInstalacion);
  item("Calibracion tactil y precision de escritura digital", data.pizarraCalibracion);
  item("Prueba de funcionamiento con software interactivo", data.pizarraSoftware);
  item("Sincronizacion con el Mini PC y proyector", data.pizarraSincronizacion);
  y += 2;

  // 4. Audio
  section("4. Sistema de audio (parlantes y/o amplificador)");
  item("Prueba de salida de sonido en diferentes niveles de volumen", data.audioSonido);
  item("Verificacion de nitidez y ausencia de interferencias o distorsion", data.audioNitidez);
  y += 2;

  // 5. Internet
  section("5. Internet - Access Point");
  item("Prueba de conectividad inalambrica (WiFi) y estabilidad de senal", data.internetConectividad);
  item("Revision de cobertura adecuada dentro del aula", data.internetCobertura);
  y += 6;

  // Check if we need a new page
  if (y > 240) {
    doc.addPage();
    y = 25;
  }

  // Conclusion
  const estado = data.operativas
    ? "plenamente operativas y habilitadas"
    : "con observaciones pendientes";
  const conclusion = `Luego de efectuadas las pruebas correspondientes, se certifica que los equipos antes mencionados se encuentran debidamente instalados y en optimas condiciones de funcionamiento, quedando las ${cantTexto} (${aulasListStr}) ${estado} para el desarrollo de actividades academicas en el periodo lectivo ${anio}.`;
  const concLines = doc.splitTextToSize(conclusion, contentWidth);
  doc.text(concLines, margin, y);
  y += concLines.length * 5 + 4;

  const expide =
    "Se expide la presente constancia para los fines administrativos y academicos que se estimen pertinentes.";
  const expLines = doc.splitTextToSize(expide, contentWidth);
  doc.text(expLines, margin, y);
  y += expLines.length * 5 + 4;

  if (data.observaciones) {
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const obsLines = doc.splitTextToSize(data.observaciones, contentWidth);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 5 + 4;
  }

  // Signatures
  if (y > 240) {
    doc.addPage();
    y = 25;
  }

  y += 15;
  doc.setLineWidth(0.3);

  // Left signature
  const leftCenter = margin + contentWidth * 0.25;
  doc.line(leftCenter - 30, y, leftCenter + 30, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SOPORTE INFORMATICO - OTI", leftCenter, y, { align: "center" });

  // Right signature
  const rightCenter = margin + contentWidth * 0.75;
  doc.line(rightCenter - 30, y - 5, rightCenter + 30, y - 5);
  doc.text("FIRMA DEL DIRECTOR", rightCenter, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("ESCUELA PROFESIONAL DE LA CARRERA", rightCenter, y, {
    align: "center",
  });

  return doc;
}
