import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Initialize Redis client for session & rate limiting
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

// User validation schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Mock user database (replace with real DB in production)
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@salesaholics.com",
    password: "$2a$10$lMVJB4QQ6aCdkXXnKGpe3OXY5Vj4jLcp2SZD9.X0rS3WL9SOSRn6O", // hashed "password123"
    role: "admin",
  },
  {
    id: "2",
    name: "Test User",
    email: "user@example.com",
    password: "$2a$10$lMVJB4QQ6aCdkXXnKGpe3OXY5Vj4jLcp2SZD9.X0rS3WL9SOSRn6O", // hashed "password123"
    role: "user",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials
        const result = userSchema.safeParse(credentials);
        if (!result.success) return null;

        const { email, password } = result.data;

        // In a real app, query your database here
        const user = users.find((u) => u.email === email);
        if (!user) return null;

        // In a real app, verify password with bcrypt
        // const passwordMatches = await bcrypt.compare(password, user.password);
        // if (!passwordMatches) return null;
        const passwordMatches = password === "password123"; // DEMO ONLY
        if (!passwordMatches) return null;

        // Track login attempts with Redis
        try {
          const loginAttemptKey = `login:${email}:attempts`;
          await redis.set(loginAttemptKey, 0, { ex: 60 * 60 }); // Reset after successful login
        } catch (error) {
          console.error("Redis error:", error);
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add custom claims to JWT
      if (account && user) {
        return {
          ...token,
          userId: user.id,
          role: (user as any).role || "user",
          provider: account.provider,
        };
      }

      // Rate limiting check for token refreshing
      try {
        const refreshKey = `token:${token.sub}:refresh`;
        const refreshCount = await redis.incr(refreshKey);
        if (refreshCount === 1) {
          await redis.expire(refreshKey, 60); // 1 minute expiry
        }

        if (refreshCount > 10) {
          // Too many refreshes, potential abuse
          console.warn(`Rate limiting triggered for user ${token.sub}`);
          token.isLimited = true;
        }
      } catch (error) {
        console.error("Redis rate limit error:", error);
      }

      return token;
    },
    async session({ session, token }) {
      // Add custom claims to session
      session.user.id = token.sub as string;
      session.user.role = (token as any).role || "user";
      session.user.provider = (token as any).provider;
      session.isLimited = (token as any).isLimited || false;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Helper to get server-side session
export async function getServerSession() {
  const { auth } = await import("./auth");
  return auth();
}

// Helper for client-side session handling
export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession();
  return session?.user;
}

// Initialize NextAuth
export const auth = () => NextAuthOptions(authOptions);

// Types for enhanced session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: "admin" | "user";
      provider: string;
    };
    isLimited: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user";
    provider?: string;
    isLimited?: boolean;
  }
}
