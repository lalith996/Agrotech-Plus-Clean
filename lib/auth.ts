import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { UserRole } from "@prisma/client"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"
import { getRoleSetting } from "@/lib/config/roles"

const providers = [] as NextAuthOptions["providers"]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      // Fetch full user to avoid Prisma select typing issues
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user) return null

      const passwordHash = (user as any)?.passwordHash
      if (!passwordHash) return null

      const ok = await compare(credentials.password, passwordHash)
      if (!ok) return null

      return { id: user.id, name: user.name || null, email: user.email, role: user.role } as any
    },
  })
)

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in, add role to token
      if (user && (user as any).role) {
        token.role = (user as any).role as UserRole
      }
      
      // On subsequent requests, ensure role is still in token
      // If not present, fetch from database
      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = (token.role as UserRole) || ("CUSTOMER" as UserRole)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Prevent open redirects; allow only same-origin or relative paths
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
    async signIn({ user, account }) {
      // Restrict provider per role
      const role: UserRole = ((user as any)?.role as UserRole) || ("CUSTOMER" as UserRole)
      const setting = getRoleSetting(role)
      const provider = account?.provider === "google" ? "google" : "credentials"
      if (!setting.allowedAuthProviders.includes(provider)) {
        const params = new URLSearchParams({ error: "AccessDenied", provider, role })
        return `/auth/error?${params.toString()}`
      }
      return true
    },
  },
}
