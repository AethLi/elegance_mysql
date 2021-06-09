import { EleganceTreeItem } from "../provider/eleganceDatabaseProvider";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { convertImports } from "../../capability/viewsUtils";
import { execSelect } from "../../capability/databaseUtils";
import { Message } from "../../model/messageModel";
import { Logger } from "../../capability/logService";
import Query = require("mysql2/typings/mysql/lib/protocol/sequences/Query");
import { FieldPacket } from "mysql2";

/**
 *
 * @param item
 * @param panel
 * @param context
 */
export function select500(
  item: EleganceTreeItem,
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
): void {
  let columnsSql: string = `SELECT COLUMN_NAME name,COLUMN_KEY FROM information_schema.columns WHERE TABLE_NAME='${item.result.tableName}' and TABLE_SCHEMA='${item.result.schemaName}' ORDER BY ORDINAL_POSITION;`;
  execSelect(
    item.config,
    "mysql",
    columnsSql,
    (
      error: Query.QueryError | null,
      results: Array<any>,
      fields: FieldPacket[]
    ) => {
      if (error) {
        console.error(error.message);
        throw error;
      }
      let columns: Array<string> = [];
      results.forEach((result) => {
        columns.push(result.name);
      });

      let limitValue = 500;
      let sql: string = `select ${columns.join(",")} from ${
        item.result.tableName
      }`;
      execSelect(
        item.config,
        item.result.schemaName,
        `${sql} limit ${limitValue}`,
        (
          error: Query.QueryError | null,
          results: Array<any>,
          fields: FieldPacket[]
        ) => {
          if (error) {
            Logger.error(error.message, error);
            throw error;
          }
          let messageContent = {
            columns: Array<string>(),
            rows: Array<any>(),
            sql: sql,
            limitValue: limitValue,
          };
          if (fields) {
            fields.forEach((field) => {
              messageContent.columns.push(field.name);
            });
          }
          results.forEach((result) => {
            messageContent.rows.push(result);
          });
          fs.readFile(
            path.join(context.extensionPath, "views", "html", "query.html"),
            (err, data) => {
              if (err) {
                Logger.error(err.message, err);
              }
              let htmlContent = data.toString();
              htmlContent = convertImports(
                htmlContent,
                context.extensionPath,
                (file: vscode.Uri) => {
                  return panel.webview.asWebviewUri(file);
                },
                "jquery.slim.min.js",
                "colResizable-1.6.js",
                "popper.min.js",
                "bootstrap.min.js",
                "bootstrap.bundle.min.js",
                "angular.min.js",
                "sql-parser.js",
                "query.js",
                "bootstrap.min.css",
                "query.css"
              );
              panel.webview.html = htmlContent;
            }
          );
          panel.webview.postMessage(new Message(messageContent, true));
        }
      );
    }
  );
}
