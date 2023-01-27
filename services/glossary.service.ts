
import { NuviotClientService } from './nuviot-client.service';


export class GlossaryService {

  constructor(private nuviotClient: NuviotClientService) {

  }

  getGlossaries() : Promise<Glossary.GlossarySummary[]> {
    return this.nuviotClient.request<Glossary.GlossarySummary[]>('/api/glossaries');
  }

  createGlossary() : Promise<Core.FormResult<Glossary.Glossary, Glossary.GlossaryView>> {
    return this.nuviotClient.request<Core.FormResult<Glossary.Glossary, Glossary.GlossaryView>>('/api/glossary/factory');
  }

  getGlossary(id: string) : Promise<Core.FormResult<Glossary.Glossary, Glossary.GlossaryView>> {
    return this.nuviotClient.request(`/api/glossary/${id}`);
  }

  addGlossary(glossary: Glossary.Glossary) {
    return this.nuviotClient.post('/api/glossary', glossary)
  }

  addNewGlossary(glossary: Glossary.Glossary) {
    return this.nuviotClient.post('/api/glossary', glossary)
  }

  updateGlossary(glossary: Glossary.Glossary) {
    return this.nuviotClient.update('/api/glossary', glossary)
  }

}
