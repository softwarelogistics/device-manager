

import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs';
import { NuviotClientService } from './nuviot-client.service';



export class FsliteService {
  private _templates: FSLite.ServiceTicketTemplateSummary[];
  private _template: FSLite.ServiceTicketTemplate;
  private _tickets: FSLite.ServiceTicketSummary[];
  private _ticket: FSLite.ServiceTicket;
  private _boards: FSLite.ServiceBoard[];
  private _board: FSLite.ServiceBoard;
  private _partsKit: FSLite.PartsKit;

  private _templates$ = new ReplaySubject<FSLite.ServiceTicketTemplateSummary[]>();
  private _template$ = new ReplaySubject<FSLite.ServiceTicketTemplate>();
  private _board$ = new ReplaySubject<FSLite.ServiceBoard>();
  private _boards$ = new ReplaySubject<FSLite.ServiceBoard[]>();
  private _tickets$ = new ReplaySubject<FSLite.ServiceTicketSummary[]>();
  private _ticket$ = new ReplaySubject<FSLite.ServiceTicket>();
  private _partsKit$ = new ReplaySubject<FSLite.PartsKit>();

  constructor(private nuviotClient: NuviotClientService) {
  }

  loadTickets(nextRowKey: string = null): Promise<Core.ListResponse<FSLite.ServiceTicketSummary>> {
    const promise = new Promise<Core.ListResponse<FSLite.ServiceTicketSummary>>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceTicketSummary>(`/api/fslite/tickets`, { pageSize: 50, nextRowKey: nextRowKey })
        .then(resp => {
          this.setTickets(resp.model);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTicketsForBoard(boardId: string, nextRowKey: string = null): Promise<Core.ListResponse<FSLite.ServiceTicketSummary>> {
    const promise = new Promise<Core.ListResponse<FSLite.ServiceTicketSummary>>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceTicketSummary>(`/api/fslite/${boardId}/tickets`, { pageSize: 50, nextRowKey: nextRowKey })
        .then(resp => {
          this.setTickets(resp.model);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTicketsForDevice(deviceId: string, nextRowKey: string = null): Promise<Core.ListResponse<FSLite.ServiceTicketSummary>> {
    const promise = new Promise<Core.ListResponse<FSLite.ServiceTicketSummary>>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceTicketSummary>(`/api/fslite/ticket/device/${deviceId}`, { pageSize: 50, nextRowKey: nextRowKey })
        .then(resp => {
          this.setTickets(resp.model);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTicketsWithFilter(filter: FSLite.TicketFilter): Promise<Core.ListResponse<FSLite.ServiceTicketSummary>> {
    const promise = new Promise<Core.ListResponse<FSLite.ServiceTicketSummary>>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceTicketSummary>(`/api/fslite/tickets`)
        .then(resp => {
          this.setTickets(resp.model);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTemplate(id: string): Promise<FSLite.ServiceTicketTemplate> {
    const promise = new Promise<FSLite.ServiceTicketTemplate>((resolve, reject) => {
      this.nuviotClient.request<FSLite.ServiceTicketTemplate>(`/api/fslite/tickets/template/${id}/detail`)
        .then(resp => {
          this.setTemplate(resp);
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadBoards(): Promise<FSLite.ServiceBoard[]> {
    const promise = new Promise<FSLite.ServiceBoard[]>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceBoard>(`/api/fslite/serviceboards`)
        .then(resp => {
          this.setTemplates(resp.model);
          resolve(resp.model);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTemplates(): Promise<FSLite.ServiceTicketTemplateSummary[]> {
    const promise = new Promise<FSLite.ServiceTicketTemplateSummary[]>((resolve, reject) => {
      this.nuviotClient.getListResponse<FSLite.ServiceTicketTemplateSummary>(`/api/fslite/tickets/templates`)
        .then(resp => {
          this.setTemplates(resp.model);
          resolve(resp.model);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  createTicket(ticketRequest: FSLite.CreateServiceTicketRequest): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.insert(`/api/fslite/ticket/create`, ticketRequest)
        .then(resp => {
          const ticketResponse = resp as Core.InvokeResultEx<FSLite.ServiceTicket>;
          this.setTicket(ticketResponse.result);
          resolve(ticketResponse.result);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  addTicketNote(ticketId: string, note: FSLite.ServiceTicketNote): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.postWithResponse<FSLite.ServiceTicketNote, FSLite.ServiceTicket>(`/api/fslite/ticket/${ticketId}/note`, note)
        .then(resp => {
          if (resp.successful) {
            resolve(resp.result);
          } else {
            reject('could not add ticket note');
          }
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  changeTicketStatus(ticketId: string, note: Core.EntityHeader): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.postWithResponse<Core.EntityHeader, FSLite.ServiceTicket>(`/api/fslite/ticket/${ticketId}/status`, note)
        .then(resp => {
          if (resp.successful) {
            resolve(resp.result);
          } else {
            reject('could not set status');
          }
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  setTicketViewedStatus(ticketId: string, viewedStatus: boolean): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.request<Core.InvokeResultEx<FSLite.ServiceTicket>>(`/api/fslite/ticket/${ticketId}/viewed/${viewedStatus}`)
        .then(resp => {
          if (resp.successful) {
            resolve(resp.result);
          } else {
            reject('could not set viewed status');
          }
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  setTicketClosedStatus(ticketId: string, closedStatus: boolean): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.request<Core.InvokeResultEx<FSLite.ServiceTicket>>(`/api/fslite/ticket/${ticketId}/closed/${closedStatus}`)
        .then(resp => {
          if (resp.successful) {
            resolve(resp.result);
          } else {
            reject('could not set closed status');
          }
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadTicket(ticketId: string): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.getFormResponse<FSLite.ServiceTicket, FSLite.ServiceTicketView>(`/api/fslite/ticket/${ticketId}`)
        .then(ticketResponse => {
          this.setTicket(ticketResponse.model);
          resolve(ticketResponse.model);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  loadPartsKit(partsKitId: string): Promise<FSLite.PartsKit> {
    const promise = new Promise<FSLite.PartsKit>((resolve, reject) => {
      this.nuviotClient.request<FSLite.PartsKit>(`/api/fslite/partskit/${partsKitId}/detail`)
        .then(partsKitResponse => {
          this.setPartsKit(partsKitResponse);
          resolve(partsKitResponse);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  updateAssignedTo(ticketId: string, assignedTo: Core.EntityHeader): Promise<FSLite.ServiceTicket> {
    const promise = new Promise<FSLite.ServiceTicket>((resolve, reject) => {
      this.nuviotClient.post<Core.EntityHeader, FSLite.ServiceTicket>(`/api/fslite/ticket/${ticketId}/assignedto`, assignedTo)
        .then(resp => {
          if (resp.successful) {
            resolve(resp.result);
          } else {
            reject('could not update user.');
          }
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  deleteTicket(ticketId: string): Promise<Core.InvokeResult> {
    const promise = new Promise<Core.InvokeResult>((resolve, reject) => {
      this.nuviotClient.delete(`/api/fslite/ticket/${ticketId}`)
        .then(resp => {
          resolve(resp);
        })
        .catch((err) => reject(err));
    });

    return promise;
  }

  onPartsKit(): Observable<FSLite.PartsKit> {
    return this._partsKit$.asObservable();
  }

  onBoard(): Observable<FSLite.ServiceBoard> {
    return this._board$.asObservable();
  }

  onBoards(): Observable<FSLite.ServiceBoard[]> {
    return this._boards$.asObservable();
  }

  onTicket(): Observable<FSLite.ServiceTicket> {
    return this._ticket$.asObservable();
  }

  onTickets(): Observable<FSLite.ServiceTicketSummary[]> {
    return this._tickets$.asObservable();
  }

  onTemplates(): Observable<FSLite.ServiceTicketTemplateSummary[]> {
    return this._templates$.asObservable();
  }

  onTemplate(): Observable<FSLite.ServiceTicketTemplate> {
    return this._template$.asObservable();
  }

  setBoard(board: FSLite.ServiceBoard) {
    this._board = board;
    this._board$.next(board);
  }

  setBoards(boards: FSLite.ServiceBoard[]) {
    this._boards = boards;
    this._boards$.next(boards);
  }

  setTemplate(template: FSLite.ServiceTicketTemplate) {
    this._template = template;
    this._template$.next(template);
  }

  setTicket(ticket: FSLite.ServiceTicket) {
    this._ticket = ticket;
    this._ticket$.next(ticket);
  }

  setTickets(tickets: FSLite.ServiceTicketSummary[]) {
    this._tickets = tickets;
    this._tickets$.next(tickets);
  }

  setTemplates(templats: FSLite.ServiceTicketTemplateSummary[]) {
    this._templates = templats;
    this._templates$.next(templats);
  }

  setPartsKit(partsKit: FSLite.PartsKit) {
    this._partsKit = partsKit;
    this._partsKit$.next(partsKit);
  }

  getBoard(): FSLite.ServiceBoard {
    return this._board;
  }

  getBoards(): FSLite.ServiceBoard[] {
    return this._boards;
  }

  getTicket(): FSLite.ServiceTicket {
    return this._ticket;
  }

  getTickets(): FSLite.ServiceTicketSummary[] {
    return this._tickets;
  }

  getTemplateSummaries(): FSLite.ServiceTicketTemplateSummary[] {
    return this._templates;
  }

  getPartsKit(): FSLite.PartsKit {
    return this._partsKit;
  }
}
