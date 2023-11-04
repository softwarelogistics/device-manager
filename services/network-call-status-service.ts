
import { BehaviorSubject, Observable } from 'rxjs';
import { NuvIoTEventEmitter } from '../utils/NuvIoTEventEmitter';


export class NetworkCallStatusService {

    public static busySubscription: NuvIoTEventEmitter = new NuvIoTEventEmitter();
    private static _loadingMessages: String[] = [];

    private static debug = true;

    constructor() { }
    static _activeCallCount: number = 0;

    static beginCall(msg: String = 'loading') {
        this._activeCallCount++;
        this._loadingMessages.push(msg);

        if(NetworkCallStatusService.debug) console.log(`Begin Active Call Count: ${msg} - ${this._activeCallCount}`);
        NetworkCallStatusService.busySubscription.emit('busy', this._activeCallCount);
    }

    static reset() {
        NetworkCallStatusService.busySubscription.emit('idle', this._activeCallCount);
        this._activeCallCount = 0;
        this._loadingMessages = [];
    }

    static endCall() {
        if (this._activeCallCount > 0) {
            this._activeCallCount--;
            let msg = this._loadingMessages.pop();
            if (this._activeCallCount == 0) {
                NetworkCallStatusService.busySubscription.emit('idle', this._activeCallCount);
            }

            if(NetworkCallStatusService.debug) console.log(`End Active Call Count: ${msg} - ${this._activeCallCount}`);
        }
    }
}
