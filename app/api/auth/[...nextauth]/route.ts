import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the access token and user info right after sign in
      if (account) {
        token.accessToken = account.access_token
        token.discordId = account.providerAccountId
      }
      if (profile) {
        token.username = (profile as any).username
        token.avatar = (profile as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      // Send access token and discord info to the client
      session.accessToken = token.accessToken as string
      session.discordId = token.discordId as string
      if (session.user) {
        session.user.id = token.discordId as string
        session.user.username = token.username as string
        session.user.avatar = token.avatar as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
