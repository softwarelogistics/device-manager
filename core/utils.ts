import { Observable } from "rxjs";
import fetch from 'node-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

export class ActivatedRoute {
    snapshot: any;
};

export class Router {
    navigate(path: any[], params?: any) {

    }
};

export class HttpClient {
    constructor(private storage: NativeStorageService) {

    }

    getAuthHeaders(): any {

    }

    async checkJWTExpire(): Promise<boolean> {
        let jwt = await this.storage.getItemAsync('jwtExpires');
        if (jwt) {
            let date = new Date(jwt);
            if (date < new Date()) {
                console.log('expired, refreshing');
                return await this.renewToken();
            }
        }
        
        return true;
    }

    async renewToken(): Promise<boolean>{
        let refreshToken = await this.storage.getItemAsync('refreshtoken');

        let request = {
            GrantType: 'refreshtoken',
            AppInstanceId: 'ABC123',
            AppId: 'ABC1234',
            DeviceId: 'ABC123',
            ClientType: 'mobileapp',
            Email: 'KEVINW@SLSYS.NET',
            RefreshToken: refreshToken,
        }

        try {
            let fetchResult = await fetch('https://api.nuviot.com/api/v1/auth',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });
            let refreshResult = await fetchResult.json();
                console.log(refreshResult);
            await AsyncStorage.setItem("isLoggedIn", "true");

            await AsyncStorage.setItem("jwt", refreshResult.result.accessToken);
            await AsyncStorage.setItem("refreshtoken", refreshResult.result.refreshToken);
            await AsyncStorage.setItem("refreshtokenExpires", refreshResult.result.refreshTokenExpiresUTC);
            await AsyncStorage.setItem("jwtExpires", refreshResult.result.accessTokenExpiresUTC);
            console.log('refreshed with new JWT');

            let currentUserResult = await this.get<Core.FormResult<Users.AppUser, Users.AppUserView>>('https://api.nuviot.com/api/user');
            console.log(currentUserResult.model);
            await AsyncStorage.setItem("app_user", JSON.stringify(currentUserResult.model));

            return true;
        }
        catch (err: any) {
            console.log('could not get refresh', err);
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
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Promise<T> {

        await this.checkJWTExpire();
        let jwt = await this.storage.getItemAsync("jwt");

        if (!options) {
            options = { method: 'GET' };
        }

        options!.headers = { Authorization: "Bearer " + jwt };
        options!.withCredentials = true;

        try {
            let result = await fetch(url, options);

            if (result.status == 401) {
                console.log('nope')
                throw 'Not Authorized';
            }
            else {

                let json = await result.json();
                return json as T
            }
        }
        catch (e) {
            throw e;
        }
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

export const environment = {
    production: false,
    appId: "1C114B00D8014BD988BF61D74672F9D2",
    deviceId: 'mobileApp',
    appInstanceid: "",
    siteUri: 'https://api.nuviot.com'
    // siteUri: 'https://localhost:5001'
    //siteUri: 'http://dev.nuviot.com'
};

export class CookieService {
    get(name: string): string {
        return "";
    }

    set(name: string, value: string) {

    }
}
