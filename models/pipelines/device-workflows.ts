namespace PipelineModels {

    export interface ParameterTypes {
      String: "string",
      States: "state",
      Integer: "integer",
      Decimal: "decimal",
      TrueFalse: "true-false",
      Geolocation: "geolocation",
      DateTime: "datetime",
      UnitWithValues: "valuewithunit",
      MLInference: "mlinference",
      DecimalArray: "decimalarray"
    }
  
    export interface Page {
      pageNumber: number;
      name: string;
      description: string;
    }
  
    export interface PageView {
      pageNumber: Core.FormField;
      name: Core.FormField;
      description: Core.FormField;
    }
  
    export interface AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      inputType: Core.FormField;
      attributeType: Core.FormField;
      autoAddAttribute: Core.FormField;
    }
  
    export interface IWorkflowNode {
      id: string;
      key: string;
      name: string;
  
      incomingConnections: Connection[];
      outgoingConnections: Connection[];
  
      diagramLocations: DiagramLocation[];
    }
  
    export interface ILockableEntity {
      isLocked: boolean;
      lockedBy?: Core.EntityHeader;
      lockedDateStamp?: string;
    }
  
    export interface PipelineModule extends Core.IKeyNamedModel {
      id: string;
      key: string;
      name: string;
      description: string;
      createDate: string;
      createBy: Core.EntityHeader;
      lastUpdateData: string;
      lastUpdatedBy: Core.EntityHeader;
    }
  
    export interface Page {
      pageNumber: number;
      name: string;
    }
  
    /* TODO: would really like overridden string  for dates
    interface DateStamp extends string {
  
    }*/
  
    export interface CustomModule extends PipelineModule {
      customModuleType: Core.EntityHeader;
  
      script: string;
  
      uri: string;
  
      authenticationType: Core.EntityHeader;
  
      authenticationHeader: string;
  
      accountId: string;
      accountPassword: string;
  
      dotNetAssembly: string;
      dotNetClass: string;
  
      containerRepository: Core.EntityHeader;
      containerTag: Core.EntityHeader;
    }
  
    export interface CustomModuleView {
      id: Core.FormField;
      key: Core.FormField;
      name: Core.FormField;
      description: Core.FormField;
      createDate: Core.FormField;
      createBy: Core.FormField;
      lastUpdateData: Core.FormField;
      lastUpdatedBy: Core.FormField;
      customModuleType: Core.FormField;
      script: Core.FormField;
      uri: Core.FormField;
      authenticationType: Core.FormField;
      authenticationHeader: Core.FormField;
      accountId: Core.FormField;
      accountPassword: Core.FormField;
      dotNetAssembly: Core.FormField;
      dotNetClass: Core.FormField;
      containerRepository: Core.FormField;
      containerTag: Core.FormField;
    }
  
    export interface CustomModuleSummary extends Core.SummaryData {
  
    }
  
    export interface DeviceWorkflowSummary {
      id: string;
      isPublic: boolean;
      name: string;
      key: string;
      description: string;
    }
  
    export interface DiagramLocation {
      x: number;
      y: number;
      page: number;
    }
  
    export class Connection {
      constructor(nodeName: string, nodeKey: string, nodeType: string, script?: string) {
        this.nodeName = nodeName;
        this.nodeKey = nodeKey;
        this.nodeType = nodeType;
        this.script = script;
      }
  
      nodeKey: string;
      nodeName: string;
      nodeType: string;
      inputCommandKey?: string;
      script?: string;
      stateMachineEvent?: Core.EntityHeader;
      mappings?: Core.KeyValuePair<string, any>[];
    }
  
  
    export interface ValidationMessage {
      message: string;
      errorCode: string;
      systemError: boolean;
    }
  
    export interface AdminNote extends Core.IIDEntity, Core.IAuduitableEntity {
      id: string;
      createDate: string;
      createBy: Core.EntityHeader;
      lastUpdateData: string;
      lastUpdatedBy: Core.EntityHeader;
      note: string;
    }
  
    export interface DeviceModelbase extends Core.IIDEntity, Core.IAuduitableEntity, Core.IKeyNamedModel, Core.IDescriptionEntity {
      id: string;
      createDate: string;
      createBy: Core.EntityHeader;
      lastUpdateData: string;
      lastUpdatedBy: Core.EntityHeader;
      name: string;
      description: string;
      isValid: boolean;
  
      validationErrors: ValidationMessage[];
    }
  
  
    export interface SectionGroup<Item> {
      name: string;
      description: string;
      items: Item[];
      sectionVisible: boolean;
    }
  
    export interface CustomProperty {
      id: string;
      name: string;
      label: string;
      isRequired: boolean;
      isReadOnly: boolean;
      isUserConfigurable: boolean;
      remotePropertyId: number;
      isRemoteProperty: boolean;
      fieldType: Core.EntityHeader;
      unitSet: Core.EntityHeader;
      stateSet: Core.EntityHeader;
      key: string;
      defaultValue: string;
      regEx: string;
      helpText: string;
      order: number;
      minValue: number;
      maxValue: number;
    }
  
    export interface KeyOwnedDeviceAdminBase extends DeviceModelbase, Core.IKeyNamedModel, Core.IOwnedEntity {
      key: string;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      isPublic: boolean;
    }
  
    export interface NodeBase extends IWorkflowNode {
      id: string;
      description: string;
      incomingConnections: Connection[];
      outgoingConnections: Connection[];
  
      diagramLocations: DiagramLocation[];
    }
  
    export interface Event extends Core.IKeyNamedModel, Core.IDescriptionEntity {
      key: string;
      name: string;
      description: string;
    }
  
    export interface EventView {
      key: Core.FormField;
      name: Core.FormField;
      description: Core.FormField;
    }
  
    export interface StateTransition {
      event: Core.EntityHeader;
      newState: Core.EntityHeader;
      transitionAction?: string;
      description?: string;
    }
  
    export interface StateTransitionView {
      event: Core.FormField;
      newState: Core.FormField;
      transitionAction: Core.FormField;
      description: Core.FormField;
    }
  
    export interface State {
      name: string;
      key: string;
      transitionInAction?: string;
      enumValue?: number;
      isInitialState?: boolean;
      isAlarmState?: boolean;
      transitions?: StateTransition[];
      description?: string;
      diagramLocations?: DiagramLocation[];
    }
  
    export interface StateView {
      name: Core.FormField;
      key: Core.FormField;
      transitionInAction: Core.FormField;
      enumValue?: Core.FormField;
      isInitialState?: Core.FormField;
      isAlarmState: Core.FormField;
      transitions: Core.FormField;
      description: Core.FormField;
      diagramLocations: Core.FormField;
    }
  
    export interface StateSet extends Core.IKeyNamedModel, ILockableEntity {
      isLocked: boolean;
      lockedBy?: Core.EntityHeader;
      lockedDateStamp?: string;
      requireEnum: boolean;
      states: State[];
    }
  
    export interface StateSetSummary extends Core.SummaryData {
      isLocked: boolean;
    }
  
    export interface StateSetView  {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      isLocked: Core.FormField;
      lockedBy?: Core.FormField;
      lockedDateStamp?: Core.FormField;
      requireEnum: Core.FormField;
      states: Core.FormField;
    }
  
  
    export interface EventSet extends KeyOwnedDeviceAdminBase, ILockableEntity {
      isLocked: boolean;
      lockedBy: Core.EntityHeader;
      lockedDateStamp: string;
  
      events: State[];
    }
  
  
    export interface Attribute extends NodeBase {
      attributeType: Core.EntityHeader;
      onSetScript: string;
      readOnly: boolean;
      defaultValue: string;
      unitSet: Core.EntityHeader;
      stateSet: Core.EntityHeader;
    }
  
    export interface AttributeView extends AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      attributeType: Core.FormField;
      onSetScript: Core.FormField;
      readOnly: Core.FormField;
      defaultValue: Core.FormField;
      unitSet: Core.FormField;
      stateSet: Core.FormField;
    }
  
    export interface Input extends NodeBase {
      inputType: Core.EntityHeader;
      autoAddAttribute: boolean;
      onSetScript: string;
      unitSet: Core.EntityHeader;
      stateSet: Core.EntityHeaderEx<StateSet>;
    }
  
    export interface InputView extends AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      inputType: Core.FormField;
      autoAddAttribute: Core.FormField;
      onSetScript: Core.FormField;
      unitSet: Core.FormField;
      stateSet: Core.FormField;
    }
  
    export interface OutputCommand extends NodeBase {
      onExecuteScript: string;
      parameters: OutputCommandParameter[];
    }
  
    export interface OutputCommandView extends AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      onExecuteScript: Core.FormField;
      parameters: Core.FormField;
    }
  
    export interface OutputCommandMessageMapping {

  
      outgoingDeviceMessage: Core.EntityHeader;
      fieldMappings: Core.KeyValuePair<string, any>[];
    }
  
    export interface OutputCommandMapping {
      key: string;
      value: OutputCommandMessageMapping;
    }
  
    export interface InputCommandParameter {
      id: string;
      key: string;
      name: string;
      isRequired?: boolean;
      parameterType?: Core.EntityHeader;
      description: string;
      min?: number;
      max?: number;
      defaultValue?: number;
      parameterLocation: Core.EntityHeader;
      unitSet: Core.EntityHeader;
      stateSet: Core.EntityHeader;
    }
  
    export interface InputCommandParameterView {
      name: Core.FormField;
      key: Core.FormField;
      isRequired?: Core.FormField;
      parameterType?: Core.FormField;
      description: Core.FormField;
      min?: Core.FormField;
      max?: Core.FormField;
      defaultValue?: Core.FormField;
      parameterLocation: Core.FormField;
      unitSet: Core.FormField;
      stateSet: Core.FormField;
    }
  
    export interface OutputCommandParameter {
      id: string;
      key: string;
      name: string;
      isRequired: boolean;
      parameterType: Core.EntityHeader;
      description: string;
      parameterLocation: Core.EntityHeader;
      min?: number;
      max?: number;
      defaultValue?: number;
      unitSet?: Core.EntityHeader;
      stateSet?: Core.EntityHeader;
    }
  
    export interface OutputCommandParameterView {
      key: Core.FormField;
      name: Core.FormField;
      isRequired: Core.FormField;
      parameterType: Core.FormField;
      description: Core.FormField;
      parameterLocation: Core.FormField;
      min: Core.FormField;
      max: Core.FormField;
      defaultValue: Core.FormField;
      unitSet: Core.FormField;
      stateSet: Core.FormField;
    }
  
  
    export interface InputCommand extends NodeBase {
      onArriveScript: string;
      parameters: InputCommandParameter[];
      endpointType: Core.EntityHeader;
    }
  
    export interface InputCommandView extends AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      onArriveScript: Core.FormField;
      parameters: Core.FormField;
      endpointType: Core.FormField;
    }
  
    export interface StateMachine extends NodeBase {
      initialState: Core.EntityHeader;
      initialActions: Core.EntityHeader[];
      states: State[];
      events: Event[];
      pages: Page[];
    }
  
    export interface StateMachineView extends AddNodeView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      initialState: Core.FormField;
      initialActions: Core.FormField;
    }
  
    export interface DeviceWorkflow extends DeviceModelbase {
      configurationVersion: number;
      key: string;
      environment: Core.EntityHeader;
      isPublic: boolean;
      ownerOrganization: Core.EntityHeader;
      ownerUser: Core.EntityHeader;
      attributes: Attribute[];
      inputCommands: InputCommand[];
      inputs: Input[];
      outputCommands: OutputCommand[];
      stateMachines: StateMachine[];
      serviceTicketTemplates: AssociatedServiceTicketTemplate[];
      businessRules: BusinessRule[];
      pages: Page[];
      preHandlerScript: string;
      postHandlerScript: string;
    }
  
    export interface DeviceWorkflowView {
      configurationVersion: Core.FormField;
      key: Core.FormField;
      environment: Core.FormField;
      isPublic: Core.FormField;
      serviceTicketTemplates: Core.FormField;
      businessRules: Core.FormField;
      preHandlerScript: Core.FormField;
      postHandlerScript: Core.FormField;
    }
  
    export interface BusinessRule {
      id: string;
      name: string;
      key: string;
      description: string;
      isBeta: boolean;
      isEnabled: boolean;
      errorCode: Core.EntityHeader;
      serviceTicketTemplate: Core.EntityHeader;
      script: string;
    }
  
    export interface BusinessRuleView {
      name: Core.FormField;
      key: Core.FormField;
      description: Core.FormField;
      isBeta: Core.FormField;
      isEnabled: Core.FormField;
      errorCode: Core.FormField;
      serviceTicketTemplate: Core.FormField;
      script: Core.FormField;
    }
  
    export interface AssociatedServiceTicketTemplate {
      id: string;
      key: string;
      name: string;
    }
  
    export interface BasicSummary {
      id: string;
      isPublic: boolean;
      name: string;
      key: string;
    }
  
    export interface MappingOption {
      id: string;
      key: string;
      text: string;
      fieldType?: string;
      fieldTypeText?: string;
      unitSet?: Core.EntityHeader;
      stateSet?: Core.EntityHeader;
    }
  
    export interface MappedOption {
      left: MappingOption;
      right: MappingOption;
    }
  
    export interface MappingConfig {
      title: string;
      helpConfig: { description: string, links: { title: string, link: string }[] };
  
      leftHeader: string;
      rightHeader: string;
  
      mappings: { key: string; value: any; fieldMappings?: Core.KeyValuePair<string, string>[]; }[];
  
      outputCommands: PipelineModels.OutputCommand[];
  
      leftCollection: MappingOption[];
      rightCollection: MappingOption[];
  
      isOutputTranslator: boolean;
    }
  
    export interface OutgoingMessageMapping {
      key: string;
      value: {
        fieldMappings: Core.KeyValuePair<string, string>[];
        outgoingDeviceMessage: Core.EntityHeader;
      };
    }
  }
  