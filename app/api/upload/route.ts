import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(UPLOADS_DIR, { recursive: true });

  const timestamp = Date.now();
  const ext = path.extname(file.name) || ".png";
  const filename = `${timestamp}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
