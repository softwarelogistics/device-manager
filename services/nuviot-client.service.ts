import { environment } from '../core/utils';
import { HttpClient, HttpHeaders } from '../core/utils';
import { ErrorReporterService } from './error-reporter.service';
import { NetworkCallStatusService } from './network-call-status-service';


export class NuviotClientService {
  constructor(private http: HttpClient,
    private networkCallService: NetworkCallStatusService,
    private errorReporter: ErrorReporterService) { }

  getListResponse<TData>(path: string, filter: Core.ListFilter | undefined =undefined): Promise<Core.ListResponse<TData>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

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

    this.networkCallService.beginCall();

    let url = `${environment.siteUri}/${path}`;
   
    const promise = new Promise<Core.ListResponse<TData>>((resolve, reject) => {
      this.http.get<Core.ListResponse<TData>>(url, { headers: headers })
        .then((response) => {
          this.networkCallService.endCall();
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
            this.networkCallService.endCall();
            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
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

    const uri = `${environment.siteUri}/${path}`;
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

    this.networkCallService.beginCall();

    const promise = new Promise<Core.InvokeResultEx<TData>>((resolve, reject) => {
      this.http.get<Core.InvokeResultEx<TData>>(`${environment.siteUri}/${path}`)
        .then((response) => {
          this.networkCallService.endCall();
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
            this.networkCallService.endCall();
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
    this.networkCallService.beginCall();
    const promise = new Promise<TData>((resolve, reject) => {
      let fullPath = `${environment.siteUri}/${path}`;
      this.http.get<TData>(fullPath)
        .then((response) => {
          this.networkCallService.endCall();
          resolve(response);
        },
          (err) => {
            this.networkCallService.endCall();
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
    this.networkCallService.beginCall();
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.get<Core.InvokeResult>(`${environment.siteUri}/${path}`)
        .then((response) => {
          this.networkCallService.endCall();
          if (!response.successful) {
            this.errorReporter.addMessage(response.errors[0].message);
          }
          else {
            resolve(response);
          }
        })
        .catch(err => {
          this.networkCallService.endCall();
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

    this.networkCallService.beginCall();

    const promise = new Promise<Core.FormResult<TModel, TView>>((resolve, reject) => {
      this.http.get<Core.FormResult<TModel, TView>>(`${environment.siteUri}/${path}`)
        .then((response) => {
          this.networkCallService.endCall();
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
            let result : Core.FormResult<TModel, TView> =  {
              resultId:'-1',
              successful:false,
              model: null as TModel,
              view: null as TView,
              title: 'Error',
              errors: [{message: err.message ?? err}],
              warnings: [],
              help:'',
              formFields:[]              
            };
            resolve(result);
            this.networkCallService.endCall();
            this.errorReporter.addMessage(err.message);

            //throw err.message ?? err;
          });
    });

    return promise;
  }

  insert<TModel>(path: string, model: TModel): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    this.networkCallService.beginCall();

    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.post<Core.InvokeResult>(`${environment.siteUri}/${path}`, model)
        .then((response) => {
          this.networkCallService.endCall();
          if (!response.successful) {
            this.errorReporter.addErrors(response.errors);
          }
          resolve(response);          
        },
          (err) => {
            this.networkCallService.endCall();
            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }

  post<TModel, TResponse>(path: string, model: TModel): Promise<Core.InvokeResultEx<TResponse>> {
    return this.postWithResponse(path, model);
  }

  async postWithResponse<TModel, TResponse>(path: string, model: TModel): Promise<Core.InvokeResultEx<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    this.networkCallService.beginCall();

    return await this.http.post(`${environment.siteUri}/${path}`, model);
  }

  postForListResponse<TModel, TResponse>(path: string, model: TModel): Promise<Core.ListResponse<TResponse>> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    this.networkCallService.beginCall();

    const promise = new Promise<Core.ListResponse<TResponse>>((resolve, reject) => {
      this.http.post<Core.ListResponse<TResponse>>(`${environment.siteUri}/${path}`, model)
        .then((response) => {
          this.networkCallService.endCall();
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
            this.networkCallService.endCall();
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

    this.networkCallService.beginCall();

    return await this.http.put(`${environment.siteUri}/${path}`, model);
  }

  update<TModel>(path: string, model: TModel): Promise<Core.InvokeResult> {
    return this.updateWithResponse(path, model);
  }

  delete<TModel>(path: string): Promise<Core.InvokeResult> {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    this.networkCallService.beginCall();

    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.http.delete<Core.InvokeResult>(`${environment.siteUri}/${path}`)
        .then((response) => {
          this.networkCallService.endCall();

          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            reject(response.errors[0].message);
          }
        },
          (err) => {
            this.networkCallService.endCall();

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

    this.networkCallService.beginCall();

    const promise = new Promise<Core.InvokeResultEx<TResponse>>((resolve, reject) => {
      this.http.delete<Core.InvokeResultEx<TResponse>>(`${environment.siteUri}/${path}`)
        .then((response) => {
          this.networkCallService.endCall();

          if (response.successful) {
            resolve(response);
          } else {
            this.errorReporter.addErrors(response.errors);
            reject(response.errors[0].message);
          }
        },
          (err) => {
            this.networkCallService.endCall();

            this.errorReporter.addMessage(err.message);
            if (reject) {
              reject(err.message);
            }
          });
    });

    return promise;
  }
}
