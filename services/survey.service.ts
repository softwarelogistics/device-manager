
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs';
import { NuviotClientService } from './nuviot-client.service';


export class SurveyService {
  private _currentSurvey: Planner.Survey;
  private _allSurveys: Planner.SurveySummary[];
  private _currentQuestion: Planner.SurveyQuestion;

  protected _currentSurvey$ = new ReplaySubject<Planner.Survey>();
  protected _allSurveys$ = new ReplaySubject<Planner.SurveySummary[]>();
  protected _currentQuestion$ = new ReplaySubject<Planner.SurveyQuestion>();

  constructor(private nuviotClient: NuviotClientService) {
  }

  /**
   * Get a list of top level surveys that can be taken
   */
  public getAvailableSurveys(): Promise<Planner.SurveySummary[]> {
    return this.nuviotClient.request<Planner.SurveySummary[]>('/api/surveys');
  }

  /**
   * Get a list of top level surveys that can be taken
   */
  public loadAllSurveys(): Promise<Core.ListResponse<Planner.SurveySummary>> {
    console.log('requesting');
    return this.nuviotClient.getListResponse<Planner.SurveySummary>('/api/surveyadmin/surveys');
  }

  /**
   * Create a top level survey for an org
   * @param surveyeId
   */
  public createSurvey(surveyId: string): Promise<Core.InvokeResultEx<Planner.SurveyResponse>> {
    return this.nuviotClient.requestForInvokeResultEx<Planner.SurveyResponse>(`/api/survey/${surveyId}/factory`);
  }

  /**
   * get or create a survey for user based upon survey key.
   * @param surveyKey
   * @returns
   */
  public getOrCreateASurveyForUser(surveyKey: string): Promise<Core.InvokeResultEx<Planner.SurveyResponse>> {
    return this.nuviotClient.requestForInvokeResultEx<Planner.SurveyResponse>(`/api/survey/user/${surveyKey}?autocreate=true`);
  }

  /**
   * get or create a survey for user based upon survey key.
   * @param surveyKey
   * @returns
   */
   public getSurveyForUser(surveyKey: string): Promise<Core.InvokeResultEx<Planner.SurveyResponse>> {
    return this.nuviotClient.requestForInvokeResultEx<Planner.SurveyResponse>(`/api/survey/user/${surveyKey}`);
  }

  /**
   * Create a survey that is attached to a parent survey via a question
   * @param surveyId
   * @param topLevelSureyResponseId
   * @param parentSurveyResponseId
   * @param questionId
   * @param index
   */
  public createChildSurvey(surveyId: string, topLevelSureyResponseId: string, parentSurveyResponseId: string,
    questionId: string, index: number): Promise<Core.InvokeResultEx<Planner.SurveyResponse>> {
    return this.nuviotClient.requestForInvokeResultEx<Planner.SurveyResponse>(
      `/api/survey/${surveyId}/${topLevelSureyResponseId}/${parentSurveyResponseId}/${questionId}/${index}/factory`);
  }

  /**
   * Get all surveys for a given org
   */
  public getSurveysForCurrentOrg(): Promise<Planner.SurveyResponse[]> {
    return this.nuviotClient.request<Planner.SurveyResponse[]>(`/api/survey/responses`);
  }

  /**
   * Complete a survey with top level id
   */
  public completeSurvey(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.request(`/api/survey/${id}/complete`);
  }

   /**
   * Complete a child survey with top level id and child.
   */
    public completeChildSurvey(id: string, childSurveyId): Promise<Core.InvokeResult> {
      return this.nuviotClient.request(`/api/survey/${id}/${childSurveyId}/complete`);
    }

  /**
   * Get all surveys for a given user
   */
  public getSurveysForUser(id: string): Promise<Planner.SurveyResponse[]> {
    return this.nuviotClient.request<Planner.SurveyResponse[]>(`/api/survey/responses/user/${id}`);
  }

  /**
   * Get a specific survey for an org
   * @param id - Row Key of the Survey Id
   */
  public getSurveyResponse(topLevelResponseId: string, responseId: string): Promise<Planner.SurveyDetail> {
    if (topLevelResponseId !== responseId) {
      return this.nuviotClient.request<Planner.SurveyDetail>(`/api/survey/response/${topLevelResponseId}/${responseId}`);
    } else {
      return this.nuviotClient.request<Planner.SurveyDetail>(`/api/survey/response/${responseId}`);
    }
  }

  /**
   * Get a specific survey for an org
   * @param parentSurveyId - id of the parent survey id.
   * @param id - Id of the child survey result record.
   */
  public getChildSurveyResult(parentSurveyId: string, id: string): Promise<Planner.SurveyResponse> {
    return this.nuviotClient.request<Planner.SurveyResponse>(`/api/survey/response/${parentSurveyId}/${id}`);
  }

  /**
  * Get a list of child surveys attached to a parent for a specific question
  * @param topLevelSurveyResponseId
  * @param surveyResultId
  * @param questionId
  */
  public getChildSurveys(topLevelSurveyResponseId: string, parentSurveyResultId: string, questionId: string): Promise<Planner.SurveyResponse[]> {
    return this.nuviotClient.request<Planner.SurveyResponse[]>(`/api/survey/${topLevelSurveyResponseId}/${parentSurveyResultId}/${questionId}/children `);
  }

  /**
   * Get a survey with all it's questions
   * @param surveyId Id of the Survey Template
   */
  public getSurveyTemplate(surveyId: string): Promise<Planner.Survey> {
    return this.nuviotClient.request<Planner.Survey>(`/api/survey/template/${surveyId}`);
  }

  /**
   * Delete a top level and all the child surveys
   * @param orgId Org that has the survey
   * @param id survey result id
   */
  public deleteSurvey(orgId: string, id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/survey/${orgId}/${id}`);
  }

  /**
   * Delete a child survey attached to a parent via a question
   * @param parentSurveyId
   * @param id
   */
  public deleteChildSurvey(parentSurveyId: string, id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/survey/${parentSurveyId}/child/${id}`);
  }

  /**
   * Get an answer for a question
   * @param surveyResultId
   * @param surveyQuestionId
   */
  public getAnswers(surveyResultId: string, surveyQuestionId: string): Promise<Planner.SurveyResponseAnswer[]> {
    return this.nuviotClient.request<Planner.SurveyResponseAnswer[]>(`/api/survey/result/answer/${surveyResultId}/${surveyQuestionId}`);
  }

  /**
   * Update the survey and question
   * @param surveyResult current survey result (could be a child)
   * @param questionId Id of the question that is updated.
   * @param answers list of answers for the given question
   */
  public updateSurveyAnswer(surveyResponse: Planner.SurveyResponse, questionId: string,
    answers: Planner.SurveyResponseAnswer[]): Promise<Core.InvokeResult> {
    const survayAnswerupdate: Planner.SurveyAnswerUpdate = {
      surveyResponse: surveyResponse,
      questionId: questionId,
      surveyResponseAnswers: answers,
    };

    return this.nuviotClient.update<Planner.SurveyAnswerUpdate>('/api/survey/answer', survayAnswerupdate);
  }

  /**
   * Update current survey
   * @param surveyResult
   */
  public updateSurvey(surveyResult: Planner.SurveyResponse): Promise<Core.InvokeResult> {
    return this.nuviotClient.update<Planner.SurveyResponse>('/api/survey', surveyResult);
  }

  /**
   * Can be called at any time to set a current question on a survey
   * @param orgId - Org ID for survey
   * @param surveyResultId - Survey Result Id
   * @param questionId - Question Id
   */
  public setSurveyCurrentQuestion(topLevelSurveyResponseId: string, currentResponseId: string,
    questionId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.request<Core.InvokeResult>(
      `/api/survey/status/${topLevelSurveyResponseId}/${currentResponseId}/${questionId}`);
  }

  /**
   * Get all the answers for a survey
   * @param surveyResultId -Survey Result Id
   */
  public getAllAnswersForSurvey(surveyResultId: string): Promise<Planner.SurveyResponseAnswer[]> {
    return this.nuviotClient.request<Planner.SurveyResponseAnswer[]>(`/api/survey/result/answer/${surveyResultId}`);
  }

  onCurrentQuestion(): Observable<Planner.SurveyQuestion> {
    return this._currentQuestion$.asObservable();
  }

  getCurrentQuestion(): Planner.SurveyQuestion {
    return this._currentQuestion;
  }

  onSurvey(): Observable<Planner.Survey> {
    return this._currentSurvey$.asObservable();
  }

  getCurrentSurvey(): Planner.Survey {
    return this._currentSurvey;
  }

  onAllSurvey(): Observable<Planner.SurveySummary[]> {
    return this._allSurveys$.asObservable();
  }

  getAllSurveys(): Planner.SurveySummary[] {
    return this._allSurveys;
  }
}
