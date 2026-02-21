import snowflake from "snowflake-sdk";
import { log } from "./logger";

snowflake.configure({ logLevel: "ERROR" });

let connection: snowflake.Connection | null = null;

function getConnection(): Promise<snowflake.Connection> {
  return new Promise((resolve, reject) => {
    if (connection && connection.isUp()) {
      return resolve(connection);
    }

    const warehouse = process.env.SNOWFLAKE_WAREHOUSE!;
    const schema = process.env.SNOWFLAKE_SCHEMA!;

    const connOpts: any = {
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      password: process.env.SNOWFLAKE_PASSWORD!,
      database: process.env.SNOWFLAKE_DATABASE!,
      warehouse,
      schema,
    };

    log(`Connecting to Snowflake (db: "${process.env.SNOWFLAKE_DATABASE}")`, "snowflake");

    const conn = snowflake.createConnection(connOpts);

    conn.connect((err, conn) => {
      if (err) {
        log(`Snowflake connection error: ${err.message}`, "snowflake");
        return reject(err);
      }
      log("Connected to Snowflake", "snowflake");

      const rawWh = process.env.SNOWFLAKE_WAREHOUSE || "";
      const schemaVal = process.env.SNOWFLAKE_SCHEMA || "";
      const useWh = rawWh.match(/^[A-Z0-9_]+$/i) ? rawWh : (schemaVal.match(/^[A-Z0-9_]+$/i) ? schemaVal : "");
      if (useWh) {
        conn.execute({
          sqlText: `USE WAREHOUSE "${useWh}"`,
          complete: (whErr) => {
            if (whErr) {
              log(`USE WAREHOUSE failed: ${whErr.message}`, "snowflake");
            } else {
              log(`Warehouse set to ${useWh}`, "snowflake");
            }
            connection = conn;
            resolve(conn);
          },
        });
      } else {
        connection = conn;
        resolve(conn);
      }
    });
  });
}

export function executeQuery<T = Record<string, unknown>>(
  sql: string
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await getConnection();
      conn.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          if (err) {
            log(`Snowflake query error: ${err.message}`, "snowflake");
            return reject(err);
          }
          resolve((rows || []) as T[]);
        },
      });
    } catch (err) {
      reject(err);
    }
  });
}
