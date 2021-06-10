import { DatabaseConfig } from "./configurationService";
import * as mysql2 from "mysql2";
import { FieldPacket } from "mysql2";
import { Logger } from "./logService";
import Query = require("mysql2/typings/mysql/lib/protocol/sequences/Query");

/**
 *
 * @param config database config of this item
 * @param schema schema used
 * @param sql sql to execute
 * @param callBack callback
 */
export function execSelect(
  config: DatabaseConfig,
  schema: string,
  sql: string,
  callBack?: (
    err: Query.QueryError | null,
    result: any,
    fields: FieldPacket[]
  ) => any
) {
  let connection = mysql2.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: schema,
    port:config.port
  });
  Logger.debug(`${config.name}(${config.host}) -- execSelect: ${sql}`);
  connection.connect();
  connection.query(sql, callBack);
  connection.end();
}

/**
 *
 * @param curVersion current version
 * @param desVersion destination version
 * @returns true if curVersion>=desVersion
 */
export function versionCheck(curVersion: string, desVersion: string): boolean {
  let currentVersions = curVersion.split(".");
  let destinationVersions = desVersion.split(".");
  for (let index = 0; index < destinationVersions.length; index++) {
    if (
      !currentVersions[index] ||
      currentVersions[index] < destinationVersions[index]
    ) {
      return false;
    }
  }

  return true;
}
