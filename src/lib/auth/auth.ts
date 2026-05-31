import { envServer } from "@/data/env/server";
import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { sendVerificationOtp } from "@/services/mailjet/emails/send-verification-otp";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: envServer.GOOGLE_CLIENT_ID,
      clientSecret: envServer.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: envServer.GITHUB_CLIENT_ID,
      clientSecret: envServer.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP(data) {
        await sendVerificationOtp(data);
      },
    }),
  ],
  session: {
    cookieCache: {
      maxAge: 60,
      enabled: true,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});

export type User = typeof auth.$Infer.Session.user;
