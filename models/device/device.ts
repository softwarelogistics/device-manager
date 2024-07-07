/// <reference path="../core/core.ts" />

namespace Devices {
  export interface DeviceView {
    id: string;
    status: Core.FormField;
    name: Core.FormField;
    deviceId: Core.FormField;
    deviceConfiguration: Core.FormField;
    deviceType: Core.FormField;
    ownerOrganization: Core.FormField;
    location: Core.FormField;
    deviceURI: Core.FormField;
    showDiagnostics: Core.FormField;
    serialNumber: Core.FormField;
    firmwareVersion: Core.FormField;
    isConnected: Core.FormField;
    lastContact: Core.FormField;
    primaryAccessKey: Core.FormField;
    secondaryAccessKey: Core.FormField;
    geoLocation: Core.FormField;
    heading: Core.FormField;
    speed: Core.FormField;
    customStatus: Core.FormField;
    debugMode: Core.FormField;
    propertiesMetaData: Core.FormField;
    properties: Core.FormField;
  }

  export interface DeviceRepoView {
    name: Core.FormField;
    key: Core.FormField;
    icon: Core.FormField;
    description: Core.FormField;
  }

  export interface DeviceSummaryData {
    id: string;
    deviceId: string;
    name: string;
    lastContact: string;
    deviceType: Core.EntityHeader;
    deviceConfiguration: Core.EntityHeader;
    deviceRepository: Core.EntityHeader;
    properties: Core.AttributeValue[];
    states: Core.AttributeValue[];
    attributes: Core.AttributeValue[];
    speed: number;
    heading: number;
    geoLocation: Geolocation;
    status: Core.EntityHeader;
  }

  export interface DeviceRepoSummary extends Core.IKeyNamedModel {
    repositoryType: string;
    id: string;
    isPublic: boolean;
    name: string;
    icon: string;
    key: string;
    description: string;
  }

  export interface DeviceGroupSummary extends Core.IKeyNamedModel {
    id: string;
    isPublic: boolean;
    name: string;
    key: string;
    description: string;
    repoId: string;
    repoName: string;
  }

  export interface DeviceGroup extends Core.IKeyNamedModel {
    id: string;
    isPublic: boolean;
    name: string;
    deviceRepository: Core.EntityHeader;
    key: string;
    description: string;
    devices: DeviceGroupEntry[];
  }

  export interface DeviceGroupView {
    id: string;
    isPublic: boolean;
    name: string;
    key: string;
    description: string;
  }

  export interface DeviceGroupEntry {
    id: string;
    deviceUniqueId: string;
    dateAdded: string;
    addedBy: Core.EntityHeader;
    name: string;
    deviceId: string;
    deviceType: Core.EntityHeader;
    deviceConfiguration: Core.EntityHeader;
  }

  export interface DeviceRepo extends Core.IKeyNamedModel {
    id: string;
    name: string;
    key: string;
    icon: string;
    description: string;
    deviceCapacity: Core.EntityHeader;
    storageCapacity: Core.EntityHeader;
    subscription: Core.EntityHeader;
    repositoryType: Core.EntityHeader;
    isPublic: boolean;
  }

  export interface DeviceUpdate {
    deviceId: string;
    name: string;
    id: string;
    geoLocation: Core.GeoLocation;
    heading: number;
    serialNumber: string;
    lastContact: string;
    status: Core.EntityHeader;
    customStatus: Core.EntityHeader;
    firmwareVersion: string;
    attributes: Core.AttributeValue[];
    states: Core.AttributeValue[];
    properties: Core.AttributeValue[];
  }

  export interface DeviceStatus {
  deviceStatus_New: string;
  deviceStatus_Online: string;
  deviceStatus_TimeedOut: string;
  deviceId: string;
  deviceUniqueId: string;
  timestamp: string;
  lastContact: string;
  lastNotified: string;
  watchdogCheckPoint: string;
  watchdogTimeoutSeconds: number;
  previousStatus: string;
  currentStatus: string;
  details: string;
  silenceAlarm: boolean;
}

  export interface DeviceSummary extends Core.IModel {
    id: string;
    deviceName: string;
    deviceId: string;
    deviceType: string;
    deviceTypeId: string;
    deviceConfiguration: string;
    deviceConfigurationId: string;
    customStatus: Core.EntityHeader;
    deviceRepo: string;
    deviceRepoId: string;
    icon: string;
    geoLocation?: Core.GeoLocation;
    internalSummary: string;
    lastContact: string;
    status: string;
    selected: boolean;
  }

  export interface WatchdogConnectedDevice {
    id: string;
    lastContact: string;
    timeoutSeconds: number;
    overdueSeconds: number;
    expired: string;
    deviceName: string;
    deviceId: string;
    deviceUniqueId: string;
    deviceConfigurationId: string;
    deviceConfiguration: string;
    deviceTypeId: string;
    deviceType: string;
    lastNotified: string;
    watchdogDisabled: boolean;
  }

  export interface DeviceSelectedEventArgs {
    deviceRepo: Core.EntityHeader;
    deviceSummary: DeviceSummary;
  }

  export interface DeviceGroupSelectedEventArgs {
    deviceRepo: DeviceRepoSummary;
    deviceGroupSummary: DeviceGroupSummary;
  }

  export interface DeviceUser {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    device: DeviceDetail;
  }

  export interface DeviceProperty {
    metaData: PropertyMetaData;
    property: Core.AttributeValue;
  }

  export interface PropertyMetaData {
    id: string;
    defaultValue: string;
    fieldType: Core.EntityHeader;
    helpText: string;
    name: string;
    regEx: string;
    key: string;
    label: string;
    stateSet: Core.EntityHeaderEx<PipelineModels.StateSet>;
    unitSet: Core.EntityHeaderEx<Core.UnitSet>;
    isReadOnly: boolean;
    isRequired: boolean;
    isUserConfigurable: boolean;
  }

  export interface DeviceConnectionEvent {
    deviceId: string;
    timeStamp: string;
    firmwareSKU: string;
    firmwareRevision: string;
    rssi: number;
    reconnect: boolean;
  }

  export interface DeviceProperty {
    metaData: PropertyMetaData;
    property: Core.AttributeValue;
  }

  export interface InputCommandParameterValue {
    parameter: Devices.InputCommandParameter;
    value: string;
    isChecked: boolean;
  }

  export interface State {
    key: string;
    name: string;
  }

  export interface StateSet {
    id: string;
    key: string;
    name: string;
    states: State[];
  }

  export interface InputCommandParameter extends Core.IKeyNamedModel {
    name: string;
    key: string;
    parameterLocation: Core.EntityHeader;
    parameterType: Core.EntityHeader;
    stateSet: Core.EntityHeaderEx<StateSet>;
    unitSet: any[];
  }


  export interface InputCommandParameter extends Core.IKeyNamedModel {
    name: string;
    key: string;
    parameterLocation: Core.EntityHeader;
    parameterType: Core.EntityHeader;
    stateSet: Core.EntityHeaderEx<StateSet>;
    unitSet: any[];
  }

  export interface InputCommand extends Core.IKeyNamedModel {
    name: string;
    endpointType: Core.EntityHeader;
    key: string;
    id: string;
    description: string;
    parameters: InputCommandParameter[];
  }

  export interface InputCommandEndPoint {
    endPoint: string;
    inputCommand: InputCommand;
  }

  export interface DeviceTypeSummary {
    id: string;
    name: string;
    key: string;
    description?: string;
    defaultDeviceConfigId?: string;
    defaultDeviceConfigName?: string;
  }

  export interface FirmwareSummary {
    id: string;
    name: string;
  }

  export interface FirmwareDetail {
    id: string;
    name: string;
    deviceType: string;
    firmwareSku: string;
    defaultRevision: Core.EntityHeader;
    description: string;
    revisions: FirmwareRevision[];
  }

  export interface FirmwareView {
    name: Core.FormField;
    deviceType: Core.FormField;
    firmwareSku: Core.FormField;
    defaultRevision: Core.FormField;
    description: Core.FormField;
    revisions: Core.FormField;
  }

  export interface FirmwareRevision {
    id: string;
    versionCode: string;
    timeStamp: string;
    file: string;
    status: Core.EntityHeader;
    notes: string;
  }

  export interface FirmwareRevisionView {
    id: Core.FormField;
    versionCode: Core.FormField;
    timeStamp: Core.FormField;
    file: Core.FormField;
    status: Core.FormField;
    notes: Core.FormField;
  }

  export interface FirmwareDownloadRequest {
    downloadId: string;
    expired: boolean;
    status: string;
    firmwareName: string;
    timestamp: string;
    percentRequested: number;
    error: string;
  }

  export interface DeviceConfigSummary {
    id: string;
    name: string;
    key: string;
  }

  export interface DeviceDetailView {
    name: Core.FormField;
    deviceId: Core.FormField;
    deviceType: Core.FormField;
    icon: Core.FormField;
  }

  export interface MediaItem {
    itemId: string;
    deviceId: string;
    timeStamp: string;
    contentType: string;
    title: string;
    fileName: string;
    length: string;
    key: string;
    id: string;
    name: string;
  }

  export interface DeviceLog {
    dateStamp: string;
    entryType: string;
    source: string;
    entry: string;
  }

  export interface DeviceNote {
    id: string;
    title: string;
    notes: string;
    creationDate: string;
    lastUpdatedDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedBy: Core.EntityHeader;
  }

  export interface DeviceTypeResource {
    id: string;
    key: string;
    name: string;
    fileName: string;
    link: string;
    resourceType: Core.EntityHeader;
    description: string;
    mimeType: string;
    contentSize: number;
    contentSizeDisplay: string;
    isFileUpload: boolean;
  }

  export interface BillOfMaterialItem {
    id: string;
    partNumber: string;
    name: string;
    manufacturer: string;
    description: string;
    assemblyNumber: string;
    cost: number;
    quantity: number;
    link: string;
    resources: DeviceTypeResource[];
  }


  export interface BillOfMaterialItemView {
    partNumber: Core.FormField;
    name: Core.FormField;
    manufacturer: Core.FormField;
    description: Core.FormField;
    assemblyNumber: Core.FormField;
    quantity: Core.FormField;
    link: Core.FormField;
    resources: Core.FormField;
  }

  export interface Parameter {
    parameterLocation_QueryString: string;
    parameterLocation_JSON: string;
    id: string;
    isRequired: boolean;
    name: string;
    key: string;
    maxValue: number | null;
    minValue: number | null;
    defaultValue: any;
    parameterLocation: Core.EntityHeader;
    parameterType: Core.EntityHeader;
    description: string;
    unitSet: Core.EntityHeader;
    stateSet: Core.EntityHeader;
  }

  export interface DeviceType {
    id: string;
    name: string;
    key: string;
    description: string;
    databaseName: string;
    entityType: string;
    manufacturer: string;
    modelNumber: string;
    defaultDeviceConfiguration: Core.EntityHeader;
    billOfMaterial: Core.SectionGrouping<BillOfMaterialItem>[];
    resources: Media.MediaResourceSummary[];
    associatedEquipment: EquipmentSummary[];
    firmware: Core.EntityHeader;
    firmwareRevision: Core.EntityHeader;
    deviceResources: DeviceTypeResource[];
  }

  export interface DeviceTypeView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    databaseName: Core.FormField;
    entityType: Core.FormField;
    manufacturer: Core.FormField;
    modelNumber: Core.FormField;
    defaultDeviceConfiguration: Core.FormField;
    billOfMaterial: Core.FormField;
    resources: Core.FormField;
    associatedEquipment: Core.FormField;
    firmware: Core.FormField;
    firmwareRevision: Core.FormField;
  }

  export interface DeviceTwinDetail {
    timestamp: string;
    details: string;
  }

  export interface DeviceException {
    errorCode: string;
    timestamp: string;
    details: string;
  }

  export interface DeviceError {
    firstSeen: string;
    count: number;
    timestamp: string;
    active: boolean;
    expires: string;
    nextNotification: string;
    deviceErrorCode: string;
    lastDetails: string;
  }

  export interface Sensor {
    id: string;
    key: string;
    name: string;
    icon: string;
    description: string;
    address: string;
    valueType: Core.EntityHeader;
    technology: Core.EntityHeader;
    lastUpdated: string;
    sensorDefinition: Core.EntityHeader;
    sensorType: number;
    portIndexSelection: Core.EntityHeader;
    portIndex: number;
    deviceScaler: number;
    calibration: number;
    zero: number;
    lowThreshold: number;
    highThreshold: number;
    lowValueErrorCode: string;
    highValueErrorCode: string;
    alertsEnabled: boolean;
    state: Core.EntityHeader;
    unitSet: Core.EntityHeader;
    unitsLabel: string;
    value: string;
  }

  export interface SensorView {
    key: Core.FormField;
    name: Core.FormField;
    description: Core.FormField;
    address: Core.FormField;
    valueType: Core.FormField;
    technology: Core.FormField;
    sensorDefinition: Core.FormField;
    sensorType: Core.FormField;
    portIndexSelection: Core.FormField;
    deviceScaler: Core.FormField;
    portIndex: Core.FormField;
    calibration: Core.FormField;
    zero: Core.FormField;
    lowThreshold: Core.FormField;
    highThreshold: Core.FormField;
    lowValueErrorCode: Core.FormField;
    highValueErrorCode: Core.FormField;
    alertsEnabled: Core.FormField;
    state: Core.FormField;
    unitSet: Core.FormField;
    unitsLabel: Core.FormField;
    value: Core.FormField;
  }

  export interface DeviceDetail {
    lastUpdateDate: string;
    databaseName: string;
    entityType: string;
    creationDate: string;
    lastUpdatedDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedBy: Core.EntityHeader;
    deviceRepository: Core.EntityHeader;
    status: Core.EntityHeader;
    id: string;
    name: string;
    icon: string;
    deviceId: string;
    sensorCollection: Sensor[];
    deviceTwinDetails: DeviceTwinDetail[];
    deviceConfiguration: Core.EntityHeader;
    deviceType: Core.EntityHeaderEx<DeviceType>;
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    desiredFirmware?: Core.EntityHeader;
    desiredFirmwareRevision?: Core.EntityHeader;
    actualFirmware?: string;
    actualFirmwareRevision?: string;
    actualFirmwareDate?: string;
    distributionList: Core.EntityHeader;
    location?: Core.EntityHeader;
    ownerUser?: any;
    deviceURI: string;
    deviceLabel: string;
    deviceIdLabel: string;
    deviceNameLabel: string;
    deviceTypeLabel: string;
    showDiagnostics?: any;
    serialNumber: string;
    pin: string;
    pinSecretId: string;
    firmwareVersion?: any;
    iosBLEAddress: string;
    macAddress: string;
    isConnected?: any;
    lastContact?: any;
    ipAddress: string;
    primaryAccessKey: string;
    secondaryAccessKey: string;
    geoLocation?: Core.GeoLocation;
    heading: number;
    speed: number;
    assignedUser: Core.EntityHeader;
    watchdogNotificationUser: Core.EntityHeader;
    customStatus?: any;
    debugMode: boolean;
    propertiesMetaData: PropertyMetaData[];
    propertyBag: any[];
    properties?: Core.AttributeValue[];
    states: any[];
    internalSummary: string;
    attributes: any[];
    messageValues?: any;
    inputCommandEndPoints: any[];
    notes: DeviceNote[];
    errors: DeviceError[];
  }

  export interface DeviceTwinDetails {
    timestamp: string;
    version: number;
    details: string;
  }

  export interface DeviceForNotification {
    deviceId: string;
    name: string;
    id: string;
    geoLocation: Core.GeoLocation;
    hasGeoFix: boolean;
    heading: number;
    serialNumber: string;
    lastContact: string;
    status: Core.EntityHeader;
    customStatus: Core.EntityHeader;
    actualFirmware: string;
    actualFirmwareRevision: string;
    propertyBag: { [key: string]: any; };
    attributes: Core.AttributeValue[];
    states: Core.AttributeValue[];
    properties: Core.AttributeValue[];
    notes: DeviceNote[];
    deviceTwinDetails: DeviceTwinDetails[];
    sensorCollection: Sensor[];
  }

  export enum RepositoryTypes {
    NuvIoT,
    AzureIoTHub,
    Local,
    Dedicated,
    ClusteredMongoDB
  }

  export interface DeviceRepository {
    id: string;
    creationDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedDate: string;
    lastUpdatedBy: Core.EntityHeader;
    name: string;
    description: string;
    notes: Core.AdminNote[];
    isValid: boolean;
    validationErrors: Core.ErrorMessage[]; deviceRepository_Type_NuvIoT: string;
    deviceRepository_Type_Local: string;
    deviceRepository_Type_Dedicated: string;
    deviceRepository_Type_InClusterMongo: string;
    deviceRepository_Type_AzureITHub: string;
    databaseName: string;
    entityType: string;
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    devicesInUse: number;
    deviceMaxDevices: number;
    repositoryType: Core.EntityHeaderEx<RepositoryTypes>;
    deviceStorageSettings: Core.ConnectionSettings;
    deviceStorageSecureSettingsId: string;
    deviceWatchdogStorageSettings: Core.ConnectionSettings;
    deviceWatchdogStorageSecureId: string;
    deviceArchiveStorageSettings: Core.ConnectionSettings;
    deviceArchiveStorageSettingsSecureId: string;
    pEMStorageSettings: Core.ConnectionSettings;
    pEMStorageSettingsSecureId: string;
    key: string;
    subscription: Core.EntityHeader;
    resourceName: string;
    accessKeyName: string;
    accessKey: string;
    secureAccessKeyId: string;
    watchdogNotificationUser: Core.EntityHeader;
    serviceBoard: Core.EntityHeader;
    assignedUser: Core.EntityHeader;
    authKey1: string;
    authKey2: string;
    storageCapacity: Core.EntityHeader;
    deviceCapacity: Core.EntityHeader;
    uri: string;
    instance: Core.EntityHeader;
    incrementingDeviceNumber: number;
    autoGenerateDeviceIds: boolean;
    userOwnedDevicesOnly: boolean;
    secureUserOwnedDevices: boolean;
  }

  export interface DeviceErrorCode {
    id: string;
    name: string;
    description: string;
    key: string;
    triggerOnEachOccurrence: boolean;
    emailSubject: string;
    sendSMS: boolean;
    sendEmail: boolean;
    distroList: Core.EntityHeader;
    serviceTicketTemplate: Core.EntityHeader;
    notificationIntervalQuantity: number | null;
    notificationIntervalTimeSpan: Core.EntityHeader;
    autoexpireTimespanQuantity: number | null;
    autoexpireTimespan: Core.EntityHeader;
  }

  export interface DeviceErrorCodeView {
    name: Core.FormField;
    description: Core.FormField;
    key: Core.FormField;
    triggerOnEachOccurrence: Core.FormField;
    emailSubject: Core.FormField;
    sendSMS: Core.FormField;
    sendEmail: Core.FormField;
    distroList: Core.FormField;
    serviceTicketTemplate: Core.FormField;
    notificationIntervalQuantity: Core.FormField;
    notificationIntervalTimeSpan: Core.FormField;
    autoexpireTimespanQuantity: Core.FormField;
    autoexpireTimespan: Core.FormField;
  }

  export interface DeviceErrorCodeSummary extends Core.SummaryData {
  }


  export interface EquipmentSummary extends Core.SummaryData {

  }

}

