import { CookieService, HttpClient, HttpHeaders } from '../core/utils';
import { ErrorReporterService } from './error-reporter.service';
import { NetworkCallStatusService } from './network-call-status-service';
import { CommonSettings } from '../settings';
import { NavService } from './NavService';


export class NuviotClientService {
  constructor(private http: HttpClient,
    private navService: NavService,
    private errorReporter: ErrorReporterService) { }



  getIsDevEnv() {
    return CommonSettings.environment == "development";
  }

  getApiUrl() {
    const API_URL = this.getIsDevEnv() ? "https://dev-api.nuviot.com" : "https://api.nuviot.com";
    return API_URL;
  }

  getWebUrl() {
    const API_URL = this.getIsDevEnv() ? "https://dev.nuviot.com" : "https://www.nuviot.com";
    return API_URL;
  }

  redirectToLogin() {
    this.navService.redirectToLogin();
  }

  nextHandler<TResponse>(resolve: any, response: any, showWaitCursor: boolean = true, reportError: boolean = true): void {
    if (showWaitCursor) NetworkCallStatusService.endCall();

    if (response.successful === false) {
      console.log('[NuvIoTClientService__nextHandler] - Error', console.log(response.errors));
      if (reportError)
        this.errorReporter.addErrors(response.errors);
    }

    resolve(response);
  }

  errorHandler<TResponse>(resolve: any, err: any, showWaitCursor: boolean = true, reportError: boolean = true): void {
    if (showWaitCursor) NetworkCallStatusService.endCall();
    if (err.status == 401) {
      this.redirectToLogin();
    }
    else if (reportError) {
      this.errorReporter.addMessage(err.message);
    }

    resolve({ successful: false, warnings: [], errors: [{ message: err.message }] });
  }

  async getListResponse<TData>(path: string, filter: Core.ListFilter | undefined = undefined): Promise<Core.ListResponse<TData>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    let url = `${this.getApiUrl()}/${path}`;

    let headers = new HttpHeaders();
    if (filter) {
      if (filter.start) {
        headers = headers.append('x-filter-startdate', filter.start);
      }
      if (filter.end) {
        headers = headers.append('x-filter-enddate', filter.end);
      }
      if (filter.groupBy) {
        headers = headers.append('x-group-by', filter.groupBy);
      }
      if (filter.groupBySize) {
        headers = headers.append('x-group-by-size', filter.groupBySize.toString());
      }
      if (filter.nextPartitionKey) {
        headers = headers.append('x-nextpartitionkey', filter.nextPartitionKey);
      }
      if (filter.nextRowKey) {
        headers = headers.append('x-nextrowkey', filter.nextRowKey);
      }
      if (filter.pageSize) {
        headers = headers.append('x-pagesize', filter.pageSize.toString());
      }
      if (filter.pageIndex) {
        headers = headers.append('x-pageindex', filter.pageIndex.toString());
      }
    }

    NetworkCallStatusService.beginCall("Please Wait", url);

    try {
      let response = await this.http.get(url, { headers: headers, method: 'GET' })
      NetworkCallStatusService.endCall();
      var listResponse = response as Core.ListResponse<TData>;
      if (listResponse.successful) {
        return listResponse;
      }
      else {
        this.errorReporter.addErrors(listResponse.errors);
        return listResponse;
      }
    }
    catch (e: any) {
      NetworkCallStatusService.endCall();

      return {
        errors: [{ message: e }],
        model: undefined,
        successful: false
      }

    }
  }

  getMarkDownContent(path: string): Promise<string> {
    const basePath = 'https://raw.githubusercontent.com/LagoVista/docs/master/guides';
    const promise = new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === 4 &&
          this.status === 200) {
          resolve(xhr.responseText);
        }
      };

      xhr.open('GET', `${basePath}${path}`, true);
      xhr.send();
    });

    return promise;
  }

  getBlobResponse(path: string, fileName: string) {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    const uri = `${this.getApiUrl()}/${path}`;
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.setAttribute('href', uri);
    downloadLink.setAttribute('target', '_blank');
    downloadLink.setAttribute('download', fileName);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  getDateFilterHeaders(start: string, end: string): any[] {
    return [
      { 'x-filter-startdate': start },
      { 'x-filter-enddate': end }
    ];
  }

  requestForInvokeResultEx<TData>(path: string): Promise<Core.InvokeResultEx<TData>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.InvokeResultEx<TData>>((resolve, reject) => {
      this.http.get<Core.InvokeResultEx<TData>>(`${this.getApiUrl()}/${path}`)
        .then((response) => {
          NetworkCallStatusService.endCall();
          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            if (reject) {
              reject(response.errors[0].message);
            }
          }
        },
          (err) => {
            NetworkCallStatusService.endCall();
            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }

  request<TData>(path: string, showWaitCursor: boolean = true): Promise<TData> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    const promise = new Promise<TData>((resolve, reject) => {
      let url = `${this.getApiUrl()}/${path}`;
      if (showWaitCursor) NetworkCallStatusService.beginCall('Please Wait', url);
      this.http.get<TData>(url)
        .then((response) => { this.nextHandler<TData>(resolve, response, showWaitCursor);})
        .catch((err) => { this.errorHandler<TData>(resolve, err, showWaitCursor); });
      });

    return promise;
  }

  responseHandler<TData>(resolve: any, showWaitCursor: boolean = true, reportError: boolean = true): any {

  }

  get(path: string): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    NetworkCallStatusService.beginCall('Please Wait', path);
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.get<Core.InvokeResult>(`${this.getApiUrl()}/${path}`)
        .then((response) => {

          NetworkCallStatusService.endCall();
          if (!response.successful) {
            this.errorReporter.addMessage(response.errors[0].message);
          }
          else {
            resolve(response);
          }
        })
        .catch(err => {
          console.error(err);
          NetworkCallStatusService.endCall();
          if (reject) {
            reject(err);
          }
        });
    });

    return promise;
  }

  getFormResponse<TModel, TView>(path: string, showWaitCursor: boolean = true): Promise<Core.FormResult<TModel, TView> | undefined> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    let url = `${this.getApiUrl()}/${path}`;

    NetworkCallStatusService.beginCall('Please wait',url);

    const promise = new Promise<Core.FormResult<TModel, TView> | undefined>((resolve, reject) => {
      this.http.get<Core.FormResult<TModel, TView>>(url)
        .then((response) => {
          NetworkCallStatusService.endCall();
          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            resolve(response);
          }
        },
          (err) => {
            console.error(err);
            NetworkCallStatusService.endCall();
            this.errorReporter.addMessage(err.message);

            resolve(undefined);

            //throw err.message ?? err;
          });
    });

    return promise;
  }

  insert<TModel>(path: string, model: TModel, reportError: boolean = true): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    let url = `${this.getApiUrl()}/${path}`;

    NetworkCallStatusService.beginCall('Please wait',url);

    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.post<Core.InvokeResult>(url, model)
        .then((response) => {
          NetworkCallStatusService.endCall();
          if (!response.successful && reportError) {
            this.errorReporter.addErrors(response.errors);
          }
          resolve(response);
        },
          (err) => {
            NetworkCallStatusService.endCall();

            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }

  post<TModel, TResponse>(path: string, model: TModel, reportError: boolean = true): Promise<Core.InvokeResultEx<TResponse>> {
    return this.postWithResponse(path, model);
  }

  async postWithResponse<TModel, TResponse>(path: string, model: TModel, reportError: boolean = true): Promise<Core.InvokeResultEx<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.InvokeResultEx<TResponse>>((resolve, reject) => {
      this.http.post<Core.InvokeResultEx<TResponse>>(`${this.getApiUrl()}/${path}`, model)
        .then((response) => {
          NetworkCallStatusService.endCall();
          if (!response.successful && reportError) {
            this.errorReporter.addErrors(response.errors);
          }
          resolve(response);
        },
          (err) => {
            NetworkCallStatusService.endCall();

            if (reportError) {
              this.errorReporter.addMessage(err.message);
            }
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;

  }

  postForListResponse<TModel, TResponse>(path: string, model: TModel): Promise<Core.ListResponse<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.ListResponse<TResponse>>((resolve, reject) => {
      this.http.post<Core.ListResponse<TResponse>>(`${this.getApiUrl()}/${path}`, model)
        .then((response) => {
          NetworkCallStatusService.endCall();
          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors!);
            if (reject) {
              reject(response.errors![0].message);
            }
          }
        },
          (err) => {
            NetworkCallStatusService.endCall();
            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }

  async updateWithResponse<TModel, TResponse>(path: string, model: TModel): Promise<Core.InvokeResultEx<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    let result = await this.http.put(`${this.getApiUrl()}/${path}`, model);

    NetworkCallStatusService.endCall();

    return result as Core.InvokeResultEx<TResponse>;
  }

  update<TModel>(path: string, model: TModel): Promise<Core.InvokeResult> {
    return this.updateWithResponse(path, model);
  }

  delete<TModel>(path: string): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.delete<Core.InvokeResult>(`${this.getApiUrl()}/${path}`)
        .then((response) => {
          NetworkCallStatusService.endCall();

          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            reject(response.errors[0].message);
          }
        },
          (err) => {
            NetworkCallStatusService.endCall();

            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }

  renewToken(): Promise<boolean> {
    return this.http.renewToken();
  }

  deleteWithResponse<TResponse>(path: string): Promise<Core.InvokeResultEx<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.InvokeResultEx<TResponse>>((resolve, reject) => {
      this.http.delete<Core.InvokeResultEx<TResponse>>(`${this.getApiUrl()}/${path}`)
        .then((response) => {
          NetworkCallStatusService.endCall();

          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            reject(response.errors[0].message);
          }
        },
          (err) => {
            NetworkCallStatusService.endCall();

            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }
}
