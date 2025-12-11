// src/app/letters/page.tsx
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LettersClient from "./LettersClient";

export default async function LettersPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/letters");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    redirect("/");
  }

  const coverLetters = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const lettersDTO = coverLetters.map((cl) => ({
    id: cl.id,
    jobTitle: cl.jobTitle,
    company: cl.company,
    jobLink: cl.jobLink,
    jobSummary: cl.jobSummary,
    letter: cl.letter,
    createdAt: cl.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 bg-slate-950">
      <div className="w-full max-w-5xl bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-800">
        <LettersClient initialLetters={lettersDTO} />
      </div>
    </div>
  );
}
