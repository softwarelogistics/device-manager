
import { NuviotClientService } from './nuviot-client.service';


export class SiteContentService {
  constructor(private nuviotClient: NuviotClientService) {
  }

  getPublicContentItemsByKey(contentTypeKey: string) : Promise<SiteContent.SiteContent[]> {
    return this.nuviotClient.request<SiteContent.SiteContent[]>(`/api/sitecontent/public/${contentTypeKey}/all`);
  }

  getPublicContentItemByKey(contentTypeKey: string) : Promise<SiteContent.SiteContent> {
    return this.nuviotClient.request<SiteContent.SiteContent>(`/api/sitecontent/${contentTypeKey}/public`);
  }

  getAllSiteContent() : Promise<SiteContent.SiteContentSummary[]> {
    return this.nuviotClient.request<SiteContent.SiteContentSummary[]>('/api/sitecontent/all');
  }

  createSiteContent() : Promise<SiteContent.SiteContent> {
    return this.nuviotClient.request<SiteContent.SiteContent>('/api/sitecontent/factory');
  }

  getSiteContent(id: string) : Promise<SiteContent.SiteContent> {
    return this.nuviotClient.request(`/api/sitecontent/${id}`);
  }

  addSiteContent(glossary: SiteContent.SiteContent) {
    return this.nuviotClient.post('/api/sitecontent', glossary)
  }

  updateSiteContent(glossary: SiteContent.SiteContent) {
    return this.nuviotClient.update('/api/sitecontent', glossary)
  }

  contentTypes() : Promise<Core.PickerOption[]> {
    return this.nuviotClient.request<Core.PickerOption[]>('/api/sitecontent/contenttypes')
  }

  deleteSiteContent(id: string) {
    return this.nuviotClient.delete(`/api/sitecontent/${id}`);
  }
}
