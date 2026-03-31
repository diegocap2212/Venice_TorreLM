import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sm = searchParams.get("sm");
  const squad = searchParams.get("squad");
  const week = searchParams.get("week");

  try {
    if (sm && squad && week) {
      const report = await prisma.wowSquadReport.findUnique({
        where: { sm_squad_week: { sm, squad, week } }
      });
      return NextResponse.json(report);
    }
    const reports = await prisma.wowSquadReport.findMany();
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
    const { sm, squad, week, ...rest } = body;
    
    const report = await prisma.wowSquadReport.upsert({
      where: { sm_squad_week: { sm, squad, week } },
      update: rest,
      create: { sm, squad, week, ...rest }
    });
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
