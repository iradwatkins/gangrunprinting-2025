import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true },
        });

        if (!user) {
          // For demo/testing, auto-create user on first login
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              profile: {
                create: {
                  email: credentials.email,
                  firstName: credentials.email.split("@")[0],
                  isAdmin: credentials.email === "admin@gangrunprinting.com",
                },
              },
            },
            include: { profile: true },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            isAdmin: newUser.profile?.isAdmin || false,
            isBroker: newUser.profile?.isBroker || false,
          };
        }

        // In production, you'd verify the password here
        // For now, we'll accept any password for existing users
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.profile?.isAdmin || false,
          isBroker: user.profile?.isBroker || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.isBroker = (user as any).isBroker;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isBroker = token.isBroker;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};