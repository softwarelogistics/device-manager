
namespace PipelineModules {

    export enum PipelineModuleType {
      Listener,
      Planner,
      Sentinel,
      InputTranslator,
      Workflow,
      OutputTranslator,
      Transmitter,
      DataStream,
      ApplicationCache,
      Custom
    }
  
    export interface PipelineModuleConfiguration {
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
      pipelineModuleType_Listener: string;
      pipelineModuleType_Planner: string;
      pipelineModuleType_Sentinel: string;
      pipelineModuleType_InputTranslator: string;
      pipelineModuleType_WorkFlow: string;
      pipelineModuleType_OutputTranslator: string;
      pipelineModuleType_Transmitter: string;
      pipelineModuleType_Custom: string;
      pipelineModuleType_DataStream: string;
      pipelineModuleType_ApplicationCache: string;
      pipelineModuleType_Dictionary: string;
      key: string;
      databaseName: string;
      entityType: string;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      moduleType: string;
      debugMode: boolean;
    }
  
    export enum SecurityFieldType {
      AccessKey,
      BasicAccess,
      Script,
      SharedAccessSignature
    }
  
    export interface SecurityField {
      fieldType_AccessKey: string;
      fieldType_BasicAccess: string;
      fieldType_Script: string;
      fieldType_SharedSignature: string;
      id: string;
      key: string;
      name: string;
      locator: Core.EntityHeaderEx<Messaging.DeviceMessageDefinitionField>;
      script: string;
      fieldType: Core.EntityHeaderEx<SecurityFieldType>;
    }
  
    export interface SentinelConfiguration extends PipelineModuleConfiguration {
      moduleType: string;
      securityFields: SecurityField[];
    }
  
  
    export interface PlannerConfiguration extends PipelineModuleConfiguration {
      pipelineModules: Core.EntityHeaderEx<PipelineModuleConfiguration>;
      deviceIdParsers: Messaging.DeviceMessageDefinitionField[];
      messageTypeIdParsers: Messaging.DeviceMessageDefinitionField[];
      moduleType: string;
    }
  
  
    /*public const string SHARED_CONNECTION_TYPE_AWS = "aws";
    public const string SHARED_CONNECTION_TYPE_AZURE = "azure";
    public const string SHARED_CONNECTION_TYPE_REDIS = "redis";
    public const string SHARED_CONNECTION_TYPE_DATABASE = "database";*/
  
    export enum SharedConnectionTypes {
      AWS,
      Azure,
      Database,
      Redis
    }
    export interface OutputTranslatorConfiguration extends PipelineModuleConfiguration {
      moduleType: string;
      outputTranslatorType: Core.EntityHeaderEx<OutputTranslatorTypes>;
      script: string;
    }
  
    export enum OutputTranslatorTypes {
      MessageBased,
      Custom
    }
  
  
    export interface SharedConnection {
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
      aWSSecretKeySecureId: string;
      azureAccessKeySecureId: string;
      dBPasswordSecureId: string;
      redisPasswordSecureId: string;
      key: string;
      databaseName: string;
      entityType: string;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      connectionType: Core.EntityHeaderEx<SharedConnectionTypes>;
      azureStorageAccountName: string;
      azureAccessKey: string;
      awsAccessKey: string;
      awsRegion: string;
      awsSecretKey: string;
      dbURL: string;
      dbUserName: string;
      dbPassword: string;
      dbSchema: string;
      dbName: string;
      redisPassword: string;
      redisServerUris: string;
    }
  
    export enum RESTListenerTypes {
    PipelineModule,
    InputCommandListener,
    AcmeListener
  }
  
  export enum ListenerTypes {
    AMQP,
    AzureServiceBus,
    AzureEventHub,
    AzureIoTHub,
    MQTTListener,
    MQTTClient,
    RawTCP,
    RabbitMQClient,
    Rest,
    Redis,
    Kafka,
    RawUDP,
    SerialPort,
    WebSocket,
    FTP
  }
  
  export enum MessageLengthSize {
    OneByte,
    TwoBytes,
    FourBytes
  }
  
  export enum RESTServerTypes {
    HTTP,
    HTTPS
  }
  
  export enum QOS {
    QOS0,
    QOS1,
    QOS2
  }
  
  export interface MQTTSubscription {
    topic: string;
    qOS: Core.EntityHeaderEx<QOS>;
  }
  
  export interface ListenerConfiguration extends PipelineModuleConfiguration {    
    moduleType: string;
    rESTListenerType: RESTListenerTypes;
    listenerType: Core.EntityHeaderEx<ListenerTypes>;
    delimitedWithSOHEOT: boolean;
    contentType: Core.EntityHeaderEx<Messaging.MessageContentTypes>;
    messageLengthInMessage: boolean;
    messageLengthLocation: number | null;
    messageLengthSize: Core.EntityHeaderEx<MessageLengthSize>;
    messageLengthByteCountEndiness: Core.EntityHeaderEx<Messaging.EndianTypes>;
    restServerType: Core.EntityHeaderEx<RESTServerTypes>;
    anonymous: boolean;
    secureConnection: boolean;
    userName: string;
    password: string;
    securePasswordId: string;
    hostName: string;
    accessKeyName: string;
    accessKey: string;
    secureAccessKeyId: string;
    topic: string;
    queue: string;
    endpoint: string;
    resourceName: string;
    consumerGroup: string;
    hubName: string;
    exchangeName: string;
    listenOnPort: number | null;
    connectToPort: number | null;
    supportedProtocol: string;
    path: string;
    origin: string;
    defaultResponse: string;
    failedResponse: string;
    keepAliveToSendReply: boolean;
    keepAliveToSendReplyTimeoutMS: number | null;
    startMessageSequence: string;
    endMessageSequence: string;
    messageReceiveTimeoutMS: number | null;
    maxMessageSize: number | null;
    mqttSubscriptions: MQTTSubscription[];
    baudRate: string;
    portName: string;
    amqpSubscriptions: string[];
    eventHubCheckPointContainerStorageAccountId: string;
    eventHubCheckPointContainerStorageAccessKey: string;
  }
  
  
  export enum DataStreamTypes {
    AWSElasticSearch,
    AWSS3,
    AzureBlob,
    AzureEventHub,
    AzureTableStorage,
    AzureTableStorage_Managed,
    Postgresql,
    PointArrayStorage,
    Redis,
    SQLServer
  }
  
  export enum DateStorageFormats {
    Epoch,
    ISO8601
  }
  
  export interface DataStreamField {
    id: string;
    name: string;
    key: string;
    description: string;
    notes: string;
    fieldName: string;
    fieldType: Core.EntityHeaderEx<Core.ParameterTypes>;
    unitSet: Core.EntityHeaderEx<Core.UnitSet>;
    stateSet: Core.EntityHeaderEx<Core.StateSet>;
    isKeyField: boolean;
    isDatabaseGenerated: boolean;
    isRequired: boolean;
    numberDecimalPoint: number | null;
    minValue: number | null;
    maxValue: number | null;
  }
  
  
  export interface DataStream extends PipelineModuleConfiguration {
    aWSSecretKeySecureId: string;
    azureAccessKeySecureId: string;
    dBPasswordSecureId: string;
    redisPasswordSecureId: string;
    moduleType: string;
    streamType: Core.EntityHeaderEx<DataStreamTypes>;
    timestampFieldName: string;
    deviceIdFieldName: string;
    dateStorageFormat: Core.EntityHeaderEx<DateStorageFormats>;
    summaryLevelData: boolean;
    s3BucketName: string;
    elasticSearchDomainName: string;
    elasticSearchIndexName: string;
    elasticSearchTypeName: string;
    awsAccessKey: string;
    awsRegion: string;
    awsSecretKey: string;
    azureStorageAccountName: string;
    azureAccessKey: string;
    azureTableStorageName: string;
    azureBlobStorageContainerName: string;
    azureEventHubName: string;
    azureEventHubEntityPath: string;
    dbUserName: string;
    dbPassword: string;
    dbSchema: string;
    dbName: string;
    dbValidateSchema: boolean;
    dbURL: string;
    dbTableName: string;
    autoCreateSQLTable: boolean;
    createTableDDL: string;
    redisPassword: string;
    redisServerUris: string;
    isSummaryLevelData: boolean;
    fields: DataStreamField[];
    sharedConnection: Core.EntityHeaderEx<SharedConnection>;
  }
  
  export interface DataStreamSummary extends Core.SummaryData {
    streamType: string;
    streamTypeKey: string;
    timestampFieldName: string;
    deviceIdFieldName: string;
  }
  
  }
  