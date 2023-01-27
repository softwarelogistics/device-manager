
import { NuviotClientService } from './nuviot-client.service';


export class ProjectManagementService {

  constructor(private nuviotClient: NuviotClientService) {
  }

  public getProjects(): Promise<Core.ListResponse<Planner.ProjectSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.ProjectSummary>>('/api/projects');
  }

  public getActiveProjects(): Promise<Core.ListResponse<Planner.ProjectSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.ProjectSummary>>('/api/projects/active');
  }

  public newModule(): Promise<Core.FormResult<Planner.Module, Planner.ModuleView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.Module, Planner.ModuleView>>(`/api/project/module/factory`);
  }

  public newProject(): Promise<Core.FormResult<Planner.Project, Planner.ProjectView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.Project, Planner.ProjectView>>(`/api/project/factory`);
  }

  public loadProject(id: string): Promise<Core.FormResult<Planner.Project, Planner.ProjectView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.Project, Planner.ProjectView>>(`/api/project/${id}`);
  }

  public insertProject(project: Planner.Project): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert('/api/project', project);
  }

  public updateProject(project: Planner.Project): Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/project', project);
  }

  public newProjectTeamMember(): Promise<Core.FormResult<Planner.TeamMember, Planner.TeamMemberView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.TeamMember, Planner.TeamMemberView>>(`/api/pm/teammember/factory`);
  }

  public deleteProject(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/project/${id}`);
  }

  public getSprints(projectid: string): Promise<Core.ListResponse<Planner.Sprint>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.Sprint>>(`/api/project/${projectid}/sprints`);
  }

  public newSprint(projectid: string): Promise<Core.FormResult<Planner.Sprint, Planner.SprintView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.Sprint, Planner.SprintView>>(`/api/project/${projectid}/sprint/factory`);
  }

  public getSprint(sprintid: string): Promise<Core.FormResult<Planner.Sprint, Planner.SprintView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.Sprint, Planner.SprintView>>(`/api/project/sprint/${sprintid}`);
  }

  public insertSprint(sprint: Planner.Sprint): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert('/api/project/sprint', sprint);
  }

  public updateSprint(sprint: Planner.Sprint): Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/project/sprint', sprint);
  }

  public getCustomKanbanViews(): Promise<Core.ListResponse<Planner.KanbanView>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.KanbanView>>(`/api/pm/kanbanviews`);
  }

  public getCustomKanbanView(id: string): Promise<Core.FormResult<Planner.KanbanView, Planner.KanbanViewView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.KanbanView, Planner.KanbanViewView>>(`/api/pm/kanbanview/${id}`);
  }

  public createCustomKanbanView(): Promise<Core.FormResult<Planner.KanbanView, Planner.KanbanViewView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.KanbanView, Planner.KanbanViewView>>(`/api/pm/kanbanview/factory`);
  }

  public addCustomKanbanView(model: Planner.KanbanView): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert(`/api/pm/kanbanview`, model);
  }

  public updateCustomKanbanView(model: Planner.KanbanView): Promise<Core.InvokeResult> {
    return this.nuviotClient.update(`/api/pm/kanbanview`, model);
  }

  public deleteCustomKanbanView(id: Planner.KanbanView): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/pm/kanbanview/${id}`);
  }


  public getTasksForKanbanView(id: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/view/${id}`);
  }

  public getTasks(id: string, status: string = 'all'): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    if (status === 'all') {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/project/${id}`);
    } else {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/project/${id}/${status}`);
    }
  }

  public updateTaskStatus(taskId: string, status: string): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.WorkTask>>(`/api/pm/task/${taskId}/status/${status}`);
  }

  public updateTaskStatusAndAssignedTo(taskId: string, update: Planner.WorkTaskAssignmentStatusUpdate): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.WorkTaskAssignmentStatusUpdate, Planner.WorkTask>(`/api/pm/task/${taskId}/boardupdate`, update);
  }

  public getTasksAssignedToUser(userId: string, status: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    if (status === 'all') {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/assignedto/${userId}`);
    } else {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/assignedto/${userId}/${status}`);
    }
  }

  public getTasksForSprint(id: string, sprintid: string, status: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    if (status === 'all') {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/sprint/${sprintid}`);
    } else {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/sprint/${sprintid}/${status}`);
    }
  }

  public getTasksForProjectForCurrentSprint(projectid: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
      return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/project/${projectid}/sprint/current`);
  }

  public newTask(projectid: string | undefined = undefined): Promise<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>> {
    if (projectid) {
      return this.nuviotClient.request<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>>(`/api/pm/task/project/${projectid}/factory`);
    } else {
      return this.nuviotClient.request<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>>(`/api/pm/task/factory`);
    }
  }

  public createTask(newTaskRequest: Planner.NewTask): Promise<Core.InvokeResultEx<Planner.WorkTaskSummary>> {
    return this.nuviotClient.postWithResponse<Planner.NewTask, Planner.WorkTaskSummary>(`/api/tasks/add`, newTaskRequest);
  }

  public workTaskToSummary(workTask: Planner.WorkTask): Planner.WorkTaskSummary | undefined {
    return undefined;
  }

  public getTaskTemplates(): Promise<Core.ListResponse<Planner.TaskTemplateSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.TaskTemplateSummary>>(`/api/pm/task/templates`);
  }

  public newTaskTemplate(): Promise<Core.FormResult<Planner.TaskTemplate, Planner.TaskTemplateView>> {
    return this.nuviotClient.getFormResponse<Planner.TaskTemplate, Planner.TaskTemplateView>(`/api/pm/task/template/factory`);
  }

  public getTaskTemplate(id: string): Promise<Core.FormResult<Planner.TaskTemplate, Planner.TaskTemplateView>> {
    return this.nuviotClient.getFormResponse<Planner.TaskTemplate, Planner.TaskTemplateView>(`/api/pm/task/template/${id}`);
  }

  public deleteTaskTemplate(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`api/pm/task/template/${id}`);
  }

  public createTaskTemplate(): Promise<Core.FormResult<Planner.TaskTemplate, Planner.TaskTemplateView>> {
    return this.nuviotClient.getFormResponse<Planner.TaskTemplate, Planner.TaskTemplateView>(`/api/pm/task/template/factory`);
  }

  public addTaskTemplate(template: Planner.TaskTemplate): Promise<Core.InvokeResult> {
    return this.nuviotClient.post(`/api/pm/task/template`, template);
  }

  public updateTaskTemplate(template: Planner.TaskTemplate): Promise<Core.InvokeResult> {
    return this.nuviotClient.update(`/api/pm/task/template`, template);
  }

  public newTaskForSprint(projectid: string, sprintid: string): Promise<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>>(`/api/pm/task/project/${projectid}/sprint/${sprintid}/factory`);
  }

  public insertTask(task: Planner.WorkTask): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert('/api/pm/task', task);
  }

  public getTask(taskId: string): Promise<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.WorkTask, Planner.WorkTaskView>>(`/api/pm/task/${taskId}`);
  }

  public updateTask(task: Planner.WorkTask): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse('/api/pm/task', task);
  }

  public updateTaskFromExternalItem(task: Planner.WorkTaskUpdateFromExternalItem): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse('/api/pm/task/externalupdate', task);
  }

  public updateTaskDetail(task: Planner.WorkTask): Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/pm/task/detail', task);
  }

  public updateTaskForKnownActivity(task: Planner.WorkTask, activityType: string, activityId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.update(`/api/pm/task/${activityType}/${activityId}`, task);
  }

  public requestUpdate(taskId: string, memberId: string, note: Core.SimpleNote): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Core.SimpleNote, Planner.WorkTask>(`/api/pm/task/${taskId}/teammember/${memberId}/ping`, note);
  }

  public deleteTask(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/pm/task/${id}`);
  }

  public newSubTask(): Promise<Core.FormResult<Planner.SubTask, Planner.SubTaskView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.SubTask, Planner.SubTaskView>>(`/api/pm/subtask/factory`);
  }

  public newHelpResource(): Promise<Core.FormResult<Planner.HelpResource, Planner.HelpResourceView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.HelpResource, Planner.HelpResourceView>>(`/api/pm/helpresource/factory`);
  }

  public newExpectedOutcome(): Promise<Core.FormResult<Planner.ExpectedOutcome, Planner.ExpectedOutcomeView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.ExpectedOutcome, Planner.ExpectedOutcomeView>>(`/api/pm/expectedoutcome/factory`);
  }

  public insertReportSettings(settings: Planner.TaskReportSettings): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert('/api/pm/tasks/report/settings', settings);
  }

  public getReportSettingForOrg(): Promise<Core.ListResponse<Planner.TaskReportSettingsSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.TaskReportSettingsSummary>>(`/api/pm/tasks/report/settings`);
  }

  public createNewReportSettings(): Promise<Planner.TaskReportSettings> {
    return this.nuviotClient.request<Planner.TaskReportSettings>(`/api/pm/tasks/report/settings/factory`);
  }

  public getReportSettings(id: string): Promise<Core.InvokeResultEx<Planner.TaskReportSettings>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.TaskReportSettings>>(`/api/pm/tasks/report/settings/${id}`);
  }

  public updateReportSettings(settings: Planner.TaskReportSettings): Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/pm/tasks/report/settings', settings);
  }

  public getTasksByStatus(status: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/${status}`);
  }

  public getTasksForProjectByStatus(projectId: string, status: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/project/${projectId}/${status}`);
  }

  public getActiveTasks(): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/active`);
  }

  public getActiveTasksForProject(projectId: string): Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Planner.WorkTaskSummary>>(`/api/pm/tasks/active/project/${projectId}`);
  }

  public newToDo(): Promise<Core.FormResult<Planner.ToDo, Planner.ToDoView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.ToDo, Planner.ToDoView>>(`/api/pm/todo/factory`);
  }

  public getToDo(id: string): Promise<Core.FormResult<Planner.ToDo, Planner.ToDoView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.ToDo, Planner.ToDoView>>(`/api/pm/todo/${id}`);
  }

  public insertToDo(todo: Planner.ToDo): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert('/api/pm/todo', todo);
  }

  public updateToDo(todo: Planner.ToDo): Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/pm/todo', todo);
  }

  public deleteToDo(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/pm/todo/${id}`);
  }

  public getToDosAssignedTo(id: string, openOnly: boolean): Promise<Core.ListResponse<Planner.ToDo>> {
    let uri = `/api/pm/todo/assignedto/${id}`;
    if (openOnly) {
      uri += '/open';
    }

    return this.nuviotClient.request<Core.ListResponse<Planner.ToDo>>(uri);
  }

  public getToDosAssignedBy(id: string, openOnly: boolean): Promise<Core.ListResponse<Planner.ToDo>> {
    let uri = `/api/pm/todo/assignedby/${id}`;
    if (openOnly) {
      uri += '/open';
    }

    return this.nuviotClient.request<Core.ListResponse<Planner.ToDo>>(uri);
  }

  public addIssue(taskid: string, issue: Planner.WorkTaskIssue):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.WorkTaskIssue, Planner.WorkTask>(
      `/api/pm/task/${taskid}/issue`, issue);
  }

  public updateIssue(taskid: string, issue: Planner.WorkTaskIssue):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.WorkTaskIssue, Planner.WorkTask>(
      `/api/pm/task/${taskid}/issue`, issue);
  }

  public removeIssue(taskid: string, issueId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/issue/${issueId}`);
  }

  public addTeamMember(taskid: string, teamMember: Planner.TeamMember):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.TeamMember, Planner.WorkTask>(
      `/api/pm/task/${taskid}/teamMember`, teamMember);
  }

  public updateTeamMember(taskid: string, teamMember: Planner.TeamMember):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.TeamMember, Planner.WorkTask>(
      `/api/pm/task/${taskid}/teamMember`, teamMember);
  }

  public removeTeamMember(taskid: string, teamMemberId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/teammember/${teamMemberId}`);
  }

  public addSubTask(taskid: string, subTask: Planner.SubTask):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.SubTask, Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask`, subTask);
  }

  public updateSubTask(taskid: string, subTask: Planner.SubTask):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.SubTask, Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask`, subTask);
  }

  public removeSubTask(taskid: string, subTaskId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask/${subTaskId}`);
  }

  public applyTemplate(taskId: string, templateId: string) {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.WorkTask>>(`/api/pm/task/${taskId}/template/${templateId}/apply`);
  }

  public moveSubTaskUp(taskId: string, subTaskId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.WorkTask>>(`/api/pm/task/${taskId}/subtask/${subTaskId}/moveup`)
  }

  public moveSubTaskDown(taskId: string, subTaskId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.WorkTask>>(`/api/pm/task/${taskId}/subtask/${subTaskId}/movedown`)
  }

  public addDiscussion(taskid: string, discussion: Planner.WorkTaskDiscussion):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.WorkTaskDiscussion, Planner.WorkTask>(
      `/api/pm/task/${taskid}/note`, discussion);
  }

  public updateDiscussion(taskid: string, discussion: Planner.WorkTaskDiscussion):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.WorkTaskDiscussion, Planner.WorkTask>(
      `/api/pm/task/${taskid}/note`, discussion);
  }

  public removeDiscussion(taskid: string, discussionId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/note/${discussionId}`);
  }

  public addRisk(taskid: string, risk: Planner.Risk):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.Risk, Planner.WorkTask>(
      `/api/pm/task/${taskid}/risk`, risk);
  }

  public updateRisk(taskid: string, risk: Planner.Risk):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.Risk, Planner.WorkTask>(
      `/api/pm/task/${taskid}/risk`, risk);
  }

  public removeRisk(taskid: string, riskId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/risk/${riskId}`);
  }

  public addLabel(taskid: string, label: Core.Label):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Core.Label, Planner.WorkTask>(
      `/api/pm/task/${taskid}/label`, label);
  }

  public removeLabel(taskid: string, labelid: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/label/${labelid}`);
  }

  public addHelpResources(taskid: string, helpResource: Planner.HelpResource):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.HelpResource, Planner.WorkTask>(
      `/api/pm/task/${taskid}/helpresource`, helpResource);
  }

  public updateHelpResource(taskid: string, helpResource: Planner.HelpResource):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.HelpResource, Planner.WorkTask>(
      `/api/pm/task/${taskid}/helpresource`, helpResource);
  }

  public removeResource(taskid: string, helpResourceId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/helpresource/${helpResourceId}`);
  }

  public addSubTaskHelpResources(taskid: string, subTaskId: string, helpResource: Planner.HelpResource):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.HelpResource, Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask/${subTaskId}/helpresource`, helpResource);
  }

  public updateSubTaskHelpResource(taskid: string, subTaskId: string, helpResource: Planner.HelpResource):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.HelpResource, Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask/${subTaskId}/helpresource`, helpResource);
  }

  public removeSubTaskResource(taskid: string, subTaskId: string, helpResourceId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/subtask/${subTaskId}/helpresource/${helpResourceId}`);
  }

  public addExpectedOutcome(taskid: string, expectedOutcome: Planner.ExpectedOutcome):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.ExpectedOutcome, Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome`, expectedOutcome);
  }

  public updateExpectedOutcome(taskid: string, expectedOutcome: Planner.ExpectedOutcome):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.ExpectedOutcome, Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome`, expectedOutcome);
  }

  public removeExpectedOutcome(taskid: string, expectedOutcomeId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome/${expectedOutcomeId}`);
  }

  public addVerificationRun(taskid: string, expectedoutcomeid: string, verificationRun: Planner.VerificationRun):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.VerificationRun, Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome/${expectedoutcomeid}/verificationrun`, verificationRun);
  }

  public updateVerificationRun(taskid: string, expectedoutcomeid: string, verificationRun: Planner.VerificationRun):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.VerificationRun, Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome/${expectedoutcomeid}/verificationrun`, verificationRun);
  }

  public updateVerificationSteps(taskid: string, expectedoutcomeid: string, verificationSteps: Planner.VerificationStep[]):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.VerificationStep[], Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome/${expectedoutcomeid}/verificationsteps`, verificationSteps);
  }

  public deleteVerificationRun(taskid: string, expectedoutcomeid: string, verificationRunId: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(
      `/api/pm/task/${taskid}/expectedoutcome/${expectedoutcomeid}/verificationrun/${verificationRunId}`);
  }

  public updateAdditionalInformation(taskId: string, additionalInformation: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.updateWithResponse<Planner.AdditionalInformation, Planner.WorkTask>(
      `/api/pm/task/${taskId}/additionalinformation`, { contents: additionalInformation });
  }

  public flagTask(taskId: string, reason: string, notes: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    const flagTaskRequest = {
      workTaskId: taskId,
      reason: reason,
      notes: notes,
    };

    return this.nuviotClient.post<Planner.FlagTaskRequest, Planner.WorkTask>('/api/pm/task/flag', flagTaskRequest);
  }

  public getFlaggedTasks():
    Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.getListResponse("/api/pm/task/flagged");
  }

  public getLateTasks():
    Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.getListResponse("/api/pm/task/late");
  }

  public getTasksWithOpenIssues():
    Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.getListResponse("/api/pm/tasks/openissue");
  }

  public getTasksWithRisks():
    Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.getListResponse("/api/pm/tasks/openrisks");
  }

  public getBlockedTasks():
    Promise<Core.ListResponse<Planner.WorkTaskSummary>> {
    return this.nuviotClient.getListResponse("/api/pm/tasks/blocked");
  }

  public updateDueDate(taskId: string, dueDate: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Planner.WorkTask>>(`/api/pm/task/${taskId}/duedate/${dueDate}`);
  }

  public updateFlagTask(taskId: string, flagId: string, isOpen: boolean, reason: string, notes: string):
    Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    const flagTaskRequest = {
      workTaskId: taskId,
      flaggedTaskId: flagId,
      reason: reason,
      notes: notes,
      isOpen: isOpen,
    };

    return this.nuviotClient.updateWithResponse<Planner.FlaggedTaskUpdateRequest, Planner.WorkTask>('/api/pm/task/flag', flagTaskRequest);
  }

  public removeAttachmentFromTask(taskId: string, attachmentId: string) {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskId}/attachment/${attachmentId}`);
  }

  public removeAttachment(taskId: string, parentType: string, parentId: string, attachmentId: string) {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskId}/${parentType}/${parentId}/attachment/${attachmentId}`);
  }


  public addIssueNote(taskid: string, issueid: string, issueNote: Planner.WorkTaskIssueNote): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.postWithResponse<Planner.WorkTaskIssueNote, Planner.WorkTask>(`/api/pm/task/${taskid}/issue/${issueid}/note`, issueNote);
  }

  public removeIssueNote(taskid: string, issueid: string, issuenoteid: string): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskid}/issue/${issueid}/note/${issuenoteid}`);
  }


  public addUpstreamTask(taskid: string, upstreamtaskid: string): Promise<Planner.WorkTask> {
    return this.nuviotClient.request<Planner.WorkTask>(`/api/pm/task/${taskid}/upstream/${upstreamtaskid}`);
  }

  public addDownstreamTask(taskid: string, downstreamtaskid: string): Promise<Planner.WorkTask> {
    return this.nuviotClient.request<Planner.WorkTask>(`/api/pm/task/${taskid}/downstream/${downstreamtaskid}`);
  }

  public addRelatedTask(taskid: string, relatedtaskid: string): Promise<Planner.WorkTask> {
    return this.nuviotClient.request<Planner.WorkTask>(`/api/pm/task/${taskid}/related/${relatedtaskid}`);
  }


  public removeUpstreamTask(taskid: string, upstreamtaskid: string): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskid}/upstream/${upstreamtaskid}`);
  }

  public removeDownstreamTask(taskid: string, downstreamtaskid: string): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskid}/downstream/${downstreamtaskid}`);
  }

  public removeRelatedTask(taskid: string, relatedtaskid: string): Promise<Core.InvokeResultEx<Planner.WorkTask>> {
    return this.nuviotClient.deleteWithResponse<Planner.WorkTask>(`/api/pm/task/${taskid}/related/${relatedtaskid}`);
  }

  public searchTasks(projectId: string, query: string) {
    return this.nuviotClient.postForListResponse<Planner.WorkTaskSearchRequest, Planner.WorkTaskSummary>('/api/pm/task/search',
      {
        query: query,
        projectId: projectId,
      });
  }

  public async deleteStatusConfigurations(id: string): Promise<Core.InvokeResult> {
    return await this.nuviotClient.delete(`/api/pm/statusconfiguration/${id}`);
  }

  public async getStatusConfigurations(): Promise<Core.ListResponse<Planner.StatusConfiguration>> {
    return await this.nuviotClient.getListResponse<Planner.StatusConfiguration>(`/api/pm/statusconfigurations`);
  }

  public async getStatusConfiguration(id: string): Promise<Core.FormResult<Planner.StatusConfiguration, Planner.StatusConfigurationView>> {
    return await this.nuviotClient.getFormResponse<Planner.StatusConfiguration, Planner.StatusConfigurationView>(`/api/pm/statusconfiguration/${id}`);
  }

  public async addStatusConfigurations(statusConfig: Planner.StatusConfiguration): Promise<Core.InvokeResult> {
    return await this.nuviotClient.insert<Planner.StatusConfiguration>(`/api/pm/statusconfiguration`, statusConfig);
  }

  public async updateStatusConfigurations(statusConfig: Planner.StatusConfiguration): Promise<Core.InvokeResult> {
    return await this.nuviotClient.update<Planner.StatusConfiguration>(`/api/pm/statusconfiguration`, statusConfig);
  }

  public createStatusConfiguration(): Promise<Core.FormResult<Planner.StatusConfiguration, Planner.StatusConfigurationView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.StatusConfiguration, Planner.StatusConfigurationView>>(`/api/pm/statusconfiguration/factory`);
  }

  public createStatusOption(): Promise<Core.FormResult<Planner.StatusOption, Planner.StatusOptionView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.StatusOption, Planner.StatusOptionView>>(`/api/pm/statusconfiguration/option/factory`);
  }

  public createStatusTransition(): Promise<Core.FormResult<Planner.StatusTransition, Planner.StatusTransitionView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.StatusTransition, Planner.StatusTransitionView>>(`/api/pm/statusconfiguration/statustransition/factory`);
  }

  public async deleteWorkTaskType(id: string): Promise<Core.InvokeResult> {
    return await this.nuviotClient.delete(`/api/pm/statusconfiguration/${id}`);
  }

  public async getWorkTaskTypes(): Promise<Core.ListResponse<Planner.WorkTaskType>> {
    return await this.nuviotClient.getListResponse<Planner.WorkTaskType>(`/api/pm/worktasktypes`);
  }

  public async getWorkTaskType(id: string): Promise<Core.FormResult<Planner.WorkTaskType, Planner.WorkTaskType>> {
    return await this.nuviotClient.getFormResponse<Planner.WorkTaskType, Planner.WorkTaskType>(`/api/pm/worktasktype/${id}`);
  }

  public async addWorkTaskType(workTaskType: Planner.WorkTaskType): Promise<Core.InvokeResult> {
    return await this.nuviotClient.insert<Planner.WorkTaskType>(`/api/pm/worktasktype`, workTaskType);
  }

  public async updateWorkTaskType(workTaskType: Planner.WorkTaskType): Promise<Core.InvokeResult> {
    return await this.nuviotClient.update<Planner.WorkTaskType>(`/api/pm/worktasktype`, workTaskType);
  }

  public createWorkTaskType(): Promise<Core.FormResult<Planner.WorkTaskType, Planner.WorkTaskTypeView>> {
    return this.nuviotClient.request<Core.FormResult<Planner.WorkTaskType, Planner.WorkTaskTypeView>>(`/api/pm/worktasktype/factory`);
  }

  public convertToSummary(task: Planner.WorkTask): Planner.WorkTaskSummary {
    const wts = {
      id: task.id,
      projectId: task.project.id,
      projectName: task.project.text,
      key: task.key,
      canEdit: true,
      isBlocked: false,
      isFlagged: false,
      organizationName: task.ownerOrganization.text,
      name: task.name,
      condition: task.condition.text,
      hasOpenIssues: false,
      taskCode: task.taskCode,
      status: task.status.text,
      statusKey: task.status.key,
      statusId: task.status.key,
      sprint: '',
      sprintId: '',
      module: '',
      moduleId: '',
      externalStatus: '',
      externalStatusId: '',
      dueDate: task.dueDate,
      expectedCloseDate: '',
      description: '',
      assignedToUser: '',
      assignedToUserId: '',
      primaryContributor: '',
      primaryContributorId: '',
      qaResource: '',
      qaResourceId: '',
      hoursUsed: task.hoursUsed,
      hoursEstimate: task.hoursEstimate,
      lastUpdatedDate: task.lastUpdatedDate,
      complexity: task.complexity.text,
      scopeOfEffort: task.scopeOfEffort.text,
      points: 0,
      externalTaskCode: task.externalTaskCode,
      externalTaskLink: task.externalTaskLink,
      labels: task.labels,
      isActive: true,
      rankedOrder: task.rankedOrder,
    };

    if(task.sprint){
      wts.sprintId = task.sprint.id;
      wts.sprint = task.sprint.text;
    }

    if (task.externalStatus) {
      wts.externalStatus = task.externalStatus.text;
      wts.externalStatusId = task.externalStatus.id;
    }

    if (task.assignedByUser) {
      wts.assignedToUser = task.assignedToUser.text;
      wts.assignedToUserId = task.assignedToUser.id;
    }

    if (task.primaryContributorUser) {
      wts.primaryContributorId = task.primaryContributorUser.id;
      wts.primaryContributor = task.primaryContributorUser.text;
    }

    if (task.qaResource) {
      wts.qaResource = task.qaResource.text;
      wts.qaResource = task.qaResource.id;
    }

    return wts;
  }

  public getALMIntegrations(): Promise<Core.ListResponse<Planner.ALMIntegrationSummary>> {
    return this.nuviotClient.getListResponse<Planner.ALMIntegrationSummary>(`/api/alm/integrations`);
  }

  public createALMIntegration(): Promise<Core.FormResult<Planner.ALMIntegration, Planner.ALMIntegrationView>> {
    return this.nuviotClient.getFormResponse<Planner.ALMIntegration, Planner.ALMIntegrationView>(`/api/alm/integration/factory`);
  }

  public getALMIntegration(id: string): Promise<Core.FormResult<Planner.ALMIntegration, Planner.ALMIntegrationView>> {
    return this.nuviotClient.getFormResponse<Planner.ALMIntegration, Planner.ALMIntegrationView>(`/api/alm/integration/${id}`);
  }

  public deleteALMIntegration(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/alm/integration/${id}`);
  }

  public insertALMIntegration(integration: Planner.ALMIntegration): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert<Planner.ALMIntegration>(`/api/alm/integration`, integration);
  }

  public updateALMIntegration(integration: Planner.ALMIntegration): Promise<Core.InvokeResult> {
    return this.nuviotClient.update<Planner.ALMIntegration>(`/api/alm/integration`, integration);
  }

  public getExternalItem(id: string): Promise<Planner.ExternalWorkTask> {
    return this.nuviotClient.request<Planner.ExternalWorkTask>(`/api/alm/external/workitem/${id}`);
  }

  public getALMClientConfiguration(id: string): Promise<Planner.ALMIntegrationAuthDetails> {
    return this.nuviotClient.request<Planner.ALMIntegrationAuthDetails>(`/api/alm/integration/${id}/auth`);
  }

  public getImportedWorkTasks(id: string, nextRowKey: string = ""): Promise<Core.ListResponse<Planner.ExternalWorkTaskSummary>> {
    if (nextRowKey) {
      const listRequest = {
        nextRowKey: nextRowKey,
      };

      return this.nuviotClient.getListResponse<Planner.ExternalWorkTaskSummary>(`/api/alm/devops/workitems/${id}`, listRequest);
    }
    else {
      return this.nuviotClient.getListResponse<Planner.ExternalWorkTaskSummary>(`/api/alm/devops/workitems/${id}`);
    }
  }

  public archiveList(id: string[]): Promise<Core.InvokeResult> {
    return this.nuviotClient.post(`/api/alm/external/workitem/archive`, id);
  }

  public archiveExternalItem(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.get(`/api/alm/external/workitem/${id}/archive`)
  }

  public getWorKTaskByExternalId(id: string): Promise<Planner.WorkTask> {
    return this.nuviotClient.request(`/api/pm/task/externalid/${id}`);
  }
}
