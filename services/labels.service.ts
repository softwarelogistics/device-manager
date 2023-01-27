import { NuviotClientService } from './nuviot-client.service';



export class LabelsService {
  constructor(private nuviotClient: NuviotClientService) {
  }

  getLabeledEntities(id: string): Promise<Core.ListResponse<Core.LabeledEntity>> {
    return this.nuviotClient.request(`/api/label/entities/${id}`);
  }

  getLabelSetForOrg(): Promise<Core.InvokeResultEx<Core.LabelSet>> {
    return this.nuviotClient.request(`/api/labelset`);
  }

  addLabel(label: Core.Label): Promise<Core.InvokeResultEx<Core.LabelSet>> {
    return this.nuviotClient.postWithResponse<Core.Label, Core.LabelSet>('/api/label', label);
  }

  updateLabel(label: Core.Label): Promise<Core.InvokeResultEx<Core.LabelSet>> {
    return this.nuviotClient.updateWithResponse<Core.Label, Core.LabelSet>('/api/label', label);
  }
}
