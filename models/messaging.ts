namespace Messaging {
    export enum MessageContentTypes {
      NoContent,
      Binary,
      Delimited,
      JSON,
      StringRegEx,
      ProtoBuf,
      StringPosition,
      XML,
      Media,
      SevenSegementImage,
      PointArray
    }
  
    export enum RESTMethod {
      GET,
      PUT,
      POST,
      DELETE
    }
  
    export enum BinaryParsingStrategy {
      Absolute,
      Relative,
      Script
    }
  
    export enum StringParsingStrategy {
      NullTerminated,
      StringLength
    }
  
    export enum EndianTypes {
      BigEndian,
      LittleEndian
    }
  
    export enum MessageDirections {
      Incoming,
      Outgoing,
      IncomingAndOutgoing
    }
  
    export interface DisplayImageSegment {
      top: number;
      left: number;
      width: number;
      height: number;
      b64Image: string;
    }
  
    export interface KeyOwnedDeviceAdminBase {
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
      key: string;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
    }
  
    export interface Unit {
      conversionTypes_Factor: string;
      conversionTypes_Script: string;
      name: string;
      key: string;
      abbreviation: string;
      description: string;
      numberDecimalPoints: number;
      conversionType: Core.EntityHeaderEx<ConversionTypes>;
      conversionFactor: number | null;
      conversionToScript: string;
      conversionFromScript: string;
      displayFormat: string;
      isDefault: boolean;
    }
  
  
    export interface Event {
      key: string;
      name: string;
      description: string;
    }
  
    export interface StateTransition {
      event: Core.EntityHeaderEx<Event>;
      newState: Core.EntityHeaderEx<State>;
      transitionAction: string;
      description: string;
    }
    export interface State {
      transitionInAction: string;
      name: string;
      key: string;
      enumValue: number | null;
      isInitialState: boolean;
      isAlarmState: boolean;
      transitions: StateTransition;
      description: string;
      diagramLocations: Core.DiagramLocation;
    }
  

    
  
    export interface StateSet extends KeyOwnedDeviceAdminBase {
      databaseName: string;
      entityType: string;
      isLocked: boolean;
      lockedBy: Core.EntityHeader;
      lockedDateStamp: string;
      states: Core.State[];
      requireEnum: boolean;
    }
  
    export enum ConversionTypes {
      Factor,
      Script
    }
  
    export interface UnitSetSummary {
      id: string;
      name: string;
      key: string;
      isPublic: boolean;
    }
    export interface UnitSet extends KeyOwnedDeviceAdminBase {
      databaseName: string;
      entityType: string;
      isLocked: boolean;
      lockedBy: Core.EntityHeader;
      lockedDateStamp: string;
      units: Unit[];
    }
  
    export interface UnitSetSummary {
      id: string;
      name: string;
      key: string;
      isPublic: boolean;
    }
    export enum ParseBinaryValueType {
      String,
      Boolean,
      Char,
      Byte,
      UInt16,
      Int16,
      UInt32,
      Int32,
      UInt64,
      Int64,
      SinglePrecisionFloatingPoint,
      DoublePrecisionFloatingPoint
    }
  
    export enum ParseStringValueType {
      String,
      WholeNumber,
      RealNumber,
      Boolean,
      File,
      WholeNumberArray,
      RealNumberArray,
      StringArray
    }
  
    export enum SearchLocations {
      Header,
      QueryString,
      Path,
      Topic,
      Body
    }
  
    export enum FieldType {
      MessageId,
      DeviceId,
      Content
    }
  
    export enum DateTimeZoneOptions {
      NoTimeZone,
      UseServerTimeZone,
      UniversalTimeZone,
      ISO8601
    }
  
    export interface SampleMessage {
      id: string;
      name: string;
      key: string;
      pathAndQueryString: string;
      topic: string;
      payload: string;
      description: string;
      headers: Header[];
    }
  
    export interface Header {
      name: string;
      value: string;
    }
  
    export interface MessageFramingBytes {
      byte: string;
      index: number;
      description: string;
    }
  
    export interface DeviceMessageDefinition {
      id: string;
      name: string;
      key: string;
      description: string;
      ownerUser: Core.EntityHeader;
      ownerOrganization: Core.EntityHeader;
      isPublic: boolean;
      messageId: string;
      quotedText: string;
      fields: DeviceMessageDefinitionField[];
      protoBufDefinition: string;
      delimiter: string;
      mediaContentType: string;
      fileExtension: string;
      messageDirection: Core.EntityHeaderEx<string>;
      contentType: Core.EntityHeader;
      binaryParsingStrategy: Core.EntityHeader;
      stringParsingStrategy: Core.EntityHeader;
      stringLengthByteCount?: number;
      endian: Core.EntityHeader;
      regEx: string;
      script: string;
      outputMessageScript: string;
      restMethod: Core.EntityHeader;
      pathAndQueryString: string;
      topic: string;
      framingBytes: any[];
      sampleMessages: any[];
      backgroundColor: string;
      segementColor: string;
      isSevenSegementImage: boolean;
      b64Image: string;
    }
  
    export interface DeviceMessageDefinitionSummary {
      id: string;
      isPublic: boolean;
      name: string;
      key: string;
      description: string;
      direction: string;
    }
  
    export interface DeviceMessageDefinitionField {
      dateTimeZone_NoTimeZone: string;
      dateTimeZone_Server: string;
      dateTimeZone_Universal: string;
      dateTimeZone_8601: string;
      parserBinaryType_String: string;
      parserBinaryType_Boolean: string;
      parserBinaryType_Char: string;
      parserBinaryType_Byte: string;
      parserBinaryType_UInt16: string;
      parserBinaryType_Int16: string;
      parserBinaryType_UInt32: string;
      parserBinaryType_Int32: string;
      parserBinaryType_UInt64: string;
      parserBinaryType_Int64: string;
      parserBinaryType_SinglePrecisionFloatingPoint: string;
      parserBinaryType_DoublePrecisionFloatingPoint: string;
      parserStringType_String: string;
      parserStringType_WholeNumber: string;
      parserStringType_RealNumber: string;
      parserStringType_Boolean: string;
      parserStringType_File: string;
      parserStringType_StringArray: string;
      parserStringType_RealNummberArray: string;
      parserStringType_WholeNumberArray: string;
      searchLocation_Headers: string;
      searchLocation_QueryString: string;
      searchLocation_Path: string;
      searchLocation_Body: string;
      searchLocation_Topic: string;
      fieldType_Content: string;
      fieldType_MessageId: string;
      fieldType_DeviceId: string;
      id: string;
      key: string;
      name: string;
      fieldIndex: number | null;
      searchLocation: Core.EntityHeaderEx<SearchLocations>;
      storageType: Core.EntityHeaderEx<Core.ParameterTypes>;
      unitSet: Core.EntityHeaderEx<Messaging.UnitSet>;
      stateSet: Core.EntityHeaderEx<Messaging.StateSet>;
      regExValueSelector: string;
      quotedText: boolean;
      delimiter: string;
      contentType: Core.EntityHeaderEx<Messaging.MessageContentTypes>;
      parsedBinaryFieldType: Core.EntityHeaderEx<ParseBinaryValueType>;
      stringLengthByteCount: number | null;
      decimalScaler: number;
      binaryParsingStrategy: Core.EntityHeaderEx<Messaging.BinaryParsingStrategy>;
      stringParsingStrategy: Core.EntityHeaderEx<Messaging.StringParsingStrategy>;
      endian: Core.EntityHeaderEx<Messaging.EndianTypes>;
      parsedStringFieldType: Core.EntityHeaderEx<ParseStringValueType>;
      regExGroupName: string;
      latRegExGroupName: string;
      lonRegExGroupName: string;
      jsonPath: string;
      latJsonPath: string;
      lonJsonPath: string;
      delimitedIndex: number | null;
      latDelimitedIndex: number | null;
      lonDelimitedIndex: number | null;
      binaryOffset: number | null;
      latBinaryOffset: number | null;
      lonBinaryOffset: number | null;
      startIndex: number | null;
      latStartIndex: number | null;
      lonStartIndex: number | null;
      length: number | null;
      xPath: string;
      latXPath: string;
      lonXPath: string;
      latQueryStringField: string;
      lonQueryStringField: string;
      headerName: string;
      queryStringField: string;
      pathLocator: string;
      topicLocator: string;
      defaultValue: string;
      dateTimeZone: Core.EntityHeaderEx<DateTimeZoneOptions>;
      notes: string;
      regExValidation: string;
      isRequired: boolean;
      minValue: number | null;
      maxValue: number | null;
      segments: Messaging.DisplayImageSegment[];
    }
  }
  