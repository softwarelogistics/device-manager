/// <reference path="./core/core.ts" />

export class AuthRequest {
    GrantType = 'password';
    AppId = 'dashboard';
    DeviceId = 'browser';
    AppInstanceId = 'browser';
    ClientType = 'browser';
    Email: string;
    UserName: string;
    Password: string;
    RefreshToken?: '';
    OrgId?: '';
    OrgName?: '';
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresUTC: string;
  refreshToken: string;
  refreshTokenExpiresUTC: string;
  appInstanceId: string;
  isLockedOut: boolean;
  user: Core.EntityHeader;
  org: Core.EntityHeader;
  roles: Core.EntityHeader[];
}
