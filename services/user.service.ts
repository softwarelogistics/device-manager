/// <reference path="../models/user.ts" />
/// <reference path="../models/auth.ts" />

import { environment } from '../core/utils';

import { ActivatedRoute, Router } from '../core/utils';
import { ReplaySubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '../core/utils';
import { ErrorReporterService } from './error-reporter.service';
import { NuviotClientService } from './nuviot-client.service';
import { NativeStorageService } from '../core/utils';
import { ThemePalette, ThemePaletteService } from '../styles.palette.theme';

export class UserService {
  paramOptions: any;
  queryParams: any;

  constructor(private http: HttpClient,
    private clientService: NuviotClientService,    
    private errorReporter: ErrorReporterService,
    private nativeStorage: NativeStorageService,
  ) {


  }

  async getIsLoggedIn(): Promise<boolean> {
    return await (this.nativeStorage.getItemAsync("is_logged_in")) == "login_true";
  }

  async setIsLoggedIn(value: boolean): Promise<boolean> {
    this._isLoggedIn$.next(value);
    return await this.nativeStorage.setItemAsync("is_logged_in", value ? "login_true" : "login_false");
  }

  private _users: Core.ListResponse<Users.AppUserSummary> | undefined;
  private _org: Users.Org | undefined;

  protected _isLoggedIn$ = new ReplaySubject<boolean>(0);
  protected _org$ = new ReplaySubject<Users.Org | undefined>(undefined);
  protected _user$ = new ReplaySubject<Users.AppUser | undefined>(undefined);
  protected _users$ = new ReplaySubject<Core.ListResponse<Users.AppUserSummary | undefined>>(undefined);

  async loadCurrentUser(): Promise<Users.AppUser> {
    const response = await this.clientService.request<Core.FormResult<Users.AppUser, Users.AppUserView>>('/api/user');
    if(response.successful) {
      if (response?.model?.firstName) {
        let userInitials = `${response?.model?.firstName.substring(0, 1)}`;
        if (response?.model?.lastName?.length > 1) {
          userInitials = `${userInitials}${response?.model?.lastName.substring(0, 1)}`;
        }
        response.model.initials = userInitials;
      }
      await this.setUser(response.model);
      await this.setIsLoggedIn(true);
      return response.model;
    }
    else {
      console.error(response.errors[0].message);
    }
  }

  async loadCurrentUserIfNecessary(): Promise<Users.AppUser | undefined> {
    if (!await this.getUser() && !await this.getIsLoggedIn()) {
      return await this.loadCurrentUser();
    }
  }

  async updateCoreInfo(coreUserInfo: Users.CoreUserInfo) {
    await this.clientService.update('/api/user/coreinfo', coreUserInfo);
  }

  hasParams() {
    return Object.keys(this.queryParams).length > 0;
  }

  public async logout(): Promise<boolean> {
    await this.http.get(`${HttpClient.getWebUrl()}/api/account/logout`);
    this.setUser(undefined);
    return await this.setIsLoggedIn(false);
  }

  public getOrgsForCurrentUser(): Promise<Core.ListResponse<Users.OrgUser>> {
    return this.clientService.getListResponse<Users.OrgUser>(`/api/user/orgs`);
  }

  public async acceptTermsAndConditions(): Promise<Core.InvokeResultEx<Users.AppUser>> {
    let result = await this.clientService.request<Core.InvokeResultEx<Users.AppUser>>('/api/user/accepttc')
    if (result.successful) {
      this.setUser(result.result);
    }

    return result;
  }

  public async refreshToken(): Promise<boolean> {
    return this.clientService.renewToken();
  }

  public changeOrganization(orgId: string): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      this.clientService.get(`/api/org/${orgId}/change`)
        .then(result => {
          if (result.successful) {
            this.loadCurrentUser()
              .then(res => resolve(true))
              .catch(err => reject(err));
          } else {
            console.error(result.errors[0].message);
            reject(result.errors[0].message);
          }
        })
        .catch(err => {
          if (reject) {
            reject(false);
          }
        });
    });

    return promise;
  }

  public loadUser(id: string): Promise<Core.FormResult<Users.AppUser, Users.AppUserView>> {
    return this.clientService.getFormResponse<Users.AppUser, Users.AppUserView>(`/api/user/${id}`);
  }

  public updateUser(user: Users.AppUser): Promise<Core.InvokeResult> {
    return this.clientService.update(`/api/user`, user);
  }

  public loadUsers(filter: Core.ListFilter): Promise<Core.ListResponse<Users.AppUserSummary>> {
    const promise = new Promise<Core.ListResponse<Users.AppUserSummary>>((resolve, reject) => {

      this.clientService.getListResponse<Users.AppUserSummary>(`/api/users`, filter)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public loadActiveUsers(filter: Core.ListFilter): Promise<Core.ListResponse<Users.AppUserSummary>> {
    const promise = new Promise<Core.ListResponse<Users.AppUserSummary>>((resolve, reject) => {

      this.clientService.getListResponse<Users.AppUserSummary>(`/api/users/active`, filter)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public getDistributionLists(filter: Core.ListFilter): Promise<Core.ListResponse<Orgs.DistroListSummary>> {
    const promise = new Promise<Core.ListResponse<Orgs.DistroListSummary>>((resolve, reject) => {

      this.clientService.getListResponse<Orgs.DistroListSummary>(`/api/distros`, filter)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }


  public async auth(email: string, password: string): Promise<Core.InvokeResultEx<Auth.Response>> {
    let request: Auth.Request = {
      GrantType: 'password',
      AppInstanceId: environment.appInstanceid,
      AppId: environment.appId,
      DeviceId: environment.deviceId,
      ClientType: environment.clientType,
      Email: email,
      Password: password,
      UserName: email
    }

    let result = await this.clientService.post<Auth.Request, Auth.Response>('/api/v1/auth', request);
    if (result.successful) {
      await this.nativeStorage.setItemAsync('access-token', result.result.accessToken);

    }

    return result;
  }

  public async login(email: string, password: string, rememberMe: boolean): Promise<Users.AppUser> {
    let body = {
      email: email,
      password: password,
      rememberMe: rememberMe.toString()
    }

    try {
      let result = await this.clientService.post<any, Core.InvokeResultEx<string>>('/api/v1/login', body)
      if (result.successful) {
        return await this.loadCurrentUser();
      }
      this.errorReporter.addErrors(result.errors);
      throw result.errors[0].message;
    }
    catch (err: any) {
      this.errorReporter.addErrors(err.statusText);
      throw err.statusText;
    }
  }

  validateDeviceUser(user: Devices.DeviceUser): Core.ErrorMessage[] {
    const errs: Core.ErrorMessage[] = [];

    if (!user.firstName) {
      errs.push({ message: 'First Name is a required field.' });
    }

    if (!user.lastName) {
      errs.push({ message: 'Last Name is a required field.' });
    }

    if (!user.email) {
      errs.push({ message: 'Email is a required field.' });
    } else {
      const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

      if ((user.email.length <= 5 || !EMAIL_REGEXP.test(user.email))) {
        errs.push({ message: 'Invalid Email Address.' });
      }
    }

    if (!user.phoneNumber) {
      errs.push({ message: 'Phone Number is a required field.' });
    } else {
      const PHONE_NUMBER_REGEXP = /^\d{10}$/i;

      if ((user.phoneNumber.length !== 10 || !PHONE_NUMBER_REGEXP.test(user.phoneNumber))) {
        errs.push({ message: 'Please enter your phone number without and spaces, dashes, spaces.' });
      }
    }

    if (!user.password) {
      errs.push({ message: 'Password is a required field.' });
    } else {
      const PASSWORD_REGEXP = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d#&$@!+\-*]{8,}$$/i;

      if ((user.password.length <= 5 || !PASSWORD_REGEXP.test(user.password))) {
        // tslint:disable-next-line:max-line-length
        errs.push({ message: 'It must be at least 6 characters and include at least one lowercase letter, one uppercase letter, and one number and may contain the characters #,&,$,\@,!,+,-' });
      }
    }

    if (user.password !== user.confirmPassword) {
      errs.push({ message: 'Password and confirm password must match.' });
    }

    return errs;
  }

  onLoggedIn(): Observable<boolean> {
    return this._isLoggedIn$.asObservable();
  }

  onUsers(): Observable<Core.ListResponse<Users.AppUserSummary | undefined>> {
    return this._users$.asObservable();
  }

  onUser(): Observable<Users.AppUser | undefined> {
    return this._user$.asObservable();
  }

  onOrg(): Observable<Users.Org | undefined> {
    return this._org$.asObservable();
  }

  getUsers(): Core.ListResponse<Users.AppUserSummary> | undefined {
    return this._users;
  }

  async getOrg(): Promise<Users.Org | undefined> {
    let org = await this.nativeStorage.getItemAsync("app_user_org");
    if (org) {
      return JSON.parse(org);
    }

    return undefined;
  }

  async getUser(): Promise<Users.AppUser | undefined> {
    const theme = await this.nativeStorage.getItemAsync('colorTheme');
    let user = await this.nativeStorage.getItemAsync("app_user");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.currentOrganization?.text) {
        const orgNameParts: string[] = parsedUser.currentOrganization.text.split(' ');
        parsedUser.currentOrganizationInitials = orgNameParts[0].substring(0, 1);
        if (orgNameParts.length > 1) {
          parsedUser.currentOrganizationInitials = `${parsedUser.currentOrganizationInitials}${orgNameParts[orgNameParts.length - 1].substring(0, 1)}`;
        }
      }
      parsedUser.themePalette = ThemePaletteService.getThemePalette(theme || 'light');
      return parsedUser;
    }

    return undefined;
  }

  async setUser(user: Users.AppUser | undefined): Promise<boolean> {
    if (user) {      
      await this.nativeStorage.setItemAsync("app_user", JSON.stringify(user));
      this._user$.next(user);
      if(user.currentOrganization)
        await this.setOrg({ id: user.currentOrganization.id, name: user.currentOrganization.text });
    } else {
      await this.nativeStorage.setItemAsync('colorTheme', 'light');
      await this.nativeStorage.removeItemAsync("app_user");
      await this.setOrg(undefined);
      this._user$.next(undefined);
    }

    return true;
  }

  sendEmailConfirmCode() : Promise<Core.InvokeResult> {
    return this.clientService.request('/api/verify/email/confirmationcode/send');
  }

  async getThemeName(): Promise<string> {
    return await this.nativeStorage.getItemAsync('colorTheme') ?? 'light';
  }

  async getThemePalette(): Promise<ThemePalette> {
    let theme = await this.getThemeName();
    console.log(theme);
    return ThemePaletteService.getThemePalette(theme);
  }

  addMediaResourceForUser(userId: string, mediaResourceEH: { id: string; text: string; key: string; }) {
    this.clientService.post(`/api/user/${userId}/mediaresource`, mediaResourceEH);
  }

  async showWelcomeOnLogin() {
    this.clientService.request('/api/users/welcome/show/true');
  }

  async hideWelcomeOnLogin() {
    this.clientService.request('/api/users/welcome/show/false');
  }

  async setOrg(org: Users.Org | undefined): Promise<boolean> {
    if (org) {
      await this.nativeStorage.setItemAsync("app_user_org", JSON.stringify(org));
      this._org$.next(org);
    } else {
      this._org$.next(undefined);
      await this.nativeStorage.removeItemAsync("app_user_org");
    }

    return true;
  }
}
