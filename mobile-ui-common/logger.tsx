import { CommonSettings, environment } from "../settings";
import AuthenticationHelper from "../utils/authenticationHelper";

export class LogWriter {
    private static _logger: any;
    private static _version: string;
    private static _appInstanceId: string;

    constructor() {
    }

    /*
    private static getLogger() {
        if(LogWriter._logger == null) {
            LogWriter._version = JSON.stringify(require("../package.json").version).replace('"', '').replace('"', '');
            
            LogWriter._logger = require('logzio-nodejs').createLogger({
            token: 'lDClQlWGOpREionETTlFfJsqswNbNysd',
            protocol: 'https',
            host: 'https://listener.logz.io:8071',
            port: '8071',
            type: 'nodejs'
        });
     }
     
     return LogWriter._logger;
    }*/
    

    static async log(area: string, message: string = '-', level: string = 'INFO', details: string | undefined = undefined) {
        /*LogWriter._appInstanceId = await AuthenticationHelper.getAppInstanceId();

        let obj = {
            message: `${area}: ${message}`,
            area: area,
            nuviotEnvironment: CommonSettings.environment,
            nuviotVersion: LogWriter._version,
            nuvotApp: environment.appName,            
            clientType: 'react-native',            
            appInstance: LogWriter._appInstanceId,
            details: ''
        }

        if(details)
            obj.details = details;

        const logger = LogWriter.getLogger();
        logger.log(obj);
            
        if(details)
            logger.log(details);

        */

        console.log(`[${level}] ${area}: ${message}`);        
    }

    static async warn(area: string, message: string, details: string | undefined = undefined) {
        await LogWriter.log(area, message, 'WARN', details);    
    }
}

export const showError = (title: string, error: string) => {
    alert(error);
}
