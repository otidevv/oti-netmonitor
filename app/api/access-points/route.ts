import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const aps = await prisma.accessPoint.findMany({
    include: { mediciones: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(aps);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ap = await prisma.accessPoint.create({ data: body });
  return NextResponse.json(ap, { status: 201 });
}
