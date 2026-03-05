import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const medicion = await prisma.medicion.create({
    data: {
      accessPointId: id,
      aula: body.aula,
      pingImage: body.pingImage,
      speedImage: body.speedImage,
      notas: body.notas || null,
    },
  });
  return NextResponse.json(medicion, { status: 201 });
}
