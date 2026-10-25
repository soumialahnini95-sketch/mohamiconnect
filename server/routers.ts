import { COOKIE_NAME } from "@shared/const";
import { CITIES, LEGAL_CATEGORIES } from "../drizzle/schema";
import { activateDemoSubscription, createLegalLead, getLawyerDashboard, getLawyerVerificationQueue, saveLawyerPreferences, setLawyerVerified } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const leadInput = z.object({
  category: z.enum(LEGAL_CATEGORIES),
  city: z.enum(CITIES),
  description: z.string().trim().min(20, "Décrivez votre situation en quelques phrases.").max(5000),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(7).max(40),
  contactEmail: z.string().trim().email().max(320),
});

function databaseError() {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Le service est momentanément indisponible. Veuillez réessayer dans quelques instants.",
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  lead: router({
    submit: publicProcedure.input(leadInput).mutation(async ({ input }) => {
      try {
        await createLegalLead(input);
        return { success: true } as const;
      } catch (error) {
        console.error("[Leads] Could not save legal request:", error);
        throw databaseError();
      }
    }),
  }),
  lawyer: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getLawyerDashboard(ctx.user.id, ctx.user.role === "admin");
      } catch (error) {
        console.error("[Lawyer dashboard] Could not load leads:", error);
        throw databaseError();
      }
    }),
    savePreferences: protectedProcedure
      .input(z.object({ city: z.enum(CITIES), specialty: z.enum(LEGAL_CATEGORIES) }))
      .mutation(async ({ ctx, input }) => {
        try {
          await saveLawyerPreferences(ctx.user.id, input.city, input.specialty);
          return { success: true } as const;
        } catch (error) {
          console.error("[Lawyer profile] Could not save preferences:", error);
          throw databaseError();
        }
      }),
    activateDemoSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const dashboard = await getLawyerDashboard(ctx.user.id, ctx.user.role === "admin");
        if (!dashboard.profile) throw new TRPCError({ code: "NOT_FOUND", message: "Configurez votre profil avocat d’abord." });
        if (!dashboard.profile.verified && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Votre profil avocat doit être validé avant l’accès aux coordonnées." });
        }
        await activateDemoSubscription(ctx.user.id);
        return { active: true } as const;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Lawyer subscription] Could not activate demo access:", error);
        throw databaseError();
      }
    }),
  }),
  admin: router({
    verificationQueue: adminProcedure.query(async () => {
      try {
        return await getLawyerVerificationQueue();
      } catch (error) {
        console.error("[Admin] Could not load lawyer verification queue:", error);
        throw databaseError();
      }
    }),
    verifyLawyer: adminProcedure
      .input(z.object({ profileId: z.number().int().positive(), verified: z.boolean() }))
      .mutation(async ({ input }) => {
        try {
          await setLawyerVerified(input.profileId, input.verified);
          return { success: true } as const;
        } catch (error) {
          console.error("[Admin] Could not update lawyer verification:", error);
          throw databaseError();
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
