
import { BehaviorSubject, Observable } from 'rxjs';
import { NuvIoTEventEmitter } from '../utils/NuvIoTEventEmitter';


export class NetworkCallStatusService {

    public static busySubscription: NuvIoTEventEmitter = new NuvIoTEventEmitter();
    private static _loadingMessages: String[] = [];

    constructor() { }
    static _activeCallCount: number = 0;

    static beginCall(msg: String = 'loading') {
        this._activeCallCount++;
        this._loadingMessages.push(msg);

        console.log('Begin Active Call Count', this._activeCallCount);
        NetworkCallStatusService.busySubscription.emit('busy', this._activeCallCount);
    }

    static endCall() {
        if (this._activeCallCount > 0) {
            this._activeCallCount--;
            this._loadingMessages.pop();
            if (this._activeCallCount == 0) {
                NetworkCallStatusService.busySubscription.emit('idle', this._activeCallCount);
            }

            console.log('End Active Call Count', this._activeCallCount);
        }
        else {
            throw 'Active call count is already zero at end call.';
        }
    }
}
