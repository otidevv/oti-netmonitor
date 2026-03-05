import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const verificaciones = await prisma.verificacion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(verificaciones);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const verificacion = await prisma.verificacion.create({
    data: {
      ...body,
      fecha: new Date(body.fecha),
    },
  });
  return NextResponse.json(verificacion, { status: 201 });
}
