
import { NuviotClientService } from './nuviot-client.service';

import { DataStream, DataStreamView, DataStreamSummary, GeneratedReport, ReportSummary, Report,
        ReportView, ScheduledReport, ScheduledReportView, ScheduledReportSummary, ReportExecutionRequest, DeviceGeneratedReport } from '../models/reporting';


export class ReportingService {

  constructor(private client: NuviotClientService) {
  }

  public getReports(): Promise<Core.ListResponse<ReportSummary>> {
    return this.client.getListResponse<ReportSummary>(`api/reports`);
  }

  public getReport(id: string): Promise<Report> {
    const promise = new Promise<Report>((resolve, reject) => {
      this.client.getFormResponse<Report, ReportView>(`/api/report/${id}`)
        .then(result => {
          resolve(result.model);
        });
    });

    return promise;
  }

  public getScheduledReport(id: string): Promise<Core.FormResult<ScheduledReport, ScheduledReportView>> {
    const promise = new Promise<Core.FormResult<ScheduledReport, ScheduledReportView>>((resolve, reject) => {
      this.client.getFormResponse<ScheduledReport, ScheduledReportView>(`/api/report/scheduled/${id}`)
        .then(result => {
          resolve(result);
        });
    });

    return promise;
  }

  public queueForExecution(reportId: string, request: ReportExecutionRequest): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
      this.client.insert(`/api/report/${reportId}/run`, request)
        .then(resp => {
          const ticketResponse = resp as Core.InvokeResultEx<string>;
          resolve(ticketResponse.result);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  public deleteGeneratedReport(reportId: string, genertedReportId: string): Promise<Core.InvokeResult> {
  return this.client.delete(`/report/${reportId}/${genertedReportId}`);
  }

  public getScheduledReports(): Promise<Core.ListResponse<ScheduledReportSummary>> {
    return this.client.getListResponse<ScheduledReportSummary>(`/api/reports/scheduled`);
  }

  public deleteSchedueledReport(id: string): Promise<Core.InvokeResult> {
    return this.client.delete(`/api/report/scheduled/${id}`);
  }

  public getScheduledReportsForReport(id: string): Promise<Core.ListResponse<ScheduledReportSummary>> {
    return this.client.getListResponse<ScheduledReportSummary>(`/api/reports/scheduled/${id}`);
  }

  public getGeneratedReports(reportId: string): Promise<Core.ListResponse<GeneratedReport>> {
    return this.client.getListResponse<GeneratedReport>(`/report/${reportId}/generated`);
  }

  public getDeviceGeneratedReports(deviceId: string, continuationToken: string): Promise<Core.ListResponse<DeviceGeneratedReport>> {
    return this.client.getListResponse<DeviceGeneratedReport>(`/report/device/${deviceId}/generated`, { pageSize: 50, nextRowKey: continuationToken });
  }

  public getDataStreams(): Promise<Core.ListResponse<DataStreamSummary>> {
    return this.client.getListResponse<DataStreamSummary>(`api/datastreams`);
  }

  public getDataStream(id: string): Promise<DataStream> {
    const promise = new Promise<DataStream>((resolve, reject) => {
      this.client.getFormResponse<DataStream, DataStreamView>(`api/datastream/${id}`)
        .then(result => {
          resolve(result.model);
        });
    });

    return promise;
  }

  public getStreamData(dataStreamId: string, deviceId: string, filter: Core.ListFilter):
  Promise<Core.ListResponse<any>> {
    const promise = new Promise<Core.ListResponse<any>>((resolve, reject) => {
      const uri = `/api/datastream/${dataStreamId}/data/${deviceId}`;
      this.client.getListResponse<any>(uri, filter)
        .then(response => {
          resolve(response);
        })
        .catch(err => reject(err));
    });
    return promise;
  }
}
