import AsyncStorage from "@react-native-async-storage/async-storage";
import AppServices from "../services/app-services";


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

    if (request.AppInstanceId && !AsyncStorage.getItem('appInstanceId')) {
      console.log('appInstanceId set', request.AppInstanceId);
      await AsyncStorage.setItem("appInstanceId", request.AppInstanceId);
    }

    const postOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    };

    let appServices = new AppServices();

    let authUrl = `${appServices.getApiUrl()}/api/v1/auth`;
    console.log('attempt to login at:' + authUrl);
    console.log('Request Body');
    console.log(postOptions);

    const fetched = await fetch(authUrl, postOptions)
      .catch(err => {
        console.log(err);
        response.error = err;
        response.navigationTarget = undefined;
      });

    const fetchedJson = await fetched?.json();
    // console.log('auth result', fetchedJson);

    response.isSuccess = fetchedJson?.successful ?? false;

    if (fetchedJson?.successful) {
      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem("jwt", fetchedJson.result.accessToken);
      await AsyncStorage.setItem("refreshtoken", fetchedJson.result.refreshToken);
      await AsyncStorage.setItem("refreshtokenExpires", fetchedJson.result.refreshTokenExpiresUTC);
      await AsyncStorage.setItem("jwtExpires", fetchedJson.result.accessTokenExpiresUTC);
    }
    else if (fetchedJson.errors) {
      response.errorMessage = fetchedJson.errors[0].message;
      response.navigationTarget = undefined;
    }

    return response;
  },

  passwordLogin: async (email: string, password: string, path?: string | undefined): Promise<NuvIotAuthResponse> => {
    let request = {
      GrantType: 'password',
      AppInstanceId: 'ABC123',
      AppId: 'ABC1234',
      DeviceId: 'ABC123',
      ClientType: 'mobileapp',
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