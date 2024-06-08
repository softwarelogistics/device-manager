
import { BehaviorSubject, Observable } from 'rxjs';


export class ErrorReporterService {

  constructor() { }
  private _errorMsgs: Core.ErrorMessage[] = [];
  protected _errorMsgs$ = new BehaviorSubject<Core.ErrorMessage[] | undefined>(this._errorMsgs);

  onErrMsgs(): Observable<Core.ErrorMessage[] | undefined> {
    return this._errorMsgs$.asObservable();
  }

  addErrors(errs: Core.ErrorMessage[] | undefined) {
    console.log(errs);
    if (errs) {
      for (let err of errs) {
        this.addError(err);
        console.log(err);
        alert(err.message);
      }
    }
  }

  addError(err: Core.ErrorMessage) {
    this._errorMsgs$.next([err]);
  }

  addErrorMessage(msg: string) {
    this._errorMsgs$.next([{ message: msg }]);

    console.log('adding error message: ' + msg);

    alert(msg);
  }

  addMessage(msg: string) {
    this.addError({ message: msg });
  }

  addMessages(msgs: string[]) {
    const errs = [];
    for (const msg of msgs) {
      errs.push({ message: msg });
    }

    this.addErrors(errs);
  }

  clearErrors() {
    this._errorMsgs$.next(undefined);
  }
}
