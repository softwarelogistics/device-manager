import AsyncStorage from "@react-native-async-storage/async-storage";
import { HttpClient } from "../core/utils";
import { environment } from "../settings";

interface NuvIotAuthResponse {
  isSuccess: boolean,
  navigationTarget: string | undefined,
  errorMessage: string | undefined,
  error: any
}

const AuthenticationHelper = {
  login: async (request: any): Promise<NuvIotAuthResponse> => {
    const response: NuvIotAuthResponse = {
      isSuccess: false,
      navigationTarget: undefined,
      errorMessage: undefined,
      error: undefined
    }

    if (request.path) {
      response.navigationTarget = request.path.replace("--/", '');
    } else {
      response.navigationTarget = 'homePage';
    }

    const postOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    };

    let authUrl = `${HttpClient.getApiUrl()}/api/v1/auth`;
    console.log(`[AuthenticationHelper__login] - URL: ${authUrl}`);

    try
    {
      const fetched = await fetch(authUrl, postOptions)
        .catch(err => {
          console.log(err);
          response.error = err;
          response.navigationTarget = undefined;
        });

      const fetchedJson = await fetched?.json();

      response.isSuccess = fetchedJson?.successful ?? false;

      if (fetchedJson?.successful) {

        console.log('[AuthenticationHelper__login] - success', fetchedJson.result.appUser.id, fetchedJson.result.appUser.email, fetchedJson.result.refreshTokenExpiresUTC, fetchedJson.result.accessTokenExpiresUTC);        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("jwt", fetchedJson.result.accessToken);
        await AsyncStorage.setItem("refreshtoken", fetchedJson.result.refreshToken);
        await AsyncStorage.setItem("refreshtokenExpires", fetchedJson.result.refreshTokenExpiresUTC);
        await AsyncStorage.setItem("jwtExpires", fetchedJson.result.accessTokenExpiresUTC);
      }
      else if (fetchedJson.errors) {
        console.log('[AuthenticationHelper__login] - Failed: ' + fetchedJson.errors[0].message);

        response.errorMessage = fetchedJson.errors[0].message;
        response.navigationTarget = undefined;
      }

      return response;
    }
    catch (err) { 
      console.log('[AuthenticationHelper__login] - Failed: ' + err);
      response.error = err;
      response.navigationTarget = undefined;
      return response;
    }
  },

  getAppInstanceId: async (): Promise<string> => {
    let appInstanceId = await AsyncStorage.getItem('appInstanceId')
    if(appInstanceId == null || appInstanceId == '') {
      appInstanceId = AuthenticationHelper.newUuid();
      await AsyncStorage.setItem('appInstanceId', appInstanceId);
      console.log('[AuthenticationHelper__getAppInstanceId] - AppInstanceId not found. Created new one.', appInstanceId)
    }
    else
      console.log('[AuthenticationHelper__getAppInstanceId] - AppInstanceId found.', appInstanceId)
   
    environment.appInstanceid = appInstanceId;

    return appInstanceId;
  },

  passwordLogin: async (email: string, password: string, path?: string | undefined): Promise<NuvIotAuthResponse> => {
    let appInstanceId = await AuthenticationHelper.getAppInstanceId();

    let request = {
      GrantType: 'password',
      AppInstanceId: appInstanceId,
      AppId: environment.appId,
      DeviceId: environment.deviceId,
      ClientType: environment.clientType,
      Email: email,
      Password: password,
      UserName: email,
      path:path
    }    

    return await AuthenticationHelper.login(request);
  },

  newUuid: (): string => {
    // NOTE: THIS IS A POOR IMPLEMENTATION FOR TRUE UNIQUENESS!
    let value = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return value;
  }

}

export default AuthenticationHelper;