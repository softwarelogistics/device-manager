
import { BehaviorSubject,  Observable } from 'rxjs';
import { NuvIoTEventEmitter } from '../utils/NuvIoTEventEmitter';


export class NetworkCallStatusService {

    public emitter: NuvIoTEventEmitter = new NuvIoTEventEmitter();
    private _loadingMessages: String[] = [];

    constructor() { }
    _activeCallCount: number = 0;


    beginCall() {
        this._activeCallCount++;
        this._loadingMessages.push("loading");

        console.log(this._activeCallCount);
        this.emitter.emit('busy', this._activeCallCount);
    }

    endCall() {
        this._activeCallCount--;
        this._loadingMessages.pop();
        if (this._activeCallCount == 0) {
            this.emitter.emit('idle', this._activeCallCount);
        }

        console.log(this._activeCallCount);
    }
}
