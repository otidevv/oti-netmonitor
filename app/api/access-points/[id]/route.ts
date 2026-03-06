import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ap = await prisma.accessPoint.findUnique({
    where: { id },
    include: { mediciones: { orderBy: { createdAt: "desc" } } },
  });
  if (!ap) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(ap);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const ap = await prisma.accessPoint.update({
    where: { id },
    data: {
      ap: body.ap,
      marca: body.marca,
      modelo: body.modelo,
      mac: body.mac,
      codPatrimonial: body.codPatrimonial,
      pabellon: body.pabellon,
      piso: body.piso,
      ubicacion: body.ubicacion,
      ip: body.ip,
      nombreSenal: body.nombreSenal,
      densidadSenal: body.densidadSenal,
    },
  });
  return NextResponse.json(ap);
}
