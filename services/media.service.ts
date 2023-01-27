
import { ReplaySubject } from 'rxjs';
import { NuviotClientService } from './nuviot-client.service';


export class MediaService {
  private _mediaLibraries: Media.MediaLibrarySummary[];
  private _mediaLibrary: Media.MediaLibrary;

  private _mediaResoures: Media.MediaResourceSummary[];
  private _mediaResource: Media.MediaResource;

  private _libraries$ = new ReplaySubject<Media.MediaLibrarySummary[]>();
  private _library$ = new ReplaySubject<Media.MediaLibrary>();
  private _resources$ = new ReplaySubject<Media.MediaResourceSummary[]>();
  private _resource$ = new ReplaySubject<Media.MediaResource>();

  constructor(private nuviotClient: NuviotClientService) {
  }

  loadMediaLibraries(): Promise<Media.MediaLibrarySummary[]> {
    const promise = new Promise<Media.MediaLibrarySummary[]>((resolve, reject) => {
      this.nuviotClient.getListResponse<Media.MediaLibrarySummary>(`/api/media/libraries`)
        .then(resp => {
          this.setMediaLibraries(resp.model);
          resolve(resp.model);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadMediaResources(libraryId: string): Promise<Media.MediaResourceSummary[]> {
    const promise = new Promise<Media.MediaResourceSummary[]>((resolve, reject) => {
      this.nuviotClient.getListResponse<Media.MediaResourceSummary>(`/api/media/library/${libraryId}/resources`)
        .then(resp => {
          this.setMediaResources(resp.model);
          resolve(resp.model);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  newMediaLibrary(): Promise<Core.FormResult<Media.MediaLibrary, Media.MediaLibraryView>> {
    return this.nuviotClient.getFormResponse<Media.MediaLibrary, Media.MediaLibraryView>(`/api/media/library/factory`);
  }

  loadMediaLibrary(id: string):  Promise<Core.FormResult<Media.MediaLibrary, Media.MediaLibraryView>> {
    return this.nuviotClient.getFormResponse<Media.MediaLibrary, Media.MediaLibraryView>(`/api/media/library/${id}`);
  }

  insertMediaLibrary(library: Media.MediaLibrary): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert<Media.MediaLibrary>(`/api/media/library`, library)
  }

  updateMediaLibrary(library: Media.MediaLibrary): Promise<Core.InvokeResult> {
    return this.nuviotClient.update<Media.MediaLibrary>(`/api/media/library`, library)
  }

  newMediaResource(): Promise<Core.FormResult<Media.MediaResource, Media.MediaResourceView>> {
    return this.nuviotClient.getFormResponse<Media.MediaResource, Media.MediaResourceView>(`/api/media/resource/factory`);
  }

  loadMediaResource(id: string):  Promise<Core.FormResult<Media.MediaLibrary, Media.MediaLibraryView>> {
    return this.nuviotClient.getFormResponse<Media.MediaLibrary, Media.MediaLibraryView>(`/api/media/resource/${id}`);
  }

  insertMediaResource(resource: Media.MediaResource): Promise<Core.InvokeResult> {
    return this.nuviotClient.insert<Media.MediaResource>(`/api/media/resource`, resource);
  }

  updateMediaResource(resource: Media.MediaResource): Promise<Core.InvokeResult> {
    return this.nuviotClient.update<Media.MediaResource>(`/api/media/resource`, resource);
  }

  onMediaLibraries() {
    this._libraries$.asObservable();
  }

  onMediaLibrary() {
    this._library$.asObservable();
  }

  onMediaResources() {
    this._resources$.asObservable();
  }

  onMediaResource() {
    this._resource$.asObservable();
  }

  setMediaLibraries(libraries: Media.MediaLibrarySummary[]) {
    this._mediaLibraries = libraries;
    this._libraries$.next(libraries);
  }

  setMediaLibrary(library: Media.MediaLibrary) {
    this._mediaLibrary = library;
    this._library$.next(library);
  }

  setMediaResources(resources: Media.MediaResourceSummary[]) {
    this._mediaResoures = resources;
    this._resources$.next(resources);
  }

  setMediaResource(resource: Media.MediaResource) {
    this._mediaResource = resource;
    this._resource$.next(resource);
  }

  getMediaLibraries() : Media.MediaLibrarySummary[] {
    return this._mediaLibraries;
  }

  getMediaLibrary() : Media.MediaLibrary {
    return this._mediaLibrary;
  }

  getMediaResources() : Media.MediaResourceSummary[] {
    return this._mediaResoures;
  }

  getMediaResource() : Media.MediaResource {
    return this._mediaResource;
  }
}
