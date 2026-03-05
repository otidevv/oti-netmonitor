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
