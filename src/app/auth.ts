// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const name = credentials?.name || "";

        if (!email) return null;

        // Creamos o encontramos al usuario por email
        const user = await prisma.user.upsert({
          where: { email },
          update: { name },
          create: {
            email,
            name,
            // credits se inicializa con el default(10) del modelo
          },
        });

        return user;
      },
    }),
  ],
});
