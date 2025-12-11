import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      name: user.name ?? null,
      email: user.email,
      credits: user.credits ?? 0,
    },
    { status: 200 }
  );
}
