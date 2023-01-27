namespace Planner {
  export interface Survey {
    id: string;
    name: string;
    key: string;
    isTopLevel: boolean;
    isForWizard: boolean;
    isPublic: boolean;
    parentSurveyId: string;
    description: string;
    questionSets: SurveyQuestionSet[];
  }

  export interface SurveyView {
    name: Core.FormField;
    key: Core.FormField;
    isTopLevel: Core.FormField;
    isPublic: Core.FormField;
    isForWizard: Core.FormField;
    parentSurveyId: Core.FormField;
    description: Core.FormField;
  }

  export interface SurveySummary {
    id: string;
    key: string;
    name: string;
    description: string;
  }

  export interface SurveyQuestionSet {
    id: string;
    key: string;
    name: string;
    title: string;
    description: string;
    questions: SurveyQuestion[];
  }

  export interface SurveyQuestionSetView {
    key: Core.FormField;
    name: Core.FormField;
    title: Core.FormField;
    description: Core.FormField;
  }

  export const QuestionType_MultipleChoice = 'multiplechoice';
  export const QuestionType_TrueFalse = 'truefalse';
  export const QuestionType_SelectMany = 'selectmany';
  export const QuestionType_Integer = 'integer';
  export const QuestionType_Decimal = 'decimal';
  export const QuestionType_FreeFormText = 'freeformtext';

  export interface SurveyQuestion {
    id: string;
    key: string;
    name: string;
    isRequired: boolean;
    questionText: string;
    helpText: string;
    description: string;
    addNotApplicableOption: boolean;
    addDontKnowOption: boolean;
    maxPoints?: number;
    questionType: Core.EntityHeader;
    answers: SurveyAnswerChoice[];
    childSurveyType: Core.EntityHeader;
    childSurvey: Planner.Survey;
    isAnswered: boolean;
    isDontKnow: boolean;
  }


  export interface SurveyQuestionView {
    key: Core.FormField;
    name: Core.FormField;
    isRequired: Core.FormField;
    questionText: Core.FormField;
    helpText: Core.FormField;
    maxPoints: Core.FormField;
    description: Core.FormField;
    addNotApplicableOption: Core.FormField;
    addDontKnowOption: Core.FormField;
    questionType: Core.FormField;
    childSurveyType: Core.EntityHeader;
    childSurvey: Planner.Survey;
  }

  export interface SurveyAnswerChoice {
    id: string;
    key: string;
    name: string;
    points?: number;
    helpText: string;
    description: string;
    answerText: string;
  }

  export interface SurveyAnswerChoiceView {
    key: Core.FormField;
    name: Core.FormField;
    points: Core.FormField;
    helpText: Core.FormField;
    description: Core.FormField;
    answerText: Core.FormField;
  }

  export interface SurveyDetail {
    survey: Survey;
    response: SurveyResponse;
    answers: SurveyResponseAnswer[];
  }

  export interface SurveyResponse {
    orgId: string;
    createdByUserId: string;
    createdByDate: string;
    lastUpdatedByUserId: string;
    lastUpdatedDate: string;
    rowKey: string;
    partitionKey: string;
    surveyId: string;
    surveyResponseName: string;
    description: string;
    topLevelSurveyResponseId: string;
    parentSurveyResponseId: string;
    parentQuestionId: string;
    index?: number;
    currentQuestionSetId: string;
    currentQuestionId: string;
    startTimeStamp: string;
    endTimeStamp: string;
    status: string;
  }

  export interface SurveyResponseAnswer {
    questionSetId: string;
    questionId: string;
    answerId?: string;
    answer?: any;
    isDontKnow?: boolean;
    isOther?: boolean;
    isNotApplicable?: boolean;
  }

  export interface SurveyAnswerUpdate {
    surveyResponse: SurveyResponse;
    questionId: string;
    surveyResponseAnswers: SurveyResponseAnswer[];
  }

  export interface Project {
    id: string;
    name: string;
    key: string;
    customer: Core.EntityHeader;
    agreement: Core.EntityHeader;
    projectLead: Core.EntityHeader;
    projectAdminLead: Core.EntityHeader;
    defaultQAResource: Core.EntityHeader;
    defaultPrimaryContributor: Core.EntityHeader;
    externalTaskStatusConfiguration: Core.EntityHeader;
    description: string;
    currentSprint: Core.EntityHeader;
    isActive: boolean;
    status: string;
    timeZone: Core.EntityHeader;
    surveyResponseId: string;
    projectCode: string;
    hoursEstimate: number;
    hoursUsed: number;
    currentTaskIndex: number;
    why: string;
    sprints: Core.PickerOption[];
    notes: Note[];
    requireExternalTaskCode: boolean;
    helpResources: Planner.HelpResource[];
    modules: Module[];
    adaptiveCardWebHook: string;
  }

  export interface ProjectView {
    name: Core.FormField;
    key: Core.FormField;
    requireExternalTaskCode: Core.FormField;
    projectLead: Core.FormField;
    projectAdminLead: Core.FormField;
    defaultQAResource: Core.FormField;
    defaultPrimaryContributor: Core.FormField;
    externalTaskStatusConfiguration: Core.FormField;
    description: Core.FormField;
    status: Core.FormField;
    isActive: Core.FormField;
    customer: Core.FormField;
    currentSprint: Core.FormField;
    agreement: Core.FormField;
    timeZone: Core.FormField;
    projectCode: Core.FormField;
    hoursEstimate: Core.FormField;
    hoursUsed: Core.FormField;
    currentTaskIndex: Core.FormField;
    why: Core.FormField;
    adaptiveCardWebHook: Core.FormField;
  }

  export interface ModuleView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
  }

  export interface Module {
    id: string;
    name: string;
    key: string;
    description: string;
    resources: HelpResource;
  }

  export interface Risk {
    id: string;
    name: string;
    createdBy: Core.EntityHeader;
    creationDate: string;
    description: string;
    isMitigated: boolean;
    mitigation?: string;
    mitigatedBy?: Core.EntityHeader;
    mitigationDate?: string;
  }

  export interface Note {
    dateStamp: string;
    note: string;
    createdBy: Core.EntityHeader;
  }

  export interface ExpectedOutcome {
    id: string;
    name: string;
    expectedOutcomeCode: string;
    description: string;
    why: string;
    completed: boolean;
    completedBy?: Core.EntityHeader;
    completionDate?: string;
    verified: boolean;
    verifiedBy?: Core.EntityHeader;
    verificationDate?: string;
    attachments: Attachment[];
    verificationSteps: VerificationStep[];
    verificationRuns: VerificationRun[];
  }

  export interface ExpectedOutcomeView {
    name: Core.FormField;
    expectedOutcomeCode: Core.FormField;
    description: Core.FormField;
    why: Core.FormField;
    completed: Core.FormField;
    completedBy?: Core.FormField;
    completionDate?: Core.FormField;
    verified: Core.FormField;
    verifiedBy?: Core.FormField;
    verificationDate?: Core.FormField;
  }

  export interface ProjectSummary {
    id: string;
    name: string;
    key?: string;
    description?: string;
    lastUpdatedDate?: string;
    status?: string;
    isActive?: boolean;
    projectLead?: string;
    projectAdminLead?: string;
    projectCode?: string;
    customer?: string;
    agreement?: string;
    modules: Core.EntityHeader[];
  }

  export interface Sprint {
    id: string;
    key: string;
    name: string;
    description: string;
    status: Core.EntityHeader;
    project: Core.EntityHeader;
    startDate: string;
    actualStartDate: string;
    endDate: string;
    actualEndDate: string;
  }

  export interface SprintView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    status: Core.FormField;
    project: Core.FormField;
    startDate: Core.FormField;
    actualStartDate: Core.FormField;
    endDate: Core.FormField;
    actualEndDate: Core.FormField;
  }

  export interface WorkTaskHistory {
    action: string;
    details: string;
    oldStatus: Core.EntityHeader;
    newStatus: Core.EntityHeader;
    updatedBy: Core.EntityHeader;
    updatedDate: string;
  }

  export interface WorkTaskDiscussion {
    id?: string;
    user?: Core.EntityHeader;
    timestamp?: string;
    notifyTeam: boolean;
    discussion: string;
    internalOnly: boolean;
  }

  export interface NewTask {
    name: string;
    project: Core.EntityHeader;
    taskType: Core.EntityHeader;
    why: string;
    description: string;
    instructions: string;

    priority?: Core.EntityHeader;
    fromALMIntegration?: Core.EntityHeader;
    additionalInformation?: string;
    expectedOutcomes?: ExpectedOutcome[];
    parent?: Core.EntityHeader;
    taskTemplate?: Core.EntityHeader;
    module?: Core.EntityHeader;
    externalId?: string;
    externalTaskCode?: string;
    externalTaskLink?: string;
    assignTaskLeadToCreatedBy?: boolean;
    assignPrimaryContributorToCreatedBy?: boolean;
    assignQAResourceCreatedBy?: boolean;
    complexity?: string;
    scopeOfEffort?: string;
    taskTemplateId?: string;
    status?: Core.EntityHeader;
  }

  export interface TimeEntryTimer {
    task: Core.EntityHeader;
    project: Core.EntityHeader;
    date: string;
    started: Date;
    currentHours: number;
  }

  export interface WorkTaskType {
    id: string;
    key: string;
    description: string;
    name: string;
    statusConfiguration: Core.EntityHeader;
  }

  export interface ALMIntegration {
    id: string;
    key: string;
    webhookURL: string;
    azureDevOpsOrg: string;
    azureDevOpsProject: string;
    azureDevOpsToken: string;
    description: string;
    name: string;
    clientApp: Core.EntityHeader;
    assignedToFilter: string;
  }

  export interface ALMIntegrationSummary {
    id: string;
    key: string;
    description: string;
    name: string;
    assignedToFilter: string;
  }

  export interface ALMIntegrationView {
    key: Core.FormField;
    description: Core.FormField;
    webhookURL: Core.FormField;
    azureDevOpsOrg: Core.FormField;
    azureDevOpsProject: Core.FormField;
    azureDevOpsToken: Core.FormField;
    name: Core.FormField;
    clientApp: Core.FormField;
    assignedToFilter: Core.FormField;
  }

  export interface ALMIntegrationAuthDetails {
    clientAppId: string;
    authKey1: string;
    authKey2: string;
  }

  export interface WorkTaskTypeView {
    name: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    statusConfiguration: Core.FormField;
  }

  export interface WorkTaskSummary {
    id: string;
    projectId: string;
    projectName: string;
    key: string;
    name: string;
    condition: string;
    canEdit: boolean;
    organizationName: string;
    isBlocked: boolean;
    isFlagged: boolean;
    isActive: boolean;
    hasOpenIssues: boolean;
    taskCode: string;
    status: string;
    statusKey: string;
    statusId: string;
    module: string;
    moduleId: string;
    externalStatus: string;
    externalStatusId: string;
    dueDate: string;
    expectedCloseDate: string;
    description: string;
    assignedToUser: string;
    assignedToUserId: string;
    primaryContributor: string;
    primaryContributorId: string;
    sprint: string;
    sprintId: string;
    qaResource: string;
    qaResourceId: string;
    lastUpdatedDate: string;
    hoursUsed: number;
    hoursEstimate: number;
    complexity: string;
    scopeOfEffort: string;
    points: number;
    rankedOrder: number;
    externalTaskCode: string;
    externalTaskLink: string;
    labels: Core.Label[];
  }

  export interface AdditionalInformation {
    contents: string;
  }

  export interface WorkTask {
    id: string;
    name: string;
    module: Core.EntityHeader;
    key: string;
    description: string;
    taskCode: string;
    taskType: Core.EntityHeader;
    externalTaskCode: string;
    externalTaskLink: string;
    assignedToUser: Core.EntityHeader;
    assignedByUser: Core.EntityHeader;
    ownerOrganization: Core.EntityHeader;
    project: Core.EntityHeader;
    sprint: Core.EntityHeader;
    sprints: Core.PickerOption[];
    rankedOrder: number;
    isBlocked: boolean;
    instructions: string;
    additionalInformation: string;
    isBlockedReason: string;
    timeZone: Core.EntityHeader;
    statusConfigurationType: Core.EntityHeaderEx<StatusConfiguration>;
    externalStatusConfigurationType: Core.EntityHeaderEx<StatusConfiguration>;
    status: Core.EntityHeaderEx<StatusOption>;
    externalStatus: Core.EntityHeaderEx<StatusOption>;
    priority: Core.EntityHeader;
    primaryContributorUser: Core.EntityHeader;
    qaResource: Core.EntityHeader;
    condition: Core.EntityHeader;
    scopeOfEffort: Core.EntityHeader;
    complexity: Core.EntityHeader;
    taskTemplate: Core.EntityHeader;
    dueDate: string;
    expectedCloseDate: string;
    helpLink: string;
    objectType: string;
    objectId: string;
    hoursUsed: number;
    hoursEstimate: number;
    lastUpdatedDate: string;
    why: string;
    subTasks: SubTask[];
    expectedOutcomes: ExpectedOutcome[];
    risks: Risk[];
    history: WorkTaskHistory[];
    discussions: WorkTaskDiscussion[];
    attachments: Attachment[];
    teamMembers: TeamMember[];
    helpResources: HelpResource[];
    issues: WorkTaskIssue[];
    flags: Flag[];
    labels: Core.Label[];
    relatedTasks: RelatedTask[];
    downstreamTasks: RelatedTask[];
    upstreamTasks: RelatedTask[];
  }

  export interface RelatedTask {
    id: string;
    text: string;
    taskCode: string;
    project: string;
  }

  export interface WorkTaskAssignmentStatusUpdate {
    assignedToUser: Core.EntityHeader;
    primaryContributorUser: Core.EntityHeader;
    qaResource: Core.EntityHeader;
    status: string;
  }

  export interface Flag {
    id: string;
    task: Core.EntityHeader;
    isOpen: boolean;
    reason: string;
    org: Core.EntityHeader;
    openedTimestamp: string;
    closedTimestamp: string;
    flaggedBy: Core.EntityHeader;
    closedBy: Core.EntityHeader;
    notes: string;
  }

  export interface WorkTaskUpdateFromExternalItem {
  id: string;
  status?: Core.EntityHeaderEx<Planner.StatusOption>;
  externalStatus?: Core.EntityHeaderEx<Planner.StatusOption>;
  priority?: Core.EntityHeader;
  name?: string;
  description?: string;
  notifyTeam?: boolean;
  note?: string;
}

  export interface WorkTaskView {
    name: Core.FormField;
    module: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    taskCode: Core.FormField;
    workTaskType: Core.FormField;
    externalTaskCode: Core.FormField;
    externalTaskLink: Core.FormField;
    timeZone: Core.FormField;
    additionalInformation: Core.FormField;
    assignedToUser: Core.FormField;
    primaryContributorUser: Core.FormField;
    qaResource: Core.FormField;
    assignedByUser: Core.FormField;
    isBlocked: Core.FormField;
    isBlockedReason: Core.FormField;
    rankedOrder: Core.FormField;
    sprint: Core.FormField;
    status: Core.FormField;
    externalStatus: Core.FormField;
    priority: Core.FormField;
    condition: Core.FormField;
    instructions: Core.FormField;
    scopeOfEffort: Core.FormField;
    complexity: Core.FormField;
    dueDate: Core.FormField;
    expectedCloseDate: Core.FormField;
    helpLink: Core.FormField;
    objectType: Core.FormField;
    objectId: Core.FormField;
    why: Core.FormField;
    hoursUsed: Core.FormField;
    hoursEstimate: Core.FormField;
    fromTemplate: Core.FormField;
  }

  export interface TaskTemplateSummary {
    id: string;
    key: string;
    why?: string;
    description?: string;
    instructions?: string;
    name: string;
    taskType: string;
  }

  export interface SubTask {
    id: string;
    creationDate: string;
    name: string;
    key: string;
    dueDate: string;
    subTaskCode: string;
    why: string;
    instructions: string;
    forStatus?: Core.EntityHeader;
    forRole?: Core.EntityHeader;
    subTaskType: Core.EntityHeader;
    description: string;
    assignedToUser: Core.EntityHeader;
    completionDate: string;
    completedBy: Core.EntityHeader;
    completed: boolean;
    additionalInformation: string;
    discussions: WorkTaskDiscussion[];
    attachments: Attachment[];
    helpResources: HelpResource[];
  }

  export interface SubTaskView {
    id: Core.FormField;
    creationDate: Core.FormField;
    name: Core.FormField;
    key: Core.FormField;
    forStatus?: Core.FormField;
    forRole?: Core.FormField;
    subTaskType: Core.FormField;
    dueDate: Core.FormField;
    subTaskCode: Core.FormField;
    why: Core.FormField;
    instructions: Core.FormField;
    completed: Core.FormField;
    description: Core.FormField;
    additionalInformation: Core.FormField;
    assignedToUser: Core.FormField;
    completionDate: Core.FormField;
    completedBy: Core.FormField;
    discussions: Core.FormField;
  }

  export interface Attachment {
    id: string;
    parentId: string;
    uploadDate: string;
    uploadedBy: string;
    parentType: string;
    fileName: string;
    fileSize: number;
    extension: string;
    contentType: string;
    internalOnly: boolean;
  }

  export interface TeamMember {
    id: string;
    creationDate: string;
    role: Core.EntityHeader;
    member: Core.EntityHeader;
    emailAddress: string;
    isExternal: boolean;
    isActive: boolean;
    acknowledged: boolean;
    acknowledgedOn?: string;
    viewed: boolean;
    firstViewedOn?: string;
    notes: string;
  }

  export interface TeamMemberView {
    id: Core.FormField;
    creationDate: Core.FormField;
    isExternal: Core.FormField;
    role: Core.FormField;
    emailAddress: Core.FormField;
    member: Core.FormField;
    notes: Core.FormField;
    isActive: Core.FormField;
  }

  export interface HelpResource {
    id: string;
    name: string;
    resourceType: Core.EntityHeader;
    creationDate: string;
    key: string;
    description: string;
    url: string;
  }

  export interface HelpResourceView {
    id: Core.FormField;
    name: Core.FormField;
    resourceType: Core.FormField;
    key: Core.FormField;
    description: Core.FormField;
    url: Core.FormField;
  }

  export interface VerificationStep {
    index: number;
    id: string;
    name: string;
    isEditing: boolean;
    instructions: string;
  }

  export interface VerificationRun {
    id: string;
    status: Core.EntityHeader;
    notes: string;
    environment: string;
    version: string;
    performedBy: Core.EntityHeader;
    started: string;
    completedOn?: string;
    results: VerificationStepResult[];
  }

  export interface VerificationStepResult {
    index: number;
    id: string;
    name: string;
    instructions: string;
    verificationStepId: string;
    notes: string;
    status: Core.EntityHeader;
    attachments: Attachment[];
  }

  export interface TaskReportSettingsSummary {
    id: string;
    isPublicInOrg: boolean;
    name: string;
    description: string;
  }

  export interface WorkTaskIssue {
    id: string;
    askedDate: string;
    answeredDate?: string;
    askedBy: Core.EntityHeader;
    answeredBy?: Core.EntityHeader;
    question: string;
    isAnswered: boolean;
    answer?: string;
    internalOnly: boolean;
    isBlocking: boolean;
    notes: WorkTaskIssueNote[];
  }

  export interface WorkTaskIssueNote {
    id: string;
    addedBy: Core.EntityHeader;
    addedDate: string;
    note: string;
  }

  export interface TaskReportSettings {
    id: string;
    name: string;
    key: string;
    description: string;

    isPublicInOrg: boolean;

    showTaskDiscussions: boolean;
    showInstructions: boolean;
    showExternalTaskInformation: boolean;
    showWhy: boolean;
    showDescription: boolean;
    showAdditionalInformation: boolean;
    showTaskTeam: boolean;
    showRisks: boolean;
    showHelpResources: boolean;
    showTaskHistory: boolean;
    showOnlyOpenIssues: boolean;
    showAllIssues: boolean;

    showSubTasks: boolean;
    hideClosedSubTasks: boolean;
    showSubTaskHelpResources: boolean;
    showSubTaskAdditionalInformation: boolean;
    showSubTaskAttachments: boolean;
    showSubTaskDiscussions: boolean;

    showTaskAttachments: boolean;

    showExpectedOutcomes: boolean;
    showTestPlan: boolean;
    onlyShowLatestTestResults: boolean;
    showAllTestResults: boolean;
    excludeInternalOnly: boolean;
  }

  export interface ToDo {
    id: string;
    isPublic: boolean;
    ownerOrganization: Core.EntityHeader;
    ownerUser: Core.EntityHeader;
    creationDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedDate: string;
    priority: Core.EntityHeader;
    lastUpdatedBy: Core.EntityHeader;
    discussions: ToDoDiscussion[];
    history: ToDoHistory[];
    workTask: Core.EntityHeader;
    workTaskItemType: Core.EntityHeader;
    workTaskItem: Core.EntityHeader;
    assignedToUser: Core.EntityHeader;
    assignedByUser: Core.EntityHeader;
    dueDate: string;
    name: string;
    isCompleted: boolean;
    description: string;
    instructions: string;
    completedBy: Core.EntityHeader;
    completedOn: string;
    wasViewedByAssignedTo: boolean;
    viewedByAssignedTo: string;
    key: string;
  }

  export interface ToDoDiscussion {
    id: string;
    user: Core.EntityHeader;
    timestamp: string;
    discussion: string;
  }

  export interface ToDoHistory {
    id: string;
    action: string;
    updatedBy: Core.EntityHeader;
    updatedDate: string;
  }

  export interface ToDoView {
    workTask: Core.FormField;
    workTaskItemType: Core.FormField;
    workTaskItem: Core.FormField;
    assignedToUser: Core.FormField;
    assignedByUser: Core.FormField;
    dueDate: Core.FormField;
    name: Core.FormField;
    isCompleted: Core.FormField;
    priority: Core.FormField;
    description: Core.FormField;
    instructions: Core.FormField;
    completedBy: Core.FormField;
    completedOn: Core.FormField;

    key: Core.FormField;
  }

  export interface KanbanView {
    id: string;
    key: string;
    name: string;
    description: string;
    showAllProjects: boolean;
    showTaskLead: boolean;
    showOnlyMine: boolean;
    showQAResource: boolean;
    showPrimaryContributor: boolean;
    isSharedWithOrg: boolean;
    currentSprintOnly: boolean;
    projects: Core.EntityHeader[];
    statusList: Core.EntityHeader[];
    moduleList: Core.EntityHeader[];
    workTaskTypeList: Core.EntityHeader[];
  }

  export interface KanbanViewView {
    id: Core.FormField;
    key: Core.FormField;
    name: Core.FormField;
    showTaskLead: Core.FormField;
    showPrimaryContributor: Core.FormField;
    showQAResource: Core.FormField;
    showOnlyMine: Core.FormField;
    description: Core.FormField;
    showAllProjects: Core.FormField;
    isSharedWithOrg: Core.FormField;
    currentSprintOnly: Core.FormField;
  }

  export interface FlagTaskRequest {
    workTaskId: string;
    reason: string;
    notes: string;
  }

  export interface FlaggedTaskUpdateRequest {
    workTaskId: string;
    flaggedTaskId: string;
    isOpen: boolean;
    reason: string;
    notes: string;
  }

  export interface TaskTemplate {
    id: string;
    key: string;
    name: string;
    why: string;
    taskType: Core.EntityHeader;
    priority: Core.EntityHeader;
    scopeOfEffort: Core.EntityHeader;
    complexity: Core.EntityHeader;
    objectType: Core.EntityHeader;
    hoursEstimate: number;
    description: string;
    isCreateObject: boolean;
    instructions: string;

    subTasks: SubTask[];
    helpResources: HelpResource[];
  }

  export interface TaskTemplateView {
    id: Core.FormField;
    key: Core.FormField;
    name: Core.FormField;
    why: Core.FormField;
    priority: Core.FormField;
    taskType: Core.FormField;
    scopeOfEffort: Core.FormField;
    complexity: Core.FormField;
    objectType: Core.FormField;
    hoursEstimate: Core.FormField;
    description: Core.FormField;
    isCreateObject: Core.FormField;
    instructions: Core.FormField;
  }

  export interface WorkTaskIssueNote {
    id: string;
    note: string;
    addedBy: Core.EntityHeader;
    addedDate: string;
  }

  export interface WorkTaskSearchRequest {
    projectId: string;
    query: string;
  }


  export interface StatusConfigurationView {
    key: Core.FormField;
    name: Core.FormField;
    description: Core.FormField;
  }

  export interface StatusOptionView {
    key: Core.FormField;
    name: Core.FormField;
    instructions: Core.FormField;
    description: Core.FormField;
    canBillTime: Core.FormField;
    isDefaultStatus: Core.FormField;
    isArchived: Core.FormField;
    isClosedStatus: Core.FormField;
    notifyTaskLeadOnSet: Core.FormField;
    notifyTaskAdminOnSet: Core.FormField;
    notifyPrimaryContributorOnSet: Core.FormField;
    notifyQAResourceOnSet: Core.FormField;
  }

  export interface StatusConfiguration {
    id: string;
    key: string;
    name: string;
    description: string;
    options: StatusOption[];
  }

  export interface StatusOption {
    id: string;
    name: string;
    key: string;
    instructions: string;
    description: string;
    canBillTime: boolean;
    isDefaultStatus: boolean;
    isClosedStatus: boolean;
    isArchived: boolean;
    notifyTaskLeadOnSet: boolean;
    notifyPrimaryContributorOnSet: boolean;
    notifyTaskAdminOnSet: boolean;
    notifyQAResourceOnSet: boolean;
    validTransitions: StatusTransition[];
  }

  export interface StatusTransitionView {
    name: Core.FormField;
    key: Core.FormField;
    status: Core.FormField;
    whoPerforms: Core.FormField;
    trigger: Core.FormField;
  }

  export interface StatusTransition {
    id: string;
    name: string;
    key: string;
    status: Core.EntityHeader;
    whoPerforms: string;
    trigger: string;
  }

  export enum ActionTypes {
  Create,
  Update,
  Delete
}

  export interface ExternalWorkTask {
  actionType: ActionTypes;
  databaseName: string;
  entityType: string;
  id: string;
  repeatPath: string;
  details: string;
  acceptanceCriteria: string;
  systemInformation: string;
  archived: boolean;
  aLMIntegration: Core.EntityHeader;
  ownerOrganization: Core.EntityHeader;
  ownerUser: Core.EntityHeader;
  isPublic: boolean;
  creationDate: string;
  lastUpdatedDate: string;
  externalTaskCode: string;
  externalTaskLink: string;
  externalWorkItemType: string;
  externalId: string;
  title: string;
  description: string;
  priority: string;
  oldState: string;
  newState: string;
  externalProjectName: string;
}

  export interface ExternalWorkTaskSummary {
    selected: boolean;
    id: string;
    name: string;
    description: string;
    details: string;
    importDate: string;
    assignedTo: string;
    newState: string;
    oldState: string;
    actionType: string;
    externalTaskCode: string;
    externalTaskLink: string;
    externalWorkItemType: string;
    externalProjectName: string;
    externalId: string;
    creationDate: string;
    archived: boolean;
  }
}
