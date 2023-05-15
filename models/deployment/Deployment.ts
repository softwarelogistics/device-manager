namespace Deployment {
    export enum HostTypes {
      Free,
      Community,
      Shared,
      SharedHighPerformance,
      Dedicated,
      Clustered,
      MCP,
      BackupMCP,
      RemoteMCP,
      RemoteBackupMCP,
      Notification,
      Development
    }
  
    export enum HostStatus {
      Offline,
      Deploying,
      ConfiguringDNS,
      DeployingContainer,
      StartingContainer,
      Running,
      Destroying,
      RestartingHost,
      UpdatingRuntime,
      WaitingForServerToStart,
      RestartingContainer,
      FailedDeployment,
      HostHealthCheckFailed
    }
  
    export enum HostCapacityStatus {
      UnderUtilized,
      Ok,
      At75Percent,
      At90Percent,
      AtCapacity,
      OverCapacity,
      FailureImminent
    }
  
    export interface IoTModelBase {
      id: string;
      creationDate: string;
      createdBy: Core.EntityHeader;
      lastUpdatedDate: string;
      lastUpdatedBy: Core.EntityHeader;
      name: string;
      description: string;
      notes: Core.AdminNote[];
      isValid: boolean;
      validationErrors: Core.ErrorMessage[];
    }
  
    export interface TableStorageEntity {
      rowKey: string;
      partitionKey: string;
    }
  
    export interface DeploymentHostStatus extends TableStorageEntity {
      timeStamp: string;
      oldState: string;
      newState: string;
      version: string;
      details: string;
      transitionById: string;
      transitionByName: string;
    }
  
    export interface DeploymentHost extends IoTModelBase {
      key: string;
      hostType: Core.EntityHeaderEx<HostTypes>;
      size: Core.EntityHeader;
      status: Core.EntityHeader;
      statusTimeStamp: string;
      capacityStatus: Core.EntityHeaderEx<HostCapacityStatus>;
      dedicatedInstance: Core.EntityHeader;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      containerRepository: Core.EntityHeader;
      containerTag: Core.EntityHeader;
      dnsHostName: string;
      internalServiceName: string;
      ipv4Address: string;
      dNSEntryId: string;
      cloudProvider: Core.EntityHeader;
      cloudProviders: Core.EntityHeader[];
      adminAPIUri: string;
      monitoringURI: string;
      monitoringProvider: Core.EntityHeader;
      upSince: string;
      computeResourceId: string;
      hasSSLCert: boolean;
      sslExpires: string;
      lastPing: string;
      averageCPU: string;
      averageMemory: string;
      subscription: Core.EntityHeader;
      statusDetails: string;
      hostAccessKey1: string;
      hostAccessKey2: string;
      debugMode: boolean;
      isArchived: boolean;
      showSolutionDetailsSite: boolean;
      deployedInstances: SharedInstanceSummary[];
    }
  
    export interface SharedInstanceSummary {
      instance: Core.EntityHeader;
      ownerOrganization: Core.EntityHeader;
      status: Core.EntityHeaderEx<DeploymentInstanceStates>;
      dnsHostName: string;
    }
  
    export interface DeploymentHostView {
      key: Core.FormField;
      name: Core.FormField;
      hostType: Core.FormField;
      size: Core.FormField;
      cloudProvider: Core.FormField;
      dnsHostName: Core.FormField;
      internalServiceName: Core.FormField;
      ipv4Address: Core.FormField;
      containerRepository: Core.FormField;
      containerTag: Core.FormField;
      status: Core.FormField;
      subscription: Core.FormField;
      capacityStatus: Core.FormField;
      adminAPIUri: Core.FormField;
      computeResourceId: Core.FormField;
      computeResourceUri: Core.FormField;
      averageCPU: Core.FormField;
      averageMemory: Core.FormField;
    }
  
    export interface DeploymentHostSummary {
      id: string;
      isPublic: boolean;
      name: string;
      key: string;
      description: string;
      hostType: string;
      status: string;
      capacityStatus: string;
    }
  
    export interface Solution extends IoTModelBase {
      databaseName: string;
      entityType: string;
      environment: Core.EntityHeader;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      defaultListener: Core.EntityHeader;
      listeners: Core.EntityHeaderEx<PipelineModules.ListenerConfiguration>[];
      planner: Core.EntityHeaderEx<PipelineModules.PlannerConfiguration>;
      settings: DeviceConfiguration.CustomField[];
      key: string;
      deviceConfigurations: Core.EntityHeaderEx<DeviceConfiguration.DeviceConfiguration>[];
      monitoringEndpoint: string;
    }
  
    export enum DeploymentInstanceStates {
      Offline,
      HostRestarting,
      HostFailedHealthCheck,
      DeployingRuntime,
      UpdatingRuntime,
      UpdatingSolution,
      CreatingRuntime,
      StartingRuntime,
      Initializing,
      Starting,
      Running,
      Pausing,
      Paused,
      Stopping,
      Stopped,
      FatalError,
      FailedToInitialize,
      FailedToStart
    }
  
    export enum CacheTypes {
      LocalInMemory,
      Redis,
      NuvIoT
    }
  
    export interface ApplicationCache extends PipelineModules.PipelineModuleConfiguration {
      moduleType: string;
      cacheType_Redis: string;
      cacheType_LocalInMemory: string;
      cacheType_NuvIot: string;
      cacheType: Core.EntityHeaderEx<CacheTypes>;
      uri: string;
      password: string;
      passwordSecretId: string;
      defaultValues: ApplicationCacheValue[];
    }
  
    export enum CacheValueDataTypes {
      String,
      Number
    }
  
    export interface ApplicationCacheValue {
      valueType_String: string;
      valueType_Number: string;
      creationDate: string;
      lastUpdateDate: string;
      name: string;
      key: string;
      value: string;
      valueType: Core.EntityHeaderEx<CacheValueDataTypes>;
      description: string;
    }
  
    export interface ApplicationCacheSummary extends Core.SummaryData {
      cacheTypeId: string;
      cacheType: string;
    }
  
    export enum DeploymentTypes {
      Cloud,
      Managed,
      OnPremise
    }
  
    export enum DeploymentConfigurations {
      DockerSwarm,
      Kubernetes,
      SingleInstance,
      UWP
    }
  
    export enum NuvIoTEditions {
      App,
      Container,
      Cluster
    }
  
    export enum WorkingStorage {
      Local,
      Cloud
    }
  
    export enum QueueTypes {
      InMemory,
      Kafka,
      ServiceBus,
      RabbitMQ
    }
  
    export enum LogStorage {
      Local,
      Cloud
    }
  
    export enum StorageType {
      Local,
      Cloud
    }
  
  
    export interface DeploymentInstance extends IoTModelBase {
      key: string;
      isDeployed: boolean;
      status: Core.EntityHeader;
      timeZone: Core.EntityHeader;
      statusTimeStamp: string;
      statusDetails: string;
      primaryHost: Core.EntityHeaderEx<DeploymentHost>;
      dataStreams: Core.EntityHeaderEx<PipelineModules.DataStream>[];
      applicationCaches: Core.EntityHeaderEx<ApplicationCache>[];
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      integrations: Core.EntityHeaderEx<Integration>[];
      upSince: string;
      subscription: Core.EntityHeader;
      size: Core.EntityHeader;
      deviceRepository: Core.EntityHeaderEx<Devices.DeviceRepository>;
      settingsValues: Core.AttributeValue[];
      propertyBag: { [key: string]: any; };
      version: Core.EntityHeader;
      containerRepository: Core.EntityHeader;
      healthCheckEnabled: boolean;
      containerTag: Core.EntityHeader;
      sharedAccessKey1: string;
      sharedAccessKeySecureId1: string;
      sharedAccessKey2: string;
      sharedAccessKeySecureId2: string;
      lastPing: string;
      dnsHostName: string;
      inputCommandSSL: boolean;
      inputCommandPort: number;
      cloudProvider: Core.EntityHeader;
      primaryCacheType: Core.EntityHeaderEx<CacheTypes>;
      primaryCache: Core.EntityHeaderEx<ApplicationCache>;
      deploymentType: Core.EntityHeaderEx<DeploymentTypes>;
      deploymentConfiguration: Core.EntityHeaderEx<DeploymentConfigurations>;
      nuvIoTEdition: Core.EntityHeaderEx<NuvIoTEditions>;
      workingStorage: Core.EntityHeaderEx<WorkingStorage>;
      queueType: Core.EntityHeaderEx<QueueTypes>;
      deploymentErrors: { [key: string]: string; };
      queueConnection: Core.EntityHeaderEx<Core.ConnectionSettings>;
      logStorage: Core.EntityHeaderEx<LogStorage>;
      debugMode: boolean;
      isArchived: boolean;
      solution: Core.EntityHeaderEx<Solution>;
    }
  
    export interface UsageMetrics {
      activeCount: number;
      averageProcessingMS: number;
      bytesProccessed: number;
      deadLetterCount: number;
      elapsedMS: number;
      endTimeStamp: string;
      errorCount: number;
      hostId: string;
      instanceId: string;
      messagesPerSecond: number;
      messagesProcessed: number;
      pipelineModuleId: string;
      processingMS: number;
      startTimeStamp: string;
      status: string;
      version: string;
      warningCount: number;
    }
  
    export enum IntegrationTypes {
      Twillio,
      PagerDuty,
      SendGrid
    }
  
    export interface Integration extends IoTModelBase {
      integrationType_Twillio: string;
      integrationType_PagerDuty: string;
      integrationType_SendGrid: string;
      databaseName: string;
      entityType: string;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      key: string;
      integrationType: Core.EntityHeader;
      apiKey: string;
      uri: string;
      accountId: string;
      fromAddress: string;
      sms: string;
      routingKey: string;
      smtpAddress: string;
      apiKeySecretId: string;
    }
  
    export interface IntegrationSummary extends Core.SummaryData {
      integrationType: string;
    }
  
    export interface DeploymentHostSummary extends Core.SummaryData {
      hostType: string;
      status: string;
      capacityStatus: string;
    }
  
    export interface DeploymentInstanceSummary extends Core.SummaryData {
      status: Core.EntityHeaderEx<DeploymentInstanceStates>;
      isDeployed: boolean;
      nuvIoTEdition: string;
      deploymentType: string;
      workingStorage: string;
      queueType: string;
      deviceRepoId: string;
      deviceRepoName: string;
      orgName: string;
      orgId: string;
      icon: string;
    }
  
    export interface StateChangeNotification {
      oldState: Core.EntityHeader;
      newState: Core.EntityHeader;
      oldDeployed?: boolean;
      newDeployed?: boolean;
    }
  
    export interface WiFiConnectionProfile {
      id: string;
      name: string;
      key: string;
      ssid: string;
      password: string;
      passwordSecretId?: string;
      description: string;
    }

    export interface Telemetry {
      itemId: string;
      itemType: string;
      timeStamp: string;
      name: string;
      instanceId: string;
      hostId: string;
      deviceId: string;
      deviceTypeId: string;
      level: string;
      setting: string;
      orgId: string;
      userId: string;
      email: string;
      user: string;
      oldState: string;
      newState: string;
    }
  
    export interface LogRecord {
      stackTrace: string;
      details: string;
      message: string;
      tag: string;
      area: string;
      errorCode: string;
      timeStamp: string;
      oldState: string;
      activityId: string;
      deviceTypeId: string;
      pipelineModuleId: string;
      hostId: string;
      instanceId: string;
      pemId: string;
      version: string;
      logLevel: string;
      id: string;
      deviceId: string;
      newState: string;
    }
  
    export interface DeploymentActivitySummary {
      id: string;
      start: string;
      resourceType: string;
      activityType: string;
      status: string;
      durationMS: string;
      errorMessage: string;
    }
  }
  