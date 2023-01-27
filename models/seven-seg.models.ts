/// <reference path="./core/core.ts" />


export class DeviceMessageDefinitionView {
  // TODO: can be populated if we need to render views.
  name: Core.FormField;
  key: Core.FormField;
  description: Core.FormField;
}

export const msgContentTypeMedia = { value: 'Media', id: 'media', text: 'File/Upload Media' };
export const msgContentTypeSevenSegement = { value: 'SevenSegementImage', id: 'sevensegementimage', text: 'Seven Segement Image' };
export const msgDirectionIn = { value: 'Incoming', key: 'incoming', id: 'incoming', text: 'Incoming' };

export const fldFieldTypeContent = { value: 'Content', key: 'content', id: 'content', text: 'Content' };

export const fldParsedFieldType = [{ value: 'WholeNumber', key: 'wholenumber', id: 'wholenumber', text: 'Whole Number - 0.0' },
{ value: 'ReadlNumber', key:'realnumber', id: 'realnumber', text: 'Read Number - 0.0' }];

export const fldParameterTypes = [{ value: 'Integer', key:'integer', id: 'integer', text: 'Integer' },
{ value: 'Decimal', key: 'body', id: 'decimal', text: 'Decimal' }];

export const fldSearchLocationBody = { value: 'Body', key: 'body', id: 'body', text: 'Message Body' };

export class DeviceMessageDefinition {
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

export class DeviceMessageDefinitionSummary {
  id: string;
  isPublic: boolean;
  name: string;
  key: string;
  description: string;
  direction: string;
}

export class DeviceMessageDefinitionField {
  id: string;
  key: string;
  name: string;
  fieldIndex?: number;
  searchLocation: Core.EntityHeaderEx<string>;
  storageType: Core.EntityHeaderEx<string>;
  unitSet?: Core.EntityHeader;
  stateSet?: Core.EntityHeader;
  regExValueSelector?: string;
  quotedText?: string;
  delimiterText?: string;
  contentType: Core.EntityHeader;
  parsedBinaryFieldType?: Core.EntityHeader;
  stringLengthByteCount?: number;
  decimalScaler: number;
  binaryParsingStrategy?: Core.EntityHeader;
  stringParsingStrategy?: Core.EntityHeader;
  endian?: Core.EntityHeader;
  parsedStringFieldType?: Core.EntityHeader;
  regExGroupName?: string;
  latRegExGroupName?: string;
  lonRegExGroupName?: string;
  jsonPath?: string;
  latJsonPath?: string;
  lonJsonPath?: string;
  length?: number;
  xPath?: string;
  latXPath?: string;
  lonXPath?: string;
  latQueryStringField?: string;
  lonQueryStringField?: string;
  headerName?: string;
  queryStringField?: string;
  pathLocator?: string;
  topicLocator?: string;
  defaultValue?: string;
  dateTimeZone?: Core.EntityHeader;
  notes?: string;
  regExValidation?: string;
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  segments: DisplayImageSegment[];
}

export class DisplayImageSegment {
  top: number;
  left: number;
  width: number;
  height: number;
  b64Image: string;
}

export class SevenSegementParseResult {
  messageFieldId: string;
  messageFieldKey: string;
  value: string;
}
