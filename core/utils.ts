import { Observable } from "rxjs";
import { CommonSettings, environment } from '../settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NuvIoTEventEmitter } from "../utils/NuvIoTEventEmitter";
import AuthenticationHelper from "../utils/authenticationHelper";
import { LogWriter } from "../mobile-ui-common/logger";

export class ActivatedRoute {
    snapshot: any;
};

export class Router {
    navigate(path: any[], params?: any) {

    }
};

export class HttpClient {
    public static logoutSubscription: NuvIoTEventEmitter = new NuvIoTEventEmitter();

    constructor(
        private storage: NativeStorageService,
    ) {

    }

    static getIsDevEnv() {
        return CommonSettings.environment == "development";
    }

    static getApiUrl() {
        const API_URL = this.getIsDevEnv() ? "https://dev-api.nuviot.com" : "https://api.nuviot.com";
        return API_URL;
    }

    static getWebUrl() {
        const API_URL = this.getIsDevEnv() ? "https://dev.nuviot.com" : "https://www.nuviot.com";
        return API_URL;
    }


    getAuthHeaders(): any {

    }

    async checkJWTExpire(): Promise<boolean> {
        let jwt = await this.storage.getItemAsync('jwtExpires');
        if (jwt) {
            let date = new Date(jwt);
            let now = new Date();
            if (date < now) {
                console.log(`[HttpClient__checkJWTExpire], Expired: ${date} - ${now}`);
                return await this.renewToken();
            }
        }

        return true;
    }

    async renewToken(): Promise<boolean> {
        let refreshToken = await this.storage.getItemAsync('refreshtoken');
        let userJSON = await AsyncStorage.getItem('app_user');
        if(!userJSON) {
            console.error('[HttpClient__renewToken] - Could not load current user, thus could not renew from refresh token');
            return false;
        }
    
        let user = JSON.parse(userJSON);
        let appInstanceId = await AuthenticationHelper.getAppInstanceId();

        let request = {
            GrantType: 'refreshtoken',
            AppInstanceId: appInstanceId,
            AppId: environment.appId,
            DeviceId: environment.deviceId,
            ClientType: environment.clientType,
            Email: user.userName,
            RefreshToken: refreshToken,
        }

        try {
            let fetchResult = await fetch(`${HttpClient.getApiUrl()}/api/v1/auth`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });
            let refreshResult = await fetchResult.json();

            if (refreshResult.successful === true) {
                await AsyncStorage.setItem("isLoggedIn", "true");

                await AsyncStorage.setItem("jwt", refreshResult.result.accessToken);
                await AsyncStorage.setItem("refreshtoken", refreshResult.result.refreshToken);
                await AsyncStorage.setItem("refreshtokenExpires", refreshResult.result.refreshTokenExpiresUTC);
                await AsyncStorage.setItem("jwtExpires", refreshResult.result.accessTokenExpiresUTC);
                await LogWriter.log('[HttpClient__renewToken]', 'Refreshed with new JWT', 'INFO');

                let currentUserResult = await this.get<Core.FormResult<Users.AppUser, Users.AppUserView>>(`${HttpClient.getApiUrl()}/api/user`);
                console.log(currentUserResult!.model);
                await AsyncStorage.setItem("app_user", JSON.stringify(currentUserResult!.model));
                return true;
            }
            else {
                await LogWriter.log('[HttpClient__renewToken]', 'ERROR: Could not refresh token', 'ERROR', refreshResult.errorMessage);
                HttpClient.logoutSubscription?.emit('logout', 'could not refresh token');
                return false;
            }

        }
        catch (err: any) {
            await LogWriter.log('[HttpClient__renewToken]', 'ERROR: Could not refresh token', 'ERROR', err);

            HttpClient.logoutSubscription?.emit('logout', 'could not refresh token');
            
            return false;
        };
    }

    async get<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        method: 'GET',
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: false;
        responseType?: 'json';
        withCredentials?: true;
    }): Promise<T> {

        if (await this.checkJWTExpire()) {
            let jwt = await this.storage.getItemAsync("jwt");

            if (!options) {
                options = { method: 'GET' };
            }

            options!.headers = { Authorization: "Bearer " + jwt };
            options!.withCredentials = true;

            let result = await fetch(url, options);

            if (result.status == 401) {
                console.error('failed: Not Authorized', url);
                alert('Sorry, you have been logged out.');
                throw new Error('could not renew token');
            }
            else {

                let json = await result.json();
                return json as T
            }
        }

        throw new Error('could not renew token');
    };

    async put<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };

        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Promise<T> {

        await this.checkJWTExpire();
        let jwt = await this.storage.getItemAsync("jwt");
        var result = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + jwt
            }
        });

        console.log('put call result: ' + result.status);

        var json = await result.json();
        return json as T;
    }

    delete<T>(url: string): Promise<T> {
        return null;
    }

    async post<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };

        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Promise<T> {

        await this.checkJWTExpire();
        let jwt = await this.storage.getItemAsync("jwt");
        var result = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + jwt
            }
        });

        console.log(result.status);

        var json = await result.json();
        return json as T;
    }
}

export class NativeStorageService {
    public async getItemAsync(key: string): Promise<string | null> {
        return await AsyncStorage.getItem(key)
    }

    public async setItemAsync(key: string, value: string): Promise<boolean> {
        await AsyncStorage.setItem(key, value);
        return true;
    }

    public async removeItemAsync(key: string): Promise<boolean> {
        return true;
    }
}

export class HttpHeaders {
    set(key: string, value: string): HttpHeaders {
        return this;
    };
    append(key: string, value: string) {
        return this;
    }

}

export class HttpParams {
    set(key: string, value: string): HttpParams {
        return this;
    }
}

export class CookieService {
    get(name: string): string {
        return "";
    }

    set(name: string, value: string) {

    }
}