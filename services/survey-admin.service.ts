
import { NuviotClientService } from './nuviot-client.service';


export class SurveyAdminService {
  constructor(private nuviotClient: NuviotClientService) {
  }

  createSurvey() : Promise<Core.FormResult<Planner.Survey, Planner.SurveyView>> {
    return this.nuviotClient.getFormResponse('/api/surveyadmin/factory');
  }

  getSurvey(id: string) : Promise<Core.FormResult<Planner.Survey, Planner.SurveyView>> {
    return this.nuviotClient.getFormResponse(`/api/surveyadmin/${id}`);
  }

  createQuestionSet() : Promise<Core.FormResult<Planner.SurveyQuestionSet, Planner.SurveyQuestionSetView>> {
    return this.nuviotClient.getFormResponse('/api/surveyadmin/questionset/factory');
  }

  createSurveyQuestion() : Promise<Core.FormResult<Planner.SurveyQuestion, Planner.SurveyQuestionView>> {
    return this.nuviotClient.getFormResponse('/api/surveyadmin/question/factory');
  }

  createSurveyAnswer() : Promise<Core.FormResult<Planner.SurveyAnswerChoice, Planner.SurveyAnswerChoiceView>> {
    return this.nuviotClient.getFormResponse('/api/surveyadmin/answer/factory');
  }

  insertSurvey(survey: Planner.Survey) : Promise<Core.InvokeResult> {
    return this.nuviotClient.post('/api/surveyadmin', survey);
  }

  updateSurvey(survey: Planner.Survey) : Promise<Core.InvokeResult> {
    return this.nuviotClient.update('/api/surveyadmin', survey);
  }
}
