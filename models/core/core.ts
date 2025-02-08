/// <reference path="../media/media-models.ts" />


namespace Core.FieldType {
    export const String = 'string';
    export const Integer = 'integer';
    export const Decimal = 'decimal';
    export const TrueFalse = 'true-false';
    export const GeoLocation = 'geoLocation';
    export const DateTime = 'dateTime';
    export const State = 'state';
    export const ValueWithUnit = 'valueWithUnit';
  }
  namespace Core {
  
    export interface IIDEntity {
      id: string;
    }
  
    export interface EntityChangeSet {
      changedBy: EntityHeader;
      changeDate: string;
      changes: EntityChange[];
    }
  
    export interface EntityChange {
      field: string;
      oldValue: string;
      newValue: string;
      notes: string;
    }
  
    export interface IAuduitableEntity {
      createDate: string;
      createBy: Core.EntityHeader;
      lastUpdateData: string;
      lastUpdatedBy: Core.EntityHeader;
    }
  
    export interface IDescriptionEntity {
      description: string;
    }
  
    export interface IOwnedEntity {
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      isPublic: boolean;
    }
  
    export interface IValdiationError {
      code?: string;
      msg?: string;
      data?: any;
      systemError?: boolean;
    }
  
    export interface IValidationResult {
      modelName: string;
      getIsValid(): boolean;
      errors: IValdiationError[];
      warnings: IValdiationError[];
      containsError(errCode: string): boolean;
      getContentMessage(): string;
      duplicateKeyCheck(items: Core.IKeyedModel[], idx: number): void;
    }
  
  
    export interface IKeyedModel {
      key: string;
    }
  
    export interface IKeyNamedModel {
      key: string;
      name: string;
    }
  
    export interface Label {
      id: string;
      text: string;
      description: string;
      foregroundColor?: string;
      backgroundColor?: string;
    }
  
    export interface HelpLink {
      title: string;
      link: string;
    }
  
    export interface LabelSet {
      id: string;
      creationDate: string;
      lastUpdateDate: string;
      createdBy: EntityHeader;
      lastUpdatedBy: EntityHeader;
      isPublic: boolean;
      ownerOrganization: EntityHeader;
      ownerUser: EntityHeader;
      labels: Label[];
    }
  
    export interface LabeledEntity {
      id: string;
      entityType: string;
      name: string;
      description: string;
      labels: Label[];
    }
  
    export interface ModelBase {
    }
  
    export interface ModelView {
  
    }
  
    export interface ExtraLib {
      classLib: string;
      fileName: string;
    }
  
    export interface FormField {
      label: string;
      fieldType: string;
      isUserEditable: boolean;
      isVisible: boolean;
      isEnabled: boolean;
      name: string;
      editorPath?: string;
      isRequired?: boolean;
  
      host?: any;
      watermark?: any;
      requiredMessage?: any;
      help?: string;
  
      regEx?: string;
      regExMessage?: any;
  
      value?: any;
      display?: any;
      defaultValue?: any;
  
      aiChatPrompt?: string;
  
      allowAddChild?: boolean;
  
      inPlaceEditing?: boolean;
  
      dataType?: any;
      minLength?: any;
      maxLength?: any;
      command?: any;
      options?: PickerOption[];
  
      isReferenceField: boolean;
      isFileUploadImage: boolean;
  
      modelHelp?: string;
      modelTitle?: string;
      modelName?: string;
      view?: Core.ModelView;
  
      formFields?: string[];
  
      childItemName?: string;
      childListDisplayMember?: string;
  
      conditionalFields?: FormConditionals;
  
      openByDefault?: boolean;
  
      uploadUrl?: string;
  
      downloadUrl?: string;
  
      factoryUrl?: string;
      getUrl?: string;
      entityHeaderPickerUrl?: string;
  
      pickerFor?: string;
  
      scriptTemplateName?: string;
  
      extraScriptLibs?: ExtraLib[];
      secureIdFieldName?: string;
      helpUrl?: string;
  
      saveBeforeRaisingEvent?: boolean;
      tags?: ReplacementTag[];
  
      fileUploaded?(resource: any, fileName: string): void;
      propertyChanged?(field: FormField): void;
      internalValueChanged?(field: FormField): void;
      selectEntityHeader?(field: FormField): void;
      clearEntityHeader?(field: FormField): void;
      childFormAdded?(form: Core.FormResult<Core.ModelBase, Core.ModelView>): void;
      childFormEditing? (form: Core.FormResult<Core.ModelBase, Core.ModelView>): void;
      addChildItem?(form: Core.FormResult<Core.ModelBase, Core.ModelView>): void;
      childItemSelected?(form: Core.FormResult<Core.ModelBase, Core.ModelView>, item: any): void;
      childListMenuSelected?(field: FormField): void;
      actionClick?(field: FormField): void;
      removeClick?(field: Core.FormResult<Core.ModelBase, Core.ModelView>): void;
    }
  
    export interface ReplacementTag {
      tag: string,
      title: string,
    }
  
    export interface ListColumn {
      header: string;
      fieldName: string;
      alignment: string;
      sortable: boolean;
      visible: boolean;
      formatString: string;
      help: string;
    }
  
    export interface PickerOption {
      help?: string;
      id: string;
      key: string;
      label: string;
      name?: string;
      text: string;
    }
  
    export interface ListFilter {
      start?: string;
      end?: string;
      groupBy?: string;
      groupBySize?: number;
      pageSize?: number;
      pageIndex?: number;
      nextRowKey?: string;
      nextPartitionKey?: string;
    }
  
    export interface Location {
    altitude?: number | null;
    heading?: number | null;
    lastUpdated?: string;
    latitude: number | null;
    longitude: number | null;
    accuracyMeters?: number | null;
    hdop?: number | null;
    vdop?: number | null;
    hasLocation?: boolean;
    numberSatellites?: number;
  }
  
    export interface DateRange {
      start?: Date;
      end?: Date;
      hasValue: boolean;
    }
  
    export interface SectionGrouping<TModel> {
      name: string;
      description: string;
      items: TModel[];
      sectionVisible: boolean;
    }
  
    export interface AttributeValue extends IKeyNamedModel {
      name: string;
      key: string;
      value?: string;
      attributeType: EntityHeader;
      stateSet?: EntityHeaderEx<PipelineModels.StateSet>;
      unitSet?: EntityHeaderEx<Core.UnitSet>;
      isAlarm: boolean;
      lastUpdated?: string,
      lastUpdatedBy?: string
    }
  
    export interface GeoLocation {
      latitude: number;
      longitude: number;
      altitude: number;
    }
  
    export interface Image {
      id: string;
      imageUrl: string;
      width: number;
      height: number;
    }
  
    export interface Unit {
      name: string;
      key: string;
      conversionType: Core.EntityHeader;
      abbreviation: string;
      numberDecimalPoints?: number;
      conversionFactor?: number;
      conversionToScript: string;
      conversionFromScript: string;
      displayFormat: string;
      isDefault: boolean;
    }
  
    export interface Email {
      to: EmailAddress[];
      from: EmailAddress;
      //replyTo: EmailAddress;
      subject: string;
      content: string;
      trackingLink?: string;
    }
  
    export interface EmailAddress {
      name: string;
      address: string;
    }
  
    export interface UnitView {
      name: Core.FormField;
      key: Core.FormField;
      conversionType: Core.FormField;
      abbreviation: Core.FormField;
      numberDecimalPoints?: Core.FormField;
      conversionFactor?: Core.FormField;
      conversionToScript: Core.FormField;
      conversionFromScript: Core.FormField;
      displayFormat: Core.FormField;
      isDefault: Core.FormField;
    }
  
    export interface UnitSetSummary extends Core.SummaryData {
  
    }
  
    export interface UnitSet {
      id: string;
      name: string;
      key: string;
      description: string;
      isPublic: boolean;
      isLocked: boolean;
      lockedBy: Core.EntityHeader;
      lockedDateStamp: string;
  
      units: Unit[];
    }
  
    export interface UnitSetView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      isLocked: Core.FormField;
      lockedBy: Core.FormField;
      lockedDateStamp: Core.FormField;
  
      units: Core.FormField;
    }
  
    export interface ResponseMessage {
      message: string;
    }
  
    export interface EntityHeader {
      id: string;
      key?: string;
      text: string;
    }
  
    export interface CallLog {
        callLogId: string;
        timeStamp: string;
        fromNumber: string;
        fromName: string;
        toNumber: string;
        toName: string;
        toLocation: string;
        durationSeconds: number | null;
        recordingUrl: string;
    }
  
    export interface CurrentOrg {
      id: string;
      name: string;
      text: string;
      namespace: string;
      logo?: string;
      tagLine?: string;
      defaultTheme?: string;
      landingPage?: string;
      defaultDeviceRepository?: EntityHeader;
      defaultInstance?: EntityHeader;
    }
  
    export interface SelectableEntityHeader {
      id: string;
      key?: string;
      text: string;
      isSelected: boolean;
    }
  
    export interface SortedEntityHeader {
      id: string;
      text: string;
      sortIndex: number;
    }
  
    export interface Schedule {
      id: string;
      firstWeek: string;
      secondWeek: string;
      thirdWeek: string;
      isActive: boolean;
      fourthWeek: string;
      name: string;
      key: string;
      description: string;
      active: boolean;
      startsOn: string;
      endsOn: string;
      daily: boolean;
      weekly: boolean;
      biweekly: boolean;
      monthly: boolean;
      sunday: boolean;
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      weekNumber: EntityHeader;
      dayOfWeek: EntityHeader;
      scheduleType: EntityHeader;
      startTime: number | null;
    }
  
    export interface ScheduleView {
      firstWeek: Core.FormField;
      secondWeek: Core.FormField;
      thirdWeek: Core.FormField;
      fourthWeek: Core.FormField;
      name: Core.FormField;
      key: Core.FormField;
      isActive: Core.FormField;
      description: Core.FormField;
      active: Core.FormField;
      startsOn: Core.FormField;
      endsOn: Core.FormField;
      daily: Core.FormField;
      weekly: Core.FormField;
      biweekly: Core.FormField;
      monthly: Core.FormField;
      sunday: Core.FormField;
      monday: Core.FormField;
      tuesday: Core.FormField;
      wednesday: Core.FormField;
      thursday: Core.FormField;
      friday: Core.FormField;
      saturday: Core.FormField;
      weekNumber: Core.FormField;
      dayOfWeek: Core.FormField;
      startTime: Core.FormField;
      scheduleType: Core.FormField;
    }
  
    export interface Address {
      addressType: EntityHeader;
      geoLocation: Core.GeoLocation;
      address1: string;
      address2: string;
      unitNumber: string;
      city: string;
      stateOrProvince: string;
      postalCode: string;
      county: string;
      notes: string;
    }

    export interface GeoFence {
      id: string;
      name: string;
      ignoreIfHasSecondaryLocation: boolean;
      enabled: boolean;
      center: GeoLocation;
      radiusMeters: number;
      description: string;
    }
  
    export interface EntityHeaderEx<TModel> {
      id: string;
      key?: string;
      text: string;
      value?: TModel;
    }
  
    export interface EntityHeaderEnum<TModel> {
      id: TModel;
      key: string;
      text: string;
    }
  
    export interface KeyValuePair<TKey, TValue> {
      key: TKey;
      value: TValue;
    }
  
    export interface ListResponseColumn {
      header: string;
      fieldName: string;
      alignment: string;
      sortable: boolean;
      visible: boolean;
      formatString: string;
      help?: any;
    }
  
    export interface ListResponse<TModel> {
      title?: string;
      icon?: string;
      help?: any;
      columns?: ListResponseColumn[];
      model?: TModel[];
      filteredItems?: TModel[];
      pageSize?: number;
      pageIndex?: number;
      pageCount?: number;
      nextPartitionKey?: any;
      nextRowKey?: any;
      hasMoreRecords?: boolean;
      resultId?: string;
      successful: boolean;
      warnings?: any[];
      errors?: any[];
      updated?(field: FormField): void;
      reload?(items: any[]): void;
      setFilteredItems?(items: any[]): void;
      clearFilteredItems?(): void;
      refresh?(): void
      deleteUrl?: string;
      factoryUrl?: string;
      getUrl?: string;
      getListUrl?: string;
    }
  
    export interface Notification {
  
      payloadType: string;
      payload: any;
    }
  
    export interface ErrorMessage {
      errorCode?: string;
      systemError?: boolean;
      message?: string;
      context?: string;
      details?: string;
    }
  
    export interface InvokeResult {
      resultId?: string;
      successful: boolean;
      errors: ErrorMessage[];
      warnings: ErrorMessage[];
    }
  
    export interface InvokeResultEx<TData> {
      resultId?: string;
      successful: boolean;
      errors: ErrorMessage[];
      warnings: ErrorMessage[];
      result: TData;
    }
  
    export interface FormConditional {
      field: string;
      value: string;
      forCreate: boolean;
      forUpdate: boolean;
      notEquals: boolean;
      visibleFields: string[];
      requiredFields: string[];
      readOnlyFields: string[];
    }
  
    export interface FormConditionals {
      conditionalFields: string[];
      conditionals: FormConditional[];
    }
  
    export interface SimpleNote {
      note: string;
    }
  
    export interface IFormHost {
      saveForm(emitSaved: boolean): Promise<boolean>
      cancelForm(): void;
      isDirtyCheck(): boolean;
    }
  
    export interface FormResult<TModel, TView> {
      resultId: string;
      successful: boolean;
      model: TModel;
      modelTitle: string;
      modelName: string;
      isEditing: boolean;
      modelHelp: string;
      formFields: string[];
      formFieldsAdvanced?: string[];
      formFieldsAdvancedCol2?: string[];
      formFieldsSimple?: string[];
      formFieldsCol2?: string[];
      formInlineFields?: string[];
      formFieldsBottom?: string[];
      formFieldsTab?: string[];
      formAdditionalActions?: FormAdditionalAction[];
      conditionalFields?: FormConditionals;
      view: TView;
      errors?: ErrorMessage[];
      warnings?: ErrorMessage[];
      icon?: string;
      deleteUrl?: string;
      factoryUrl?: string;
      getUrl?: string;
      getListUrl?: string;
      saveUrl?: string;
      updateUrl?: string;
      helpUrl?: string;
      onModelToView?(): void;
      onViewToModel?(): void;
      formHost?: IFormHost;
    }
  
    export interface IView {
      key: FormField;
    }
  
    export interface IModel {
    }
  
    export interface AdminNote {
      id: string;
      creationDate: string;
      createdBy: Core.EntityHeader;
      lastUpdatedDate: string;
      lastUpdatedBy: Core.EntityHeader;
      note: string;
    }
  
  
  
    export interface DiagramLocation {
      x: number;
      y: number;
      page: number;
    }
  
    export interface SummaryData {
      id: string;
      isPublic: boolean;
      name: string;
      icon: string;
      key: string;
      description: string;
    }
  
    export interface ConnectionSettings {
      name: string;
      uri: string;
      baud: string;
      iPAddressV4: string;
      iPAddressV6: string;
      accessKey: string;
      accountId: string;
      userName: string;
      password: string;
      port: string;
      deviceId: string;
      resourceName: string;
      validThrough: string;
      isSSL: boolean;
      settings: { [key: string]: string; };
      timeoutInSeconds: number;
    }
  
    export enum ParameterTypes {
      String,
      Integer,
      Decimal,
      TrueFalse,
      GeoLocation,
      DateTime,
      State,
      ValueWithUnit,
      Image,
      DecimalArray,
      IntArray,
      StringArray,
      MLInference,
      Object
    }
  
    export interface FormAdditionalAction {
      title: string;
      icon: string;
      help: string;
      key: string;
      forCreate: boolean;
      forEdit: boolean;
    }
  
    export interface Notification {
      messageId: string;
      dateStamp: string;
      text: string;
      verbosity: string;
      channelId: string;
      payloadType: string;
      payloadJSON: string;
      channel: EntityHeader;
    }
  
    export interface ValidationError {
      code?: string;
      msg?: string;
      data?: any;
      systemError?: boolean;
    }
  
    export interface Pagination {
      pageIndex: number;
      pageSize: number;
      nextRowKey: string;
      nextPartitionKey: string;
      hasMoreRecord: boolean;
    }
  
    export interface ErrorCode {
      msg: string;
      code: string;
      details?: string;
    }
  }
  