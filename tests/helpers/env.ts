import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-jwt-secret-at-least-thirty-two-chars!!";
process.env.JWT_ACCESS_SECRET ??=
  "test-access-secret-at-least-thirty-two-characters-long";
process.env.JWT_REFRESH_SECRET ??=
  "test-refresh-secret-at-least-thirty-two-characters-long";
process.env.JWT_EXPIRES_IN ??= "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN ??= "7d";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5433/capstone_test";
