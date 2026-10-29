import "dotenv/config";
import mysql from "mysql2/promise";

// Configuración SSL para la base de datos en la nube.
const ssl = process.env.DB_SSL === "true"
  ? {
      rejectUnauthorized: true,
      ...(process.env.DB_SSL_CA
        ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
        : {}),
    }
  : undefined;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "aprende_jugando",
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
  ...(ssl ? { ssl } : {}),
});

pool.on("connection", (connection) =>
  connection.query("SET time_zone = '+00:00'"),
);