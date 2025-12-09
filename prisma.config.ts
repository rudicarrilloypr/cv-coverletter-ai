// prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Para SQLite usando archivo local dev.db
  datasource: {
    url: "file:./dev.db",
  },
});
