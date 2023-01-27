/// <reference path="./core/core.ts" />

export class DataStreamField {
    name: string;
    key: string;
    fieldName: string;
    fieldType: Core.EntityHeader;
}

export class DataStreamSummary {
    id: string;
    key: string;
    name: string;
    streamType: string;
    streamTypeKey: string;
    timestampFieldName: string;
    deviceIdFieldName: string;
}

export class DataStreamView {
    id: Core.FormField;
    name: Core.FormField;
    key: Core.FormField;
}

export class ReportSummary {
    id: string;
    name: string;
    reportType: string;
    key: string;
}

export class ReportParameterValueKeyValuePair {
    key: string;
    value: string;
}

export class ReportParameterValue {
    parameterId: string;
    parameterKey: string;
    parameterType: Core.EntityHeader;
    values: ReportParameterValueKeyValuePair[];
}

export class ReportParameter {
    id: string;
    name: string;
    label: string;
    key: string;
    isRequired: boolean;
    allowMultipleValues: boolean;
    help: string;
    notes: string;
    options: Core.EntityHeader[];
    parameterType: Core.EntityHeader;
    stateSet: Core.EntityHeader;
}

/***
 * @description used as a holder to pass both a report parameter and the value
 * that should be used on the report when it is executed.
 */
export class ReportParameterPair {
    parameter: ReportParameter;
    value: ReportParameterValue;
}

export class Report {
    id: string;
    name: string;
    key: string;
    description: string;
    reportType: Core.EntityHeader;
    revisions: ReportRevision[];
    parameters: ReportParameter[];
    defaultRevision: Core.EntityHeader;
}

export class ReportView {
    id: Core.FormField;
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    reportType: Core.FormField;
    revisions: Core.FormField;
    parameters: Core.FormField;
    defaultRevision: Core.FormField;
}

export class ScheduledReportSummary {
    id: string;
    name: string;
    key: string;
    isPublic: boolean;
    description: string;
}

export class ScheduledReportView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    cron: Core.FormField;
    scheduledReportNotes: Core.FormField;
    distroList: Core.FormField;
    report: Core.FormField;
    reportRevision: Core.FormField;
}

export class ReportExecutionRequest {
    requestId: string;
    notes: string;
    parameters: ReportParameterValue[];
    distorList?: Core.EntityHeader;
}

export class ScheduledReport {
    id: string;
    name: string;
    key: string;
    description: string;
    cron: string;
    scheduledReportNotes: string;
    distroList: Core.EntityHeader;
    report: Core.EntityHeader;
    reportRevision: Core.EntityHeader;
    parameterValues: ReportParameterValue[];
}

export class ReportRevision {
    id: string;
    key: string;
    versionCode: string;
    status: Core.EntityHeader;
    notes: string;
}

export class DataStream {
    id?: string;
    name: string;
    key?: string;
    streamType: Core.EntityHeader;
    fields?: DataStreamField[];
}

export class DataStreamResult {
    timestamp: string;
    fields: any;
}

export class GeneratedReport {
    generatedReportId: string;
    timestamp: string;
    runtimeMS: number;
    report: Core.EntityHeader;
    device: Core.EntityHeader;
    deviceGroup: Core.EntityHeader;
    scheduledJob: Core.EntityHeader;
    distorList: Core.EntityHeader;
    organization: Core.EntityHeader;
    user: Core.EntityHeader;
    reportURI: string;
    notes: string;
    reportSummary: string;
    reportTitle: string;
    contentType: string;
}

export class DeviceGeneratedReport {
    deviceGeneratedReportId: string;
    fileName: string;
    contentType: string;
    report: Core.EntityHeader;
    device: Core.EntityHeader;
    organization: Core.EntityHeader;
    scheduledReportName: string;
    reportURI: string;
    reportTitle: string;
    reportDate: string;
    notes: string;
    reportSummary: string;
}

export class JobOutput {
    jobId: string;
    jobTypeId: string;
    jobName: string;
    error: string;
    executionTimmeSeconds: number;
    artifactId: string;
    artifactType: string;
    artifactUrl: string;
    success: boolean;
    notes: string;
    reportSummary: string;
}
