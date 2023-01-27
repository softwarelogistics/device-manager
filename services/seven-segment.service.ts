
import { ReplaySubject, Observable } from 'rxjs';
import { NuviotClientService } from './nuviot-client.service';
import { DeviceMessageDefinitionSummary, DeviceMessageDefinition, DeviceMessageDefinitionView, SevenSegementParseResult } from '../models/seven-seg.models';
import { ErrorReporterService } from './error-reporter.service';


export class SevenSegmentService {

  deviceMessageTypes: DeviceMessageDefinitionSummary[];
  deviceMessageType: DeviceMessageDefinition;

  private deviceMessageTypes$ = new ReplaySubject<DeviceMessageDefinitionSummary[]>();
  private deviceMessageType$ = new ReplaySubject<DeviceMessageDefinition>();

  constructor(private client: NuviotClientService,
    private errorReporter: ErrorReporterService) {
  }

  getSevenSegementMessages(): Promise<Core.ListResponse<DeviceMessageDefinitionSummary>> {
    const promise = new Promise<Core.ListResponse<DeviceMessageDefinitionSummary>>((resolve, reject) => {
      this.client.getListResponse<DeviceMessageDefinitionSummary>('/api/devicemessagetypes/sevenseg')
        .then(res => {
          resolve(res);
          this.deviceMessageTypes = res.model;
        })
        .catch(err => this.errorReporter.addError(err));
    });

    return promise;
  }

  getSevenSegementMessage(id: string): Promise<Core.FormResult<DeviceMessageDefinition, DeviceMessageDefinitionView>> {
    const promise = new Promise<Core.FormResult<DeviceMessageDefinition, DeviceMessageDefinitionView>>((resolve, reject) => {
      this.client.getFormResponse<DeviceMessageDefinition, DeviceMessageDefinitionView>(`/api/devicemessagetype/${id}`)
        .then(res => {
          if (res.successful) {
            resolve(res);
            this.deviceMessageType = res.model;
          } else {
            this.errorReporter.addErrors(res.errors);
          }
        })
        .catch(err => this.errorReporter.addError(err));
    });

    return promise;
  }

  testSevenSegementMessage(message: DeviceMessageDefinition): Promise<SevenSegementParseResult[]> {
    const promise = new Promise<SevenSegementParseResult[]>((resolve, reject) => {
      this.client.post<DeviceMessageDefinition, SevenSegementParseResult[]>('/api/devicemessagetype/sevensegement/test', message)
        .then(res => {
          if (res.successful) {
            console.log(res);
            resolve(res.result);
          }
        })
        .catch(err => this.errorReporter.addError(err));
    });

    return promise;
  }

  addSevenSegementMessage(message: DeviceMessageDefinition): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.client.insert<DeviceMessageDefinition>('/api/devicemessagetype', message)
        .then(res => {
          if (res.successful) {
            resolve(res);
          } else {
            this.errorReporter.addErrors(res.errors);
          }
        })
        .catch(err => this.errorReporter.addError(err));
    });

    return promise;
  }

  createSevenSegementMessage(): Promise<DeviceMessageDefinition> {
    const promise = new Promise<DeviceMessageDefinition>((resolve, reject) => {
      this.client.request<Core.FormResult<DeviceMessageDefinition, DeviceMessageDefinitionView>>('/api/devicemessagetype/factory')
        .then(res => {
          if (res.successful) {
            resolve(res.model);
          } else {
            this.errorReporter.addErrors(res.errors);
          }
        })
        .catch(err => this.errorReporter.addError(err));
    });

    return promise;
  }

  updateSevenSegementMessage(message: DeviceMessageDefinition): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.client.update<DeviceMessageDefinition>('/api/devicemessagetype', message)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });

    return promise;
  }

  onCurrentMessageDefinition(): Observable<DeviceMessageDefinition> {
    return this.deviceMessageType$.asObservable();
  }

  onMessageDefinitions(): Observable<DeviceMessageDefinitionSummary[]> {
    return this.deviceMessageTypes$.asObservable();
  }
}
