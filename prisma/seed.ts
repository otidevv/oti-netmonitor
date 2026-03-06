import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";
import * as path from "path";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:954040025@localhost:5432/netmonitor?schema=public",
});
const prisma = new PrismaClient({ adapter });

function formatMac(mac: string): string {
  // Remove all non-hex characters, uppercase, then insert : every 2 chars
  const clean = mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  return clean.match(/.{1,2}/g)?.join(":") || clean;
}

function extractPiso(nombre: string): string {
  const lower = nombre.toLowerCase();
  if (/piso[- _]*1|1er\s*piso|1er/i.test(lower)) return "Piso 1";
  if (/piso[- _]*2|2do\s*piso|2do/i.test(lower)) return "Piso 2";
  if (/piso[- _]*3|3er\s*piso|3er/i.test(lower)) return "Piso 3";
  if (/piso[- _]*4|4to\s*piso|4to/i.test(lower)) return "Piso 4";
  return "";
}

function extractUbicacion(nombre: string): string {
  // Remove the AP-PAB-X-PISO-Xer/Xdo/Xto prefix to get the descriptive part
  let ubicacion = nombre
    .replace(/^AP[-.]?PAB[-.]?[AB][-.]?PISO[-.]?\d+(er|do|to)?[-.]?/i, "")
    .replace(/^PAB\.?\s*[AB]\s*[-]?\s*\d+(ER|DO|TO)?\s*PISO\s*/i, "")
    .replace(/^PAB\.?\s*[AB]\s*[-]?\s*/i, "")
    .trim();

  // Clean up leading dashes/dots
  ubicacion = ubicacion.replace(/^[-. ]+/, "").trim();

  return ubicacion || nombre;
}

async function main() {
  const xlsxPath = path.resolve(
    "C:/Users/PC/Downloads/access_points_consolidado.xlsx"
  );
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

  // Skip header row
  const dataRows = rows.slice(1).filter((row) => row[0] != null && row[4]);

  console.log(`Found ${dataRows.length} access points to insert...`);

  let inserted = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const nombre = String(row[4] || "").trim();
    const mac = formatMac(String(row[5] || "").trim());
    const marca = String(row[1] || "").trim();
    const modelo = String(row[2] || "undefined").trim() === "undefined" ? "" : String(row[2] || "").trim();
    const pabellonRaw = String(row[3] || "").trim().toUpperCase();
    const pabellon = pabellonRaw === "A" ? "Pabellon A" : pabellonRaw === "B" ? "Pabellon B" : `Pabellon ${pabellonRaw}`;
    const piso = extractPiso(nombre);
    const ubicacion = extractUbicacion(nombre);
    const ip = row[6] ? String(row[6]).trim() : "";

    // Skip rows with XXX as name
    if (nombre === "XXX") {
      skipped++;
      continue;
    }

    // Check if AP with this MAC already exists
    const existing = await prisma.accessPoint.findFirst({
      where: { mac },
    });

    if (existing) {
      console.log(`  SKIP (exists): ${nombre} [${mac}]`);
      skipped++;
      continue;
    }

    await prisma.accessPoint.create({
      data: {
        ap: nombre,
        marca,
        modelo,
        mac,
        codPatrimonial: "",
        pabellon,
        piso,
        ubicacion,
        ip: ip || "",
        nombreSenal: "UNAMAD WiFi",
        densidadSenal: "",
      },
    });

    console.log(`  OK: ${nombre} | ${pabellon} | ${piso} | ${ubicacion}`);
    inserted++;
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
