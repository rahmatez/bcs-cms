import NextAuth, { type Session, type User as AdapterUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { z } from "zod";
import { Role, Status } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login"
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
  async authorize(credentials: Record<string, unknown> | undefined) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        if (user.status !== Status.ACTIVE) {
          return null;
        }

        const match = await compare(password, user.passwordHash);
        if (!match) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
  async jwt({ token, user }: { token: JWT; user?: AdapterUser | null }): Promise<JWT> {
      if (user) {
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
  async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        if (token.role) {
          session.user.role = token.role as Role;
        }
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    }
  }
});
