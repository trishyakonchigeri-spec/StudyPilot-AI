
import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: process.env.DB_PASSWORD ?? "",
  database: "studypilot",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
