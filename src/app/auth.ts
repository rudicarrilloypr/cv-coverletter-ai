// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

type CredentialsForm = {
  email?: string;
  name?: string;
};

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
      // 👇 OJO: no tipamos con CredentialsInput ni nada raro
      async authorize(rawCredentials) {
        const credentials = (rawCredentials ?? {}) as CredentialsForm;

        const email = credentials.email;
        const name = credentials.name ?? "";

        // Narrowing: a partir de aquí TS sabe que email es string
        if (!email) {
          return null;
        }

        // Creamos o encontramos al usuario por email
        const user = await prisma.user.upsert({
          where: { email },      // email: string ✅
          update: { name },
          create: {
            email,
            name,
            // credits usa el default(10) del modelo
          },
        });

        // Devolver el usuario para NextAuth
        return user;
      },
    }),
  ],
});
