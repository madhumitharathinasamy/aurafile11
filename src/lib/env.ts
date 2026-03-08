import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Add future keys here, e.g., NEXT_PUBLIC_ANALYTICS_ID
    // DATABASE_URL: z.string().url(),
});

const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
};

// Safe parsing to allow readable error messages
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env = parsed.data;
