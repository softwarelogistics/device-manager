namespace DeviceConfiguration {

export enum SensorTechnology {
  ADC,
  IO,
  Bluetooth
}

export enum SensorValueType {
  Boolean,
  String,
  Number
}

export enum IOSensorTypes {
  None,
  Input,
  Output,
  PulseCounter,
  DS18B,
  DHT11,
  DHT22
}

export enum ADCSensorTypes {
  None,
  ADC,
  CurentTransformer,
  OnOff
}

export enum SensorPorts {
  Port1,
  Port2,
  Port3,
  Port4,
  Port5,
  Port6,
  Port7,
  Port8
}

export interface SensorDefinition {
  sensorTechnology_ADC: string;
  sensorTechnology_IO: string;
  sensorTechnology_Bluetooth: string;
  sensorValueType_Boolean: string;
  sensorValueType_String: string;
  sensorValueType_Number: string;
  iOSensorTypes_None: string;
  iOSensorTypes_input: string;
  iOSensorTypes_output: string;
  iOSensorTypes_pulsecounter: string;
  iOSensorTypes_ds18b: string;
  iOSensorTypes_dht11: string;
  iOSensorTypes_dht22: string;
  aDCSensorTypes_none: string;
  aDCSensorTypes_adc: string;
  aDCSensorTypes_ct: string;
  iOSensorTypes_None_Idx: string;
  iOSensorTypes_input_Idx: string;
  iOSensorTypes_output_Idx: string;
  iOSensorTypes_pulsecounter_Idx: string;
  iOSensorTypes_ds18b_Idx: string;
  iOSensorTypes_dht11_Idx: string;
  iOSensorTypes_dht22_Idx: string;
  aDCSensorTypes_none_Idx: string;
  aDCSensorTypes_adc_Idx: string;
  aDCSensorTypes_ct_Idx: string;
  aDCSensorTypes_onoff_Idx: string;
  sensorDefinition_Port1: string;
  sensorDefinition_Port2: string;
  sensorDefinition_Port3: string;
  sensorDefinition_Port4: string;
  sensorDefinition_Port5: string;
  sensorDefinition_Port6: string;
  sensorDefinition_Port7: string;
  sensorDefinition_Port8: string;
  id: string;
  technology: Core.EntityHeaderEx<SensorTechnology>;
  valueType: Core.EntityHeaderEx<SensorValueType>;
  key: string;
  name: string;
  description: string;
  iconKey: string;
  qrCode: string;
  unitsLabel: string;
  unitSet: Core.EntityHeaderEx<Core.UnitSet>;
  webLink: string;
  sensorType: Core.EntityHeader;
  hasConfigurableThresholdHighValue: boolean;
  hasConfigurableThresholdLowValue: boolean;
  defaultScaler: number;
  defaultCalibration: number;
  defaultZero: number;
  defaultLowThreshold: number | null;
  defaultHighThreshold: number | null;
  lowValueErrorCode: string;
  highValueErrorCode: string;
  generateErrorWithOn: boolean;
  generateErrorWithOff: boolean;
  onErrorCode: string;
  offErrorCode: string;
  defaultPortIndex: Core.EntityHeaderEx<SensorPorts>;
}

  export interface CustomField {
    id: string;
    name: string;
    label: string;
    isRequired: boolean;
    isReadOnly: boolean;
    minValue: number | null;
    maxValue: number | null;
    fieldType: Core.EntityHeaderEx<Core.ParameterTypes>;
    unitSet: Core.EntityHeaderEx<Core.UnitSet>;
    stateSet: Core.EntityHeaderEx<PipelineModels.StateSet>;
    key: string;
    defaultValue: string;
    regEx: string;
    helpText: string;
    remotePropertyId: number;
    isRemoteProperty: boolean;
    isUserConfigurable: boolean;
    order: number;
  }

  export interface RouteConnection {
    mappings: Core.KeyValuePair<string, any>[];
    id: string;
    name: string;
  }

  export enum TimeSpanIntervals {
  NotApplicable,
  Minutes,
  Hours,
  Days
}

export interface WatchdogExclusion {
  id: string;
  name: string;
  key: string;
  start: number;
  end: number;
  description: string;
}

export interface DeviceErrorCode {
  deviceErrorCode_NotApplicable: string;
  deviceErrorCode_Minutes: string;
  deviceErrorCode_Hours: string;
  deviceErrorCode_Days: string;
  id: string;
  name: string;
  key: string;
  triggerOnEachOccurrence: boolean;
  emailSubject: string;
  sendSMS: boolean;
  sendEmail: boolean;
  description: string;
  distroList: Core.EntityHeader;
  serviceTicketTemplate: Core.EntityHeader;
  notificationIntervalQuantity: number | null;
  notificationIntervalTimeSpan: Core.EntityHeaderEx<TimeSpanIntervals>;
  autoexpireTimespanQuantity: number | null;
  autoexpireTimespan: Core.EntityHeaderEx<TimeSpanIntervals>;
}

  export interface MessageWatchDog {
    id: string;
    name: string;
    key: string;
    timeout: number;
    timeoutInterval: Core.EntityHeaderEx<TimeSpanIntervals>;
    startupBufferMinutes: number;
    description: string;
    deviceMessageDefinition: Core.EntityHeaderEx<Messaging.DeviceMessageDefinition>;
    deviceErrorCode: Core.EntityHeaderEx<DeviceErrorCode>;
    excludeHolidays: boolean;
    weekdayExclusions: WatchdogExclusion[];
    saturdayExclusions: WatchdogExclusion[];
    sundayExclusions: WatchdogExclusion[];
  }

  export interface DeviceCommand {
    id: string;
    name: string;
    key: string;
    icon: string;
    parameters: Devices.Parameter[];
    description: string;
  }

  export interface DeviceConfiguration {
    databaseName: string;
    entityType: string;
    configurationVersion: number;
    customStatusType: Core.EntityHeaderEx<PipelineModels.StateSet>;
    deviceLabel: string;
    deviceIdLabel: string;
    deviceNameLabel: string;
    deviceTypeLabel: string;
    key: string;
    watchdogEnabledDefault: boolean;
    watchdogSeconds: number | null;
    errorCodes: DeviceErrorCode[];
    messageWatchDogs: MessageWatchDog[];
    sensorDefinitions: SensorDefinition[];
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    routes: Route[];
    properties: CustomField[];
    commands: DeviceCommand[];
  }

  export interface DeviceConfigurationView {
    databaseName: Core.FormField;
    entityType: Core.FormField;
    configurationVersion: Core.FormField;
    customStatusType: Core.FormField;
    deviceLabel: Core.FormField;
    deviceIdLabel: Core.FormField;
    deviceNameLabel: Core.FormField;
    deviceTypeLabel: Core.FormField;
    key: Core.FormField;
    watchdogEnabledDefault: Core.FormField;
    watchdogSeconds: Core.FormField;
    errorCodes: Core.FormField;
    messageWatchDogs: Core.FormField;
    sensorDefinitions: Core.FormField;
    isPublic: Core.FormField;
    ownerOrganization: Core.FormField;
    ownerUser: Core.FormField;
    routes: Core.FormField;
    properties: Core.FormField;
    commands: Core.FormField;
  }

  export interface RouteModuleConfig {
    id: string;
    name: string;
    key: string;
    incomingMappings: Core.KeyValuePair<string, any>[];
    primaryOutput: RouteConnection;
    secondaryOutputs: RouteConnection[];
    moduleType: Core.EntityHeaderEx<PipelineModules.PipelineModuleType>;
    diagramLocation: Core.DiagramLocation;
    module: Core.EntityHeaderEx<PipelineModules.PipelineModuleConfiguration>;
  }

  export interface OutputCommandMapping {
    outgoingDeviceMessage: Core.EntityHeaderEx<Messaging.DeviceMessageDefinition>;
    fieldMappings: Core.KeyValuePair<string, string>[];
  }


  export interface Route {
    id: string;
    name: string;
    key: string;
    isDefault: boolean;
    messageDefinition: Core.EntityHeaderEx<Messaging.DeviceMessageDefinition>;
    pipelineModules: RouteModuleConfig[];
    notes: string;
    creationDate: string;
    lastUpdatedDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedBy: Core.EntityHeader;
  }


}
