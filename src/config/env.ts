import "dotenv/config";

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readJwtSecret(): string {
  // Allow a deterministic fallback for tests only.
  if (process.env.NODE_ENV === "test") {
    return process.env.JWT_SECRET ?? "test-jwt-secret";
  }

  return readEnv("JWT_SECRET");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl:
    process.env.NODE_ENV === "production"
      ? readEnv("DATABASE_URL")
      : readEnv(
          "DATABASE_URL",
          "postgresql://postgres:postgres@localhost:5432/finance_dashboard?schema=public",
        ),
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
};
