import { commands, env, ExtensionContext, Uri, window } from "vscode";
import {
  getChangeLogPopUpEnable,
  getLogConfig,
  getSecurityDisplayed,
} from "../../capability/configurationService";
import { constants, Values } from "../../capability/globalValues";
import { StorageService } from "../../capability/localStorageService.ts";
import { Logger } from "../../capability/logService";
import { initialResultHandlers } from "../../capability/resultHandler";
import { SelectedSchema } from "../../model/storageModel";

/**
 * popup change log notice
 */
function changeLogsPopup() {
  if (getChangeLogPopUpEnable()) {
    window
      .showInformationMessage(
        constants.updateNotice,
        constants.updateNoticeAction
      )
      .then((s) => {
        if (s) {
          env.openExternal(Uri.parse(constants.changeLogUrl));
        }
      });
  }
}

/**
 * initial some global values
 * @param context vscode extension context, get it from entrance of extension
 */
export function initial(context: ExtensionContext) {
  // log level initial there
  Logger.setOutputLevel(getLogConfig());

  // workspace state storage
  StorageService.memento = context.workspaceState;
  let selectedSchema = <SelectedSchema>(
    StorageService.getValue("selectedSchema")
  );
  if (selectedSchema) {
    Values.selectedSchema = <SelectedSchema>selectedSchema;
    Values.barItem.text = `${selectedSchema.config.name}-${selectedSchema.schemaName}`;
    Values.barItem.show();
  }
  Values.context = context;

  // compareTo command context
  commands.executeCommand(
    "setContext",
    "elegance_mysql.compareTo.supportedItem",
    // ["table", "schema"]
    ["table"]
  );

  // initial strategy
  initialResultHandlers();
}

/**
 * run some startup tasks
 */
export function startupTasks() {
  // pop up security notice in default configuration
  let securityText: string = String.raw`Security Attention:
    other extensions can get this configuration.
     if there is any malicious extension,
      it will leak database connection information from settings.json.
      Set elegance.mysql.securityDisplayed=false into settings.json to avoid this message.`;
  if (getSecurityDisplayed()) {
    window.showInformationMessage(securityText);
  }
}

/**
 * notify when finished startup
 */
export function finishStartup() {
  Logger.info("Elegance mysql!");
  var banner: string = String.raw`
        .__                                                 
  ____  |  |    ____    ____ _____     ____    ____   ____  
_/ __ \ |  |  _/ __ \  / ___\\__  \   /    \ _/ ___\_/ __ \ 
\  ___/ |  |__\  ___/ / /_/  >/ __ \_|   |  \\  \___\  ___/ 
 \___  >|____/ \___  >\___  /(____  /|___|  / \___  >\___  >
     \/            \//_____/      \/      \/      \/     \/ 
  `;
  Logger.plain(banner);
  // changeLogsPopup();
}
