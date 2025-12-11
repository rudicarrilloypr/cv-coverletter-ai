// src/app/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,

  // 👇 IMPORTANTE para Credentials
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Si no existe o no tiene password guardado → null
        if (!user || !user.password) {
          return null;
        }

        // Comparar password plano vs hash
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Lo que retornes aquí se agrega al JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // 👇 Para que `signIn("credentials")` use tu página de login
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Cuando el usuario hace login, 'user' viene definido 1 sola vez
      if (user) {
        token.userId = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos el id al objeto session.user
      if (token?.userId && session.user) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
});
