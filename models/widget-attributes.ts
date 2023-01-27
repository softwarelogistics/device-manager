import { DataStreamField } from './reporting';

export class WidgetAttributes {
    populationStrategy?: Core.EntityHeader;
    repoId?: string;
    repoName?: string;
}

export class WidgetDevicesAttributes extends WidgetAttributes {
  deviceGroupName?: string;
  deviceGroupId?: string;
}

export class WidgetDeviceViewAttributes extends WidgetAttributes {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
  isSystemUserView: boolean;
}

export class WidgetDeviceExplorerAttributes extends WidgetAttributes {
    repoId?: string;
    repoName?: string;
}

export class DataSteamField {
    id: string;
    key: string;
    label: string;
    fieldType: string;
}

export class WidgetChartTypes {
    static chartTypes: Array<Core.EntityHeader> = [
        { 'id': 'line', text: 'Line Chart' },
        { 'id': 'bar', text: 'Bar Chart' },
        { 'id': 'pie', text: 'Pie Chart' }
    ];
}

export class WidgetChartAttributes extends WidgetAttributes {
  static chartPeriod: Array<Core.EntityHeader> = [
      { 'id': 'minutes', text: 'Minutes' },
      { 'id': 'hours', text: 'Hours' },
      { 'id': 'days', text: 'Days' },
      { 'id': 'weeks', text: 'Weeks' },
      { 'id': 'months', text: 'Months' }
    ];

    static chartGroupBy: Array<Core.EntityHeader> = [
      { 'id': 'none', text: 'None' },
      { 'id': 'month', text: 'Hour' },
      { 'id': 'day', text: 'Day' },
      { 'id': 'week', text: 'Week' },
      { 'id': 'month', text: 'Month' }
    ];

    timestampFieldName: string;

    showTimePicker: boolean;
    chartType?: Core.EntityHeader;
    initialGroupBy?: Core.EntityHeader;
    initialChartDateRangePeriod?: Core.EntityHeader;

    initialChartDateRange: number;

    showGroupByPicker: boolean;

    dataStreamId?: string;
    dataStreamName?: string;
    dataStreamType?: string;
    dataStreamTypeKey?: string;
    dataStreamFields?: DataStreamField[];
    deviceUniqueId?: string;
    deviceId?: string;
    deviceName?: string;
  }


  export class WidgetGaugeDataSources {
    static dataSources: Array<Core.EntityHeader> = [
        { 'id': 'adcSensor', text: 'ADC Sensor' },
        { 'id': 'ioSensor', text: 'IO Sensor' }
    ];
  }

export class WidgetGaugeTypes {
    static gaugeTypes: Array<Core.EntityHeader> = [
        { 'id': 'gauge', text: 'Gauge' },
        { 'id': 'linearGauge', text: 'Linear Gauge' }
    ];
  }

export class WidgetGaugeAttributes extends WidgetAttributes {
    gaugeType?: Core.EntityHeader;
    dataSource?: Core.EntityHeader;
    sensorIndex: number;
    title: string;
    units: string;
    min: number;
    lowWarning: number;
    lowOK: number;
    highOK: number;
    highWarning: number;
    max: number;
    deviceUniqueId?: string;
    deviceId?: string;
    deviceName?: string;
  }

export class WidgetDeviceActionAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceAttributesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceErrorsAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDevicePropertiesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDevicePhotoAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceReportsAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDateRangePickerAttributes extends WidgetAttributes {
  dateOnly?: boolean;
  tiemOnly?: boolean;
  allowFuture?: boolean;
  maxDays?: number;
}

export class WidgetDeviceDataAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
  dataStreamId?: string;
  dataStreamName?: string;
  dataStreamType?: string;
  dataStreamTypeKey?: string;
  dataStreamFields?: DataStreamField[];
}

export class WidgetDeviceLogsAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceConnectionLogAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceNotesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetFSLiteTicketAttributes extends WidgetAttributes {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceBomAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceResourcesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetDeviceTicketAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetPropertiesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetAttributesAttributes extends WidgetAttributes  {
  deviceUniqueId?: string;
  deviceId?: string;
  deviceName?: string;
}

export class WidgetGeoAttributes extends WidgetAttributes {
    centerLatitude?: number;
    centerLongitude?: number;
    deviceUniqueId?: string;
    deviceId?: string;
    deviceName?: string;
    deviceGroupName?: string;
    deviceGroupId?: string;
}
