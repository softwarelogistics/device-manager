import { HttpClient, HttpHeaders } from '../core/utils';
import { ErrorReporterService } from './error-reporter.service';
import { NetworkCallStatusService } from './network-call-status-service';
import { CommonSettings } from '../settings';


export class NuviotClientService {
  constructor(private http: HttpClient,
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

  async getListResponse<TData>(path: string, filter: Core.ListFilter | undefined = undefined): Promise<Core.ListResponse<TData | undefined>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    let url = `${this.getApiUrl()}/${path}`;
    console.log('getListResponse=>' + url);

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

    NetworkCallStatusService.beginCall();

    try {
      let response = await this.http.get(url, { headers: headers })
      NetworkCallStatusService.endCall();
      return response as Core.ListResponse<TData>;
    }
    catch (e: any) {
      NetworkCallStatusService.endCall();

      return {
        errors: [{ message: e }],
        model: undefined,
        successful: false
      }

    }

    /*
      console.log(url);
      
      this.http.get<Core.ListResponse<TData>>(url, { headers: headers })
        .then((response) => {
          console.log('in response from list');
          if (response.successful) {
            return response;
          } else {
            this.errorReporter.addErrors(response.errors!);
            return null;
          }
        }, (err) => {
          console.log('handling error');
          this.errorReporter.addMessage(err.message);
          
        }).catch((err) => {          
          this.errorReporter.addMessage(err.message);
          return null;
        })
        .finally(() => {
          NetworkCallStatusService.endCall();
        });*/
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

    console.log('request for invoke' + path);

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

  request<TData>(path: string): Promise<TData> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    NetworkCallStatusService.beginCall();
    const promise = new Promise<TData>((resolve, reject) => {
      let url = `${this.getApiUrl()}/${path}`;
      console.log(url);
      let fullPath = url;
      this.http.get<TData>(fullPath)
        .then((response) => {
          NetworkCallStatusService.endCall();
          resolve(response);
        }).catch(
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


  get(path: string): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    NetworkCallStatusService.beginCall();
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
          NetworkCallStatusService.endCall();
          if (reject) {
            reject(err);
          }
        });
    });

    return promise;
  }



  getFormResponse<TModel, TView>(path: string): Promise<Core.FormResult<TModel, TView>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.FormResult<TModel, TView>>((resolve, reject) => {
      this.http.get<Core.FormResult<TModel, TView>>(`${this.getApiUrl()}/${path}`)
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
            let result: Core.FormResult<TModel, TView> = {
              resultId: '-1',
              successful: false,
              model: null as TModel,
              view: null as TView,
              title: 'Error',
              errors: [{ message: err.message ?? err }],
              warnings: [],
              help: '',
              formFields: []
            };
            resolve(result);
            NetworkCallStatusService.endCall();
            this.errorReporter.addMessage(err.message);

            //throw err.message ?? err;
          });
    });

    return promise;
  }

  insert<TModel>(path: string, model: TModel, reportError: boolean = true): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    NetworkCallStatusService.beginCall();

    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.post<Core.InvokeResult>(`${this.getApiUrl()}/${path}`, model)
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
            console.log('adding error...why?')
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

    return await this.http.put(`${this.getApiUrl()}/${path}`, model);
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
