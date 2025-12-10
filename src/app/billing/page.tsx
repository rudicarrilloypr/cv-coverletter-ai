// src/app/billing/page.tsx
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/billing");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  const credits = user?.credits ?? 0;

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 bg-slate-950">
      <div className="w-full max-w-3xl bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-800">
        <BillingClient initialCredits={credits} />
      </div>
    </div>
  );
}
