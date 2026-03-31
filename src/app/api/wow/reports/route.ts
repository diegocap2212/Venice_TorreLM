import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reports = await prisma.wowReport.findMany({
      orderBy: { created_at: "desc" }
    });
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const report = await prisma.wowReport.create({
      data: {
        sm: body.sm,
        squad: body.squad,
        date: body.date,
        cone: body.cone,
        coneText: body.coneText,
        pdti: body.pdti,
        pdtiText: body.pdtiText,
        parado: body.parado,
        paradoText: body.paradoText,
        wipEpic: body.wipEpic,
        wipEpicText: body.wipEpicText,
        wipUs: body.wipUs,
        wipUsText: body.wipUsText,
        oQue: body.oQue,
        problemas: body.problemas,
        acoes: body.acoes,
        images: body.images,
      }
    });
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    await prisma.wowReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
